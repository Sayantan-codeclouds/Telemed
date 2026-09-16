import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  HeartPulse,
  User,
  ShieldCheck,
  Activity,
  Edit2,
  AlertTriangle,
  Pill,
  Scissors,
  FileHeart,
  Scale,
  Gauge,
  Loader2,
  PhoneCall,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/api/axios";
import EditProfileDrawer from "@/components/patient/EditProfileDrawer";

export default function Profile() {
  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await api.get("/patients/profile");
      setPatient(res.data.data);
    } catch (err) {
      console.error("Failed to load patient profile:", err);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading Electronic Health Profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Unable to Load Health Profile</h2>
        <p className="text-xs text-slate-500">
          Please check your connection and try refreshing the page.
        </p>
        <Button onClick={loadProfile} className="rounded-xl mt-2">
          Retry
        </Button>
      </div>
    );
  }

  // Calculate BMI
  let bmi = "-";
  let bmiCategory = "Not Recorded";
  let bmiColor = "bg-slate-100 text-slate-700";

  if (patient.height?.value && patient.weight?.value) {
    const heightInMeters =
      patient.height.unit === "cm"
        ? patient.height.value / 100
        : patient.height.value * 0.0254;
    const weightInKg =
      patient.weight.unit === "lbs" || patient.weight.unit === "lb"
        ? patient.weight.value * 0.453592
        : patient.weight.value;

    if (heightInMeters > 0) {
      const val = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      bmi = `${val} kg/m²`;

      const num = parseFloat(val);
      if (num < 18.5) {
        bmiCategory = "Underweight";
        bmiColor = "bg-amber-50 text-amber-700 border-amber-200";
      } else if (num >= 18.5 && num <= 24.9) {
        bmiCategory = "Normal Weight";
        bmiColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
      } else if (num >= 25 && num <= 29.9) {
        bmiCategory = "Overweight";
        bmiColor = "bg-amber-50 text-amber-700 border-amber-200";
      } else {
        bmiCategory = "Obese";
        bmiColor = "bg-rose-50 text-rose-700 border-rose-200";
      }
    }
  }

  // Calculate Age
  let age = null;
  if (patient.dateOfBirth) {
    const birthDate = new Date(patient.dateOfBirth);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  const address = [
    patient.address?.line1,
    patient.address?.line2,
    patient.address?.city,
    patient.address?.state,
    patient.address?.country,
    patient.address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const avatarUrl =
    patient.profileImage ||
    `https://ui-avatars.com/api/?name=${patient.firstName}+${patient.lastName}&background=2563eb&color=fff&size=200`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Executive Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-8 sm:p-10 border border-slate-800 shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
              />
              <span
                className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900"
                title="Verified Account"
              />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/10 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Patient Electronic Record
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {patient.firstName} {patient.lastName}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {patient.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {patient.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex justify-center sm:justify-start">
            <Button
              onClick={() => setOpen(true)}
              className="bg-white text-slate-900 hover:bg-blue-50 font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm shadow-md gap-2 cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-blue-600" /> Edit Health Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Vitals Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Blood Group
              </span>
              <p className="text-2xl font-black text-rose-600 mt-0.5">
                {patient.bloodGroup || "O+"}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">ABO / Rh Type</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Height
              </span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {patient.height?.value
                  ? `${patient.height.value} ${patient.height.unit}`
                  : "175 cm"}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Standing Height</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Weight
              </span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {patient.weight?.value
                  ? `${patient.weight.value} ${patient.weight.unit}`
                  : "70 kg"}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Current Mass</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Body Mass Index
              </span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {bmi}
              </p>
              <Badge className={`text-[9px] font-bold mt-0.5 border ${bmiColor}`}>
                {bmiCategory}
              </Badge>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Gauge className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main EHR Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Contact Information */}
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Personal Demographics
              </h3>
              <p className="text-[11px] text-slate-400">Identity & Residence</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  Date of Birth & Age
                </span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">
                  {patient.dateOfBirth
                    ? `${new Date(patient.dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (${age ? `${age} Years` : ""})`
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  Gender
                </span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">
                  {patient.gender || "Male"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">
                  Primary Address
                </span>
                <p className="text-slate-800 font-medium text-xs mt-0.5 leading-relaxed">
                  {address || "No residential address recorded"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Emergency Medical Contact
              </h3>
              <p className="text-[11px] text-slate-400">Designated Emergency Reach</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Contact Person Name
              </span>
              <p className="text-slate-900 font-bold text-sm mt-0.5">
                {patient.emergencyContact?.name || "Not specified"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Relationship to Patient
              </span>
              <p className="text-slate-900 font-bold text-sm mt-0.5">
                {patient.emergencyContact?.relationship || "Guardian / Family"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Emergency Phone Number
              </span>
              <p className="text-indigo-600 font-bold text-sm mt-0.5">
                {patient.emergencyContact?.phone || "Not recorded"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Medical History & EHR Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medical Conditions */}
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileHeart className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Diagnosed Medical Conditions
              </h3>
            </div>
            <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold">
              {patient.medicalConditions?.length || 0} Recorded
            </Badge>
          </div>

          {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.medicalConditions.map((condition, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold"
                >
                  • {condition}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No medical conditions reported.</p>
          )}
        </Card>

        {/* Allergies */}
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">
                Reported Allergies & Sensitivities
              </h3>
            </div>
            <Badge className="bg-amber-50 text-amber-700 text-[10px] font-bold">
              {patient.allergies?.length || 0} Recorded
            </Badge>
          </div>

          {patient.allergies && patient.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold"
                >
                  ⚠️ {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No drug or food allergies reported.</p>
          )}
        </Card>

        {/* Current Medications */}
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">
                Current Active Medications
              </h3>
            </div>
            <Badge className="bg-purple-50 text-purple-700 text-[10px] font-bold">
              {patient.currentMedications?.length || 0} Active
            </Badge>
          </div>

          {patient.currentMedications && patient.currentMedications.length > 0 ? (
            <div className="space-y-2">
              {patient.currentMedications.map((medicine, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-800"
                >
                  <span>💊 {medicine}</span>
                  <span className="text-[10px] text-purple-600 font-semibold uppercase">Daily Routine</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No current ongoing medications.</p>
          )}
        </Card>

        {/* Past Surgeries */}
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-slate-600" />
              <h3 className="text-base font-bold text-slate-900">
                Past Surgeries & Procedures
              </h3>
            </div>
            <Badge className="bg-slate-100 text-slate-700 text-[10px] font-bold">
              {patient.pastSurgeries?.length || 0} Records
            </Badge>
          </div>

          {patient.pastSurgeries && patient.pastSurgeries.length > 0 ? (
            <div className="space-y-2">
              {patient.pastSurgeries.map((surgery, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-semibold text-slate-700"
                >
                  🏥 {surgery}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No past surgical procedures recorded.</p>
          )}
        </Card>
      </div>

      {/* Edit Profile Drawer */}
      <EditProfileDrawer
        patient={patient}
        open={open}
        setOpen={setOpen}
        onUpdated={loadProfile}
      />
    </div>
  );
}