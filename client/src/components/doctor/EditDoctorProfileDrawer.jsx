import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import {
  Camera,
  Loader2,
  User,
  Stethoscope,
  CreditCard,
  MapPin,
  CheckCircle2,
  Sparkles,
  X,
  FileBadge,
  PenTool,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import doctorApi from "../../api/doctorApi";
import { useCurrency } from "../../contexts/CurrencyContext";
import SignatureStampModal from "./SignatureStampModal";

import api from "../../api/axios";

export default function EditDoctorProfileDrawer({
  doctor,
  open,
  setOpen,
  onUpdated,
}) {
  const { currencySign } = useCurrency();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [openSignatureModal, setOpenSignatureModal] = useState(false);

  // Fetch active specializations from DB
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const { data } = await api.get("/specializations");
        if (data.data && data.data.length > 0) {
          setSpecializations(data.data.map((s) => s.name));
        } else {
          setSpecializations([
            "Cardiologist",
            "Dermatologist",
            "General Physician",
            "Pediatrician",
            "Neurologist",
            "Orthopedic Surgeon",
            "Gynecologist",
            "Psychiatrist",
            "ENT Specialist",
            "Ophthalmologist",
          ]);
        }
      } catch (err) {
        console.error("Failed to load specializations:", err);
      }
    };
    fetchSpecializations();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm();

  // Re-seed the form and photo preview whenever a different doctor is loaded
  // or the drawer is (re)opened, without a set-state-in-effect: this adjusts
  // state during render (React's documented pattern for this), tracking the
  // last [doctor, open] combo the form was seeded from.
  const [seededFrom, setSeededFrom] = useState({ doctor: null, open: false });
  if (doctor && (doctor !== seededFrom.doctor || open !== seededFrom.open)) {
    setSeededFrom({ doctor, open });

    reset({
      firstName: doctor.firstName || "",
      lastName: doctor.lastName || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialization: doctor.specialization || "General Physician",
      hospital: doctor.hospital || "",
      experience: doctor.experience || "",
      qualification: doctor.qualification || "",
      registrationNumber: doctor.registrationNumber || "",
      consultationFee: doctor.consultationFee || 500,
      bio: doctor.bio || "",
      line1: doctor.address?.line1 || "",
      line2: doctor.address?.line2 || "",
      city: doctor.address?.city || "",
      state: doctor.address?.state || "",
      country: doctor.address?.country || "India",
      pincode: doctor.address?.pincode || "",
    });

    setPreview(
      doctor.profileImage ||
        `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=16a34a&color=fff&size=200`
    );
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  const onSubmit = async (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      specialization: data.specialization,
      hospital: data.hospital,
      experience: Number(data.experience) || 0,
      qualification: data.qualification,
      registrationNumber: data.registrationNumber,
      consultationFee: Number(data.consultationFee) || 500,
      bio: data.bio,
      address: {
        line1: data.line1 || "",
        line2: data.line2 || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "India",
        pincode: data.pincode || "",
      },
    };

    try {
      await doctorApi.put("/doctors/profile", payload);
      toast.success("Doctor profile updated successfully!");
      if (onUpdated) onUpdated();
      setOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile."
      );
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await doctorApi.put("/doctors/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPreview(res.data.image || URL.createObjectURL(file));
      toast.success("Practitioner photo uploaded successfully.");
      if (onUpdated) onUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Centered Modal Card */}
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-slate-50 to-blue-50/50 relative">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1 pr-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Edit Practitioner Profile
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Update your qualifications, hospital affiliation, consultation fee, and clinic details
            </p>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-4 no-scrollbar">
            {[
              { id: "personal", label: "Demographics", icon: User },
              { id: "professional", label: "Qualifications", icon: Stethoscope },
              { id: "practice", label: "Consultation & Fees", icon: CreditCard },
              { id: "address", label: "Clinic Address", icon: MapPin },
              { id: "credentials", label: "Signature & Stamp", icon: FileBadge },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Form Body - Scrollable */}
        <form
          id="edit-doctor-form"
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-6 overflow-y-auto flex-1 max-h-[calc(90vh-190px)]"
        >
          {/* 1. Demographics & Photo */}
          {activeTab === "personal" && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Photo Uploader */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="relative shrink-0">
                  <img
                    src={preview}
                    alt="Doctor"
                    className="w-20 h-20 rounded-2xl border-2 border-white shadow-md object-cover"
                  />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900">Profile Picture</h4>
                  <p className="text-[11px] text-slate-500">
                    JPG, PNG or GIF. Max file size 5MB.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" /> Upload Picture
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" {...register("firstName")} required className="rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" {...register("lastName")} required className="rounded-xl" />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="email">Email Address (Registered)</Label>
                  <Input
                    id="email"
                    disabled
                    {...register("email")}
                    className="rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" {...register("phone")} required className="rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* 2. Professional Details */}
          {activeTab === "professional" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="specialization">Primary Specialization *</Label>
                <Controller
                  control={control}
                  name="specialization"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-xl cursor-pointer">
                        <SelectValue placeholder="Select Specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec} className="cursor-pointer">
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hospital">Hospital / Medical Center *</Label>
                <Input id="hospital" placeholder="e.g. Apollo Hospital, Fortis Healthcare" {...register("hospital")} required className="rounded-xl" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input id="experience" type="number" placeholder="e.g. 10" {...register("experience")} className="rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="registrationNumber">Medical License / Reg No.</Label>
                  <Input id="registrationNumber" placeholder="e.g. MCI-2021-9874" {...register("registrationNumber")} className="rounded-xl" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qualification">Degrees & Certifications</Label>
                <Input id="qualification" placeholder="e.g. MBBS, MD (Cardiology), FRCP" {...register("qualification")} className="rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Clinical Bio / Summary</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Describe your clinical expertise, surgical specializations, and patient care approach..."
                  {...register("bio")}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* 3. Practice & Fee Settings */}
          {activeTab === "practice" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="consultationFee">Consultation Fee ({currencySign} per video visit) *</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  placeholder="e.g. 800"
                  {...register("consultationFee")}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Transparent Pricing
                </p>
                <p className="text-[11px] leading-relaxed">
                  This fee is displayed directly to patients during appointment booking and telehealth checkouts.
                </p>
              </div>
            </div>
          )}

          {/* 4. Clinic Address */}
          {activeTab === "address" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="line1">Hospital / Clinic Address Line 1</Label>
                <Input id="line1" placeholder="Department / Clinic Name, Floor, Street" {...register("line1")} className="rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                <Input id="line2" placeholder="Building / Sector" {...register("line2")} className="rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="e.g. Kolkata" {...register("city")} className="rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="e.g. West Bengal" {...register("state")} className="rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="e.g. India" {...register("country")} className="rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pincode">PIN / Postal Code</Label>
                  <Input id="pincode" placeholder="e.g. 700091" {...register("pincode")} className="rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* 5. Clinical Credentials: Signature & Clinic Stamp */}
          {activeTab === "credentials" && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <FileBadge className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-1">
                  <p className="font-bold">Digital Signature & Clinical Seal Authentication</p>
                  <p className="text-blue-700 leading-relaxed">
                    Set up your electronic signature (drawn or uploaded) and official clinic stamp. These credentials automatically authenticate your virtual prescriptions and downloadable PDF medical records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Signature Preview */}
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-blue-600" /> Digital Signature
                    </span>
                    {doctor.signature ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Not set</span>
                    )}
                  </div>
                  <div className="h-20 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center p-2">
                    {doctor.signature ? (
                      <img src={doctor.signature} alt="Signature" className="max-h-16 max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">No signature set</span>
                    )}
                  </div>
                </div>

                {/* Stamp Preview */}
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileBadge className="w-3.5 h-3.5 text-blue-600" /> Clinic Stamp / Seal
                    </span>
                    {doctor.clinicStamp ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Not set</span>
                    )}
                  </div>
                  <div className="h-20 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center p-2">
                    {doctor.clinicStamp ? (
                      <img src={doctor.clinicStamp} alt="Clinic Stamp" className="max-h-16 max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">No stamp uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setOpenSignatureModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-11 text-xs gap-2 shadow-sm cursor-pointer"
              >
                <PenTool className="w-4 h-4" /> Open Interactive Signature Pad & Stamp Studio
              </Button>
            </div>
          )}
        </form>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl h-10 px-5 text-xs font-bold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="edit-doctor-form"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-6 text-xs gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Save Practitioner Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Signature & Stamp Modal */}
      <SignatureStampModal
        isOpen={openSignatureModal}
        onClose={() => setOpenSignatureModal(false)}
        doctor={doctor}
        onUpdated={(updated) => {
          if (onUpdated) onUpdated(updated);
        }}
      />
    </div>
  );
}
