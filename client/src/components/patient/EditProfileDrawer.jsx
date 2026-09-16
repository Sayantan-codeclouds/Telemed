import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Camera,
  Loader2,
  User,
  HeartPulse,
  MapPin,
  PhoneCall,
  FileHeart,
  AlertTriangle,
  Pill,
  Scissors,
  CheckCircle2,
  Sparkles,
  Droplet,
  Scale,
  Activity,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];

const QUICK_CONDITIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "Asthma",
  "Thyroid Disorder",
  "Migraine",
  "Acid Reflux (GERD)",
  "High Cholesterol",
  "Arthritis",
];

const QUICK_ALLERGIES = [
  "Penicillin",
  "Peanuts",
  "Sulfa Drugs",
  "Aspirin",
  "Shellfish",
  "Latex",
  "Pollen",
  "NSAIDs",
];

const QUICK_MEDICATIONS = [
  "Metformin 500mg",
  "Atorvastatin 10mg",
  "Amlodipine 5mg",
  "Omeprazole 20mg",
  "Paracetamol 650mg",
  "Cetirizine 10mg",
  "Vitamin D3",
];

const QUICK_SURGERIES = [
  "Appendectomy",
  "Knee Arthroscopy",
  "Cesarean Section",
  "Tonsillectomy",
  "Gallbladder Removal",
  "Cataract Surgery",
];

const RELATIONSHIPS = ["Spouse", "Parent", "Sibling", "Child", "Guardian", "Friend", "Relative"];

/**
 * Interactive Tag Input Component
 */
function TagInputSection({
  label,
  icon: Icon,
  tags,
  setTags,
  placeholder,
  suggestions = [],
  colorScheme = "blue", // "blue" | "amber" | "purple" | "slate"
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" is already added.`);
      return;
    }
    setTags([...tags, trimmed]);
    setInputValue("");
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const colorStyles = {
    blue: {
      badge: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
      sugg: "text-blue-700 bg-blue-50/70 border-blue-200 hover:bg-blue-100",
      icon: "text-blue-600",
    },
    amber: {
      badge: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
      btn: "bg-amber-600 hover:bg-amber-700 text-white",
      sugg: "text-amber-800 bg-amber-50/70 border-amber-200 hover:bg-amber-100",
      icon: "text-amber-600",
    },
    purple: {
      badge: "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100",
      btn: "bg-purple-600 hover:bg-purple-700 text-white",
      sugg: "text-purple-700 bg-purple-50/70 border-purple-200 hover:bg-purple-100",
      icon: "text-purple-600",
    },
    slate: {
      badge: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
      btn: "bg-slate-800 hover:bg-slate-900 text-white",
      sugg: "text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200",
      icon: "text-slate-600",
    },
  }[colorScheme];

  return (
    <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <Icon className={`w-4 h-4 ${colorStyles.icon}`} />
          {label}
        </Label>
        <span className="text-[11px] font-bold text-slate-400">
          {tags.length} Recorded
        </span>
      </div>

      {/* Active Tags */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${colorStyles.badge}`}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                className="hover:opacity-70 rounded-full p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic py-1">No items added yet.</p>
      )}

      {/* Input + Add button */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="rounded-xl text-xs h-10 bg-slate-50 border-slate-200 focus:bg-white"
        />
        <Button
          type="button"
          onClick={() => handleAddTag(inputValue)}
          disabled={!inputValue.trim()}
          size="sm"
          className={`h-10 px-4 rounded-xl text-xs font-bold gap-1 cursor-pointer shrink-0 ${colorStyles.btn}`}
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Suggestions (Click to Add):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions
              .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
              .map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddTag(s)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${colorStyles.sugg}`}
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditProfileDrawer({
  patient,
  open,
  setOpen,
  onUpdated,
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male",
    bloodGroup: "O+",
    dateOfBirth: "",
    heightValue: "",
    heightUnit: "cm",
    weightValue: "",
    weightUnit: "kg",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    emergencyName: "",
    emergencyRelationship: "Spouse",
    emergencyPhone: "",
  });

  // Tag Lists for Medical History
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [currentMedications, setCurrentMedications] = useState([]);
  const [pastSurgeries, setPastSurgeries] = useState([]);

  const tabs = [
    { id: "personal", label: "Demographics", icon: User },
    { id: "vitals", label: "Physical Vitals & BMI", icon: HeartPulse },
    { id: "address", label: "Address", icon: MapPin },
    { id: "emergency", label: "Emergency Contact", icon: PhoneCall },
    { id: "history", label: "Medical History & EHR", icon: FileHeart },
  ];

  useEffect(() => {
    if (!patient) return;

    setFormData({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      email: patient.email || "",
      phone: patient.phone || "",
      gender: patient.gender || "Male",
      bloodGroup: patient.bloodGroup || "O+",
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.substring(0, 10) : "",
      heightValue: patient.height?.value ? String(patient.height.value) : "",
      heightUnit: patient.height?.unit || "cm",
      weightValue: patient.weight?.value ? String(patient.weight.value) : "",
      weightUnit: patient.weight?.unit || "kg",
      line1: patient.address?.line1 || "",
      line2: patient.address?.line2 || "",
      city: patient.address?.city || "",
      state: patient.address?.state || "",
      country: patient.address?.country || "India",
      pincode: patient.address?.pincode || "",
      emergencyName: patient.emergencyContact?.name || "",
      emergencyRelationship: patient.emergencyContact?.relationship || "Spouse",
      emergencyPhone: patient.emergencyContact?.phone || "",
    });

    setMedicalConditions(patient.medicalConditions || []);
    setAllergies(patient.allergies || []);
    setCurrentMedications(patient.currentMedications || []);
    setPastSurgeries(patient.pastSurgeries || []);

    setPreview(
      patient.profileImage ||
        `https://ui-avatars.com/api/?name=${patient.firstName || "P"}+${patient.lastName || "T"}&background=2563eb&color=fff&size=200`
    );
  }, [patient, open]);

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Real-Time BMI Calculation Preview
  const computedBMI = useMemo(() => {
    const h = parseFloat(formData.heightValue);
    const w = parseFloat(formData.weightValue);
    if (!h || !w || h <= 0 || w <= 0) return null;

    const heightInMeters = formData.heightUnit === "cm" ? h / 100 : h * 0.0254;
    const weightInKg =
      formData.weightUnit === "lbs" || formData.weightUnit === "lb" ? w * 0.453592 : w;

    if (heightInMeters <= 0) return null;

    const bmiVal = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
    const num = parseFloat(bmiVal);

    let category = "Normal";
    let color = "text-emerald-700 bg-emerald-50 border-emerald-200";
    let note = "Optimal healthy body weight range.";

    if (num < 18.5) {
      category = "Underweight";
      color = "text-amber-700 bg-amber-50 border-amber-200";
      note = "Nutritional counseling recommended.";
    } else if (num >= 18.5 && num <= 24.9) {
      category = "Normal Weight";
      color = "text-emerald-700 bg-emerald-50 border-emerald-200";
      note = "Healthy cardiovascular & metabolic range.";
    } else if (num >= 25 && num <= 29.9) {
      category = "Overweight";
      color = "text-amber-700 bg-amber-50 border-amber-200";
      note = "Dietary moderation and exercise advised.";
    } else {
      category = "Obese";
      color = "text-rose-700 bg-rose-50 border-rose-200";
      note = "Clinical lifestyle modification advised.";
    }

    return { value: bmiVal, category, color, note };
  }, [formData.heightValue, formData.heightUnit, formData.weightValue, formData.weightUnit]);

  // Real-Time Age Computation
  const computedAge = useMemo(() => {
    if (!formData.dateOfBirth) return null;
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? `${age} Years Old` : null;
  }, [formData.dateOfBirth]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required.");
      return;
    }

    setSubmitting(true);
    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      dateOfBirth: formData.dateOfBirth || null,
      height: {
        value: formData.heightValue ? Number(formData.heightValue) : null,
        unit: formData.heightUnit || "cm",
      },
      weight: {
        value: formData.weightValue ? Number(formData.weightValue) : null,
        unit: formData.weightUnit || "kg",
      },
      address: {
        line1: formData.line1.trim(),
        line2: formData.line2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        pincode: formData.pincode.trim(),
      },
      emergencyContact: {
        name: formData.emergencyName.trim(),
        relationship: formData.emergencyRelationship.trim(),
        phone: formData.emergencyPhone.trim(),
      },
      medicalConditions,
      allergies,
      currentMedications,
      pastSurgeries,
    };

    try {
      await api.put("/patients/profile", payload);
      toast.success("Health profile & EHR updated successfully!");
      if (onUpdated) onUpdated();
      setOpen(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error.response?.data?.message || "Unable to update health profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    try {
      const form = new FormData();
      form.append("photo", file);

      const res = await api.put("/patients/profile/photo", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPreview(res.data.image || URL.createObjectURL(file));
      toast.success("Profile photo updated successfully!");
      if (onUpdated) onUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || "Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleNextTab = () => {
    const currentIdx = tabs.findIndex((t) => t.id === activeTab);
    if (currentIdx < tabs.length - 1) {
      setActiveTab(tabs[currentIdx + 1].id);
    }
  };

  const handlePrevTab = () => {
    const currentIdx = tabs.findIndex((t) => t.id === activeTab);
    if (currentIdx > 0) {
      setActiveTab(tabs[currentIdx - 1].id);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl lg:max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200/80 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/50 relative">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1.5 pr-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  Edit Health Profile & EHR
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                    ● Active Chart
                  </Badge>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Manage patient demographics, physical vitals, emergency contacts, and clinical history
                </p>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-5 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Form Content */}
        <form
          id="edit-profile-form"
          onSubmit={handleSubmitForm}
          className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1 max-h-[calc(92vh-190px)] bg-slate-50/50"
        >
          {/* TAB 1: Demographics */}
          {activeTab === "personal" && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Photo Uploader Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="relative shrink-0 group">
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-24 h-24 rounded-3xl border-4 border-white shadow-md object-cover ring-2 ring-blue-100"
                  />
                  {uploadingPhoto ? (
                    <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white cursor-pointer"
                    >
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold">Change</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Profile Photograph</h4>
                    <p className="text-xs text-slate-500">
                      Upload a clear headshot photo for your telemedicine medical records (JPG, PNG, max 5MB).
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-200"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" /> Upload New Photo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Name & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-bold text-slate-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    required
                    placeholder="e.g. Rahul"
                    className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-bold text-slate-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    required
                    placeholder="e.g. Sharma"
                    className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Registered Email Address</span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Patient Account
                    </span>
                  </Label>
                  <Input
                    id="email"
                    disabled
                    value={formData.email}
                    className="rounded-xl h-11 bg-slate-100/90 text-slate-500 cursor-not-allowed font-medium text-xs sm:text-sm border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    placeholder="e.g. +91 98765 43210"
                    className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Date of Birth</span>
                    {computedAge && (
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {computedAge}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm font-medium"
                  />
                </div>

                {/* Gender Pill Selector */}
                <div className="space-y-2 sm:col-span-2 pt-2">
                  <Label className="text-xs font-bold text-slate-700">Biological Gender</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleChange("gender", g)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                          formData.gender === g
                            ? "bg-blue-50 border-blue-400 text-blue-800 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{g}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Physical Vitals & BMI */}
          {activeTab === "vitals" && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Blood Group Matrix */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-rose-600" />
                    Select Blood Group (ABO / Rh)
                  </Label>
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-xs font-bold">
                    Selected: {formData.bloodGroup}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => handleChange("bloodGroup", bg)}
                      className={`flex flex-col items-center justify-center py-3 rounded-2xl text-xs font-black transition cursor-pointer border ${
                        formData.bloodGroup === bg
                          ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{bg}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Height & Weight Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="space-y-2">
                  <Label htmlFor="heightValue" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" /> Height
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="heightValue"
                      type="number"
                      placeholder="e.g. 175"
                      value={formData.heightValue}
                      onChange={(e) => handleChange("heightValue", e.target.value)}
                      className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm font-bold flex-1"
                    />
                    <select
                      value={formData.heightUnit}
                      onChange={(e) => handleChange("heightUnit", e.target.value)}
                      className="rounded-xl bg-slate-100 border border-slate-200 px-3 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightValue" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-indigo-600" /> Weight
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="weightValue"
                      type="number"
                      placeholder="e.g. 70"
                      value={formData.weightValue}
                      onChange={(e) => handleChange("weightValue", e.target.value)}
                      className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm font-bold flex-1"
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) => handleChange("weightUnit", e.target.value)}
                      className="rounded-xl bg-slate-100 border border-slate-200 px-3 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Real-Time BMI Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Live Body Mass Index (BMI) Preview
                    </span>
                  </div>
                  {computedBMI && (
                    <Badge className={`text-xs font-bold border ${computedBMI.color}`}>
                      {computedBMI.category}
                    </Badge>
                  )}
                </div>

                {computedBMI ? (
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-3xl font-black text-slate-900">
                        {computedBMI.value} <span className="text-xs font-bold text-slate-500">kg/m²</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">{computedBMI.note}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-xs">
                      <HeartPulse className="w-6 h-6" />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Enter both height and weight above to see your dynamic BMI calculation and health category.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Address */}
          {activeTab === "address" && (
            <div className="space-y-4 animate-in fade-in-50 duration-200 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Residential Address Details
                </h4>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="line1" className="text-xs font-bold text-slate-700">
                  Address Line 1 (Street / House No.)
                </Label>
                <Input
                  id="line1"
                  value={formData.line1}
                  onChange={(e) => handleChange("line1", e.target.value)}
                  placeholder="e.g. Flat 4B, Greenwood Apartments, 12 Park Street"
                  className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="line2" className="text-xs font-bold text-slate-700">
                  Address Line 2 (Apartment / Locality / Landmark)
                </Label>
                <Input
                  id="line2"
                  value={formData.line2}
                  onChange={(e) => handleChange("line2", e.target.value)}
                  placeholder="e.g. Near City Center Mall"
                  className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-bold text-slate-700">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="e.g. Kolkata"
                    className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-bold text-slate-700">
                    State / Province
                  </Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    placeholder="e.g. West Bengal"
                    className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-bold text-slate-700">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="e.g. India"
                    className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pincode" className="text-xs font-bold text-slate-700">
                    PIN / Postal Code
                  </Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    placeholder="e.g. 700091"
                    className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Emergency Contact */}
          {activeTab === "emergency" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <PhoneCall className="w-4 h-4 text-rose-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Designated Emergency Medical Reach
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Physicians and clinical staff will contact this individual in case of medical urgent situations.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyName" className="text-xs font-bold text-slate-700">
                  Contact Person Full Name
                </Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName}
                  onChange={(e) => handleChange("emergencyName", e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm"
                />
              </div>

              {/* Relationship Chips */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Relationship to Patient</Label>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIPS.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => handleChange("emergencyRelationship", rel)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        formData.emergencyRelationship === rel
                          ? "bg-rose-50 border-rose-400 text-rose-800 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
                <Input
                  value={formData.emergencyRelationship}
                  onChange={(e) => handleChange("emergencyRelationship", e.target.value)}
                  placeholder="Or enter custom relationship"
                  className="rounded-xl h-9 bg-slate-50 border-slate-200 focus:bg-white text-xs mt-1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyPhone" className="text-xs font-bold text-slate-700">
                  Emergency Phone Number
                </Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="rounded-xl h-11 bg-slate-50 border-slate-200 focus:bg-white text-xs sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB 5: Medical History & EHR */}
          {activeTab === "history" && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              {/* 1. Medical Conditions */}
              <TagInputSection
                label="Diagnosed Medical Conditions & Chronic Illnesses"
                icon={FileHeart}
                tags={medicalConditions}
                setTags={setMedicalConditions}
                placeholder="Type a condition and press Enter (e.g. Type 2 Diabetes)"
                suggestions={QUICK_CONDITIONS}
                colorScheme="blue"
              />

              {/* 2. Allergies & Sensitivities */}
              <TagInputSection
                label="Reported Allergies & Drug Sensitivities"
                icon={AlertTriangle}
                tags={allergies}
                setTags={setAllergies}
                placeholder="Type an allergy and press Enter (e.g. Penicillin, Peanuts)"
                suggestions={QUICK_ALLERGIES}
                colorScheme="amber"
              />

              {/* 3. Current Ongoing Medications */}
              <TagInputSection
                label="Current Ongoing Prescription & OTC Medications"
                icon={Pill}
                tags={currentMedications}
                setTags={setCurrentMedications}
                placeholder="Type medicine name with dosage and press Enter (e.g. Metformin 500mg)"
                suggestions={QUICK_MEDICATIONS}
                colorScheme="purple"
              />

              {/* 4. Past Surgeries & Procedures */}
              <TagInputSection
                label="Past Surgeries & Major Medical Procedures"
                icon={Scissors}
                tags={pastSurgeries}
                setTags={setPastSurgeries}
                placeholder="Type past surgery and press Enter (e.g. Appendectomy 2022)"
                suggestions={QUICK_SURGERIES}
                colorScheme="slate"
              />
            </div>
          )}
        </form>

        {/* Sticky Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white/95 sticky bottom-0 z-20 backdrop-blur-md flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl h-10 px-4 text-xs font-bold cursor-pointer border-slate-200"
            >
              Cancel
            </Button>

            {activeTab !== "personal" && (
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevTab}
                className="rounded-xl h-10 px-3 text-xs font-bold gap-1 cursor-pointer text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Step
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== "history" && (
              <Button
                type="button"
                variant="outline"
                onClick={handleNextTab}
                className="rounded-xl h-10 px-4 text-xs font-bold gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            <Button
              type="submit"
              form="edit-profile-form"
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl h-10 px-6 text-xs gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Health Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}