import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Camera,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  Shield,
  Upload,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";
import { getProfileImageUrl } from "@/utils/imageUrl";

export default function AdminProfile() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Profile Info Form State
  const [infoForm, setInfoForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [updatingInfo, setUpdatingInfo] = useState(false);

  // Photo Upload State
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Fetch admin profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.get("/admin/profile");
      const adminData = data.data;
      setProfile(adminData);
      setInfoForm({
        firstName: adminData.firstName || "",
        lastName: adminData.lastName || "",
        phone: adminData.phone || "",
      });
      setAvatarPreview(adminData.profileImage || null);

      // Update local storage copy
      const stored = JSON.parse(localStorage.getItem("admin") || "{}");
      localStorage.setItem(
        "admin",
        JSON.stringify({
          ...stored,
          ...adminData,
        })
      );
    } catch (err) {
      console.error("Failed to load admin profile:", err);
      toast.error(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Photo File Selection & Upload
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const { data } = await adminApi.put("/admin/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile photo updated successfully!");
      setProfile((prev) => ({
        ...prev,
        profileImage: data.image,
      }));
      setAvatarPreview(data.image);

      // Update localStorage so header and sidebar reflect immediately
      const stored = JSON.parse(localStorage.getItem("admin") || "{}");
      localStorage.setItem(
        "admin",
        JSON.stringify({
          ...stored,
          profileImage: data.image,
        })
      );
      // Trigger storage event so other components update if listening
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Failed to upload profile photo:", err);
      toast.error(err.response?.data?.message || "Failed to upload photo.");
      setAvatarPreview(profile?.profileImage || null);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Personal Info Update
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!infoForm.firstName.trim() || !infoForm.lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }

    setUpdatingInfo(true);
    try {
      const { data } = await adminApi.put("/admin/profile", infoForm);
      toast.success(data.message || "Profile updated successfully!");
      setProfile(data.data);

      const stored = JSON.parse(localStorage.getItem("admin") || "{}");
      localStorage.setItem(
        "admin",
        JSON.stringify({
          ...stored,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          phone: data.data.phone,
        })
      );
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setUpdatingInfo(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { data } = await adminApi.patch("/admin/profile/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success(data.message || "Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Failed to update password:", err);
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">
          Loading administrator profile...
        </p>
      </div>
    );
  }

  const roleConfig = {
    SuperAdmin: {
      label: "Super Administrator",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      gradient: "from-purple-900 via-indigo-900 to-slate-900",
      description: "Full system authority across all modules, API credentials, and administrative accounts.",
    },
    Admin: {
      label: "Administrator",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      gradient: "from-blue-900 via-indigo-900 to-slate-900",
      description: "Operational management across patients, practitioners, pharmacy inventory, and appointments.",
    },
    CustomerSupport: {
      label: "Customer Support Specialist",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      gradient: "from-emerald-900 via-teal-900 to-slate-900",
      description: "Frontline support desk, order fulfillment assistance, customer checkout, and invoice dispatch.",
    },
  };

  const currentRole = roleConfig[profile?.role] || roleConfig.Admin;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" /> Account & Security Profile
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage your personal administrative identity, custom avatar photo, and authentication credentials
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${currentRole.badgeClass} font-bold text-xs px-3 py-1 rounded-xl shadow-xs`}
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {currentRole.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Account Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white overflow-hidden text-center p-6">
            {/* Avatar Circle with Camera Overlay */}
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-md border-4 border-white bg-slate-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={getProfileImageUrl(avatarPreview, `${profile?.firstName} ${profile?.lastName}`)}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-tr ${currentRole.gradient} flex items-center justify-center text-white text-3xl font-black`}
                  >
                    {profile?.firstName?.[0] || "A"}
                    {profile?.lastName?.[0] || "D"}
                  </div>
                )}
              </div>

              {/* Uploading Spinner Overlay */}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-slate-900/60 rounded-3xl flex flex-col items-center justify-center text-white text-[10px] font-bold">
                  <Loader2 className="w-6 h-6 animate-spin mb-1 text-white" />
                  Updating...
                </div>
              )}

              {/* Interactive Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Change Profile Picture"
                className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer border-2 border-white"
              >
                <Camera className="w-5 h-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile?.email}</p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Account
              </span>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col gap-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                variant="outline"
                className="w-full text-xs font-bold rounded-xl h-9 gap-2 cursor-pointer hover:bg-slate-50"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                {profile?.profileImage ? "Change Photo" : "Upload Photo"}
              </Button>
            </div>
          </Card>

          {/* Scope & Role Permissions Card */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Assigned Role Scope
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentRole.description}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center justify-between">
                <span>Account Role:</span>
                <span className="font-bold text-slate-900">{profile?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created Date:</span>
                <span className="font-bold text-slate-900">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "Standard"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Internal Staff ID:</span>
                <span className="font-mono text-slate-700 font-bold">
                  {profile?._id?.slice(-8).toUpperCase() || "ADMIN"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Forms (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Personal Information */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Personal Information
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Update your display name and contact details across system notifications and audit logs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="e.g. John"
                      value={infoForm.firstName}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, firstName: e.target.value })
                      }
                      required
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-bold text-slate-700">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="e.g. Doe"
                      value={infoForm.lastName}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, lastName: e.target.value })
                      }
                      required
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="rounded-xl h-10 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400">
                      Primary administrative account login address (fixed)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="e.g. +1 (555) 234-5678"
                      value={infoForm.phone}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, phone: e.target.value })
                      }
                      className="rounded-xl h-10 text-xs"
                    />
                    <span className="text-[10px] text-slate-400">
                      Contact number for system alerts and staff dispatch
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={updatingInfo}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-5 text-xs gap-2 shadow-xs cursor-pointer"
                  >
                    {updatingInfo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Save Profile Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Card 2: Security & Password Management */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Change Password
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Update your administrative login password to ensure security compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="currentPassword"
                    className="text-xs font-bold text-slate-700"
                  >
                    Current Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPass ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                      className="rounded-xl h-10 text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="newPassword"
                      className="text-xs font-bold text-slate-700"
                    >
                      New Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPass ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        className="rounded-xl h-10 text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs font-bold text-slate-700"
                    >
                      Confirm New Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        className="rounded-xl h-10 text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-slate-400">
                    Passwords must be at least 8 characters long with a mix of letters and numbers.
                  </p>
                  <Button
                    type="submit"
                    disabled={updatingPassword}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-10 px-5 text-xs gap-2 shadow-xs cursor-pointer"
                  >
                    {updatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
