import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  Stethoscope,
  Award,
  CreditCard,
  MapPin,
  ShieldCheck,
  Edit2,
  CalendarDays,
  FileBadge,
  Clock,
  Video,
  Loader2,
  AlertCircle,
  Sparkles,
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  PenTool,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import doctorApi from "@/api/doctorApi";
import EditDoctorProfileDrawer from "@/components/doctor/EditDoctorProfileDrawer";
import SignatureStampModal from "@/components/doctor/SignatureStampModal";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function DoctorProfile() {
  const { formatPrice, currencySign } = useCurrency();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [openSignatureModal, setOpenSignatureModal] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [replyInputs, setReplyInputs] = useState({});
  const [submittingReplyId, setSubmittingReplyId] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await doctorApi.get("/doctors/profile");
      setDoctor(res.data.data);
      localStorage.setItem("doctor", JSON.stringify(res.data.data));
    } catch (error) {
      console.error("Failed to load doctor profile:", error);
      toast.error("Failed to load practitioner profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await doctorApi.get("/reviews/doctor-received");
      setReviews(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load received reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, []);

  const handleReplySubmit = async (reviewId) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text || text.length === 0) {
      return toast.error("Please enter a reply message.");
    }

    setSubmittingReplyId(reviewId);
    try {
      await doctorApi.post(`/reviews/${reviewId}/reply`, { replyText: text });
      toast.success("Reply posted successfully.");
      setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post reply.");
    } finally {
      setSubmittingReplyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-500">Loading Doctor Profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Doctor Profile Not Found</h2>
        <p className="text-xs text-slate-500">
          Please check your connection or re-authenticate.
        </p>
        <Button onClick={fetchProfile} className="rounded-xl mt-2">
          Retry
        </Button>
      </div>
    );
  }

  const avatarUrl =
    doctor.profileImage ||
    `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=16a34a&color=ffffff&size=200`;

  const address = [
    doctor.address?.line1,
    doctor.address?.line2,
    doctor.address?.city,
    doctor.address?.state,
    doctor.address?.country,
    doctor.address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const avgRating = doctor.averageRating ? doctor.averageRating.toFixed(1) : "5.0";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Executive Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-10 border border-slate-800 shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt="Doctor Profile"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
              />
              <span
                className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900"
                title="Practitioner Verified"
              />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/10 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Licensed Practitioner
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  {doctor.specialization || "General Physician"}
                </Badge>
                <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-2.5 py-1 rounded-xl">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {avgRating} ({doctor.totalReviews || reviews.length} Reviews)
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {doctor.hospital || "TeleClinic Medical Network"}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {doctor.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {doctor.phone || "Not recorded"}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex justify-center sm:justify-start">
            <Button
              onClick={() => setOpenEdit(true)}
              className="bg-white text-slate-900 hover:bg-emerald-50 font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm shadow-md gap-2 cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-emerald-600" /> Edit Profile Details
            </Button>
          </div>
        </div>
      </div>

      {/* Clinical Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Patient Rating
              </span>
              <p className="text-2xl font-black text-amber-600 mt-0.5 flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                {avgRating}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">
                {doctor.totalReviews || reviews.length} Total Reviews
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Consultation Fee
              </span>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">
                {formatPrice(doctor.consultationFee ?? 500)}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Per Session</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Experience
              </span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {doctor.experience || 0}+ Years
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Clinical Practice</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                License / Reg
              </span>
              <p className="text-sm font-black text-slate-900 mt-1 truncate max-w-[130px]" title={doctor.licenseNumber || "MCI Certified"}>
                {doctor.licenseNumber || "MCI Certified"}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Verified Active</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileBadge className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Professional Qualifications & Bio */}
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Qualifications & Clinical Expertise
              </h3>
              <p className="text-[11px] text-slate-400">Medical Credentials</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Degrees & Certifications
              </span>
              <p className="text-slate-900 font-bold text-sm mt-0.5">
                {doctor.qualification || "MBBS, MD"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Clinical Specialization
              </span>
              <p className="text-slate-900 font-bold text-sm mt-0.5">
                {doctor.specialization || "General Medicine"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Clinical Biography
              </span>
              <p className="text-slate-700 font-medium leading-relaxed mt-0.5">
                {doctor.biography || "Dedicated healthcare specialist committed to providing comprehensive, evidence-based virtual care."}
              </p>
            </div>
          </div>
        </Card>

        {/* Clinic Address & Contact Information */}
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hospital / Clinic Facility
              </h3>
              <p className="text-[11px] text-slate-400">Workplace & Address</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Primary Hospital Affiliation
              </span>
              <p className="text-slate-900 font-bold text-sm mt-0.5">
                {doctor.hospital || "TeleClinic Healthcare Network"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Practice Location Address
              </span>
              <p className="text-slate-700 font-medium leading-relaxed mt-0.5">
                {address || "Hospital OPD, TeleClinic Virtual Healthcare Center"}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">
                Active Weekly Schedule Days
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {doctor.availability?.filter((d) => d.enabled).map((d) => (
                  <span
                    key={d.day}
                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-xl"
                  >
                    {d.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* ── Clinical Credentials: Digital Signature & Clinic Stamp ── */}
      {/* ============================================================ */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Clinical Credentials & Authentication Seal
              </h3>
              <p className="text-xs text-slate-400">
                Your official digital signature and hospital stamp embedded into virtual prescriptions and PDF records
              </p>
            </div>
          </div>

          <Button
            onClick={() => setOpenSignatureModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-10 px-4 text-xs gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <PenTool className="w-3.5 h-3.5" /> Manage Signature & Stamp
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Digital Signature Box */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-3 h-3 text-blue-600" /> Digital Signature
              </span>
              {doctor.signature ? (
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Active & Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px]">
                  Pending Setup
                </Badge>
              )}
            </div>

            <div className="h-24 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center p-2">
              {doctor.signature ? (
                <img
                  src={doctor.signature}
                  alt="Doctor Signature"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <p className="font-semibold">No digital signature configured</p>
                  <p className="text-[10px] text-slate-400">Click manage above to draw or upload</p>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              Digitally signs every medical prescription and consultation record issued under your license.
            </p>
          </div>

          {/* Clinic Stamp Box */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-blue-600" /> Official Hospital / Clinic Stamp
              </span>
              {doctor.clinicStamp ? (
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Seal Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px]">
                  Pending Setup
                </Badge>
              )}
            </div>

            <div className="h-24 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center p-2">
              {doctor.clinicStamp ? (
                <img
                  src={doctor.clinicStamp}
                  alt="Clinic Stamp"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <p className="font-semibold">No clinic stamp uploaded</p>
                  <p className="text-[10px] text-slate-400">Click manage above to upload or generate seal</p>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              Authenticates prescriptions with your clinical facility seal and medical council license registration.
            </p>
          </div>
        </div>
      </Card>

      {/* ============================================================ */}
      {/* ── Patient Reviews & Feedback Section ── */}
      {/* ============================================================ */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Patient Reviews & Feedback ({reviews.length})
              </h3>
              <p className="text-xs text-slate-400">
                Reviews received from your telemedicine patients • Reply to share clinical advice or acknowledgment
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-2xl border border-amber-200 self-start sm:self-auto">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-sm font-black text-amber-900">{avgRating} Average Rating</span>
          </div>
        </div>

        {loadingReviews ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs font-semibold">Loading patient feedback...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-100 p-6">
            <Star className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Patient Reviews Yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Reviews left by patients after their completed video consultations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => {
              const reviewerName = r.isAnonymous
                ? "Verified Patient (Anonymous)"
                : `${r.patient?.firstName || "Patient"} ${r.patient?.lastName || ""}`.trim();

              const avatar = r.isAnonymous
                ? `https://ui-avatars.com/api/?name=Verified+Patient&background=64748b&color=fff`
                : r.patient?.profileImage ||
                  `https://ui-avatars.com/api/?name=${reviewerName}&background=0284c7&color=fff`;

              const isReplying = submittingReplyId === r._id;

              return (
                <div
                  key={r._id}
                  className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-xs transition space-y-3.5"
                >
                  {/* Review Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar}
                        alt={reviewerName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {reviewerName}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Reviewed on {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-amber-800">
                        {r.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Comment (if provided) */}
                  {r.review && (
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{r.review}"
                    </p>
                  )}

                  {/* Tags */}
                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {r.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold bg-white text-slate-600 px-2.5 py-0.5 rounded-lg border border-slate-200"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Existing Reply */}
                  {r.doctorReply?.comment ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Your Reply:</span>
                        <span className="text-[10px] text-emerald-600 font-normal ml-auto">
                          {r.doctorReply.repliedAt
                            ? new Date(r.doctorReply.repliedAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-emerald-800 font-medium leading-relaxed">
                        {r.doctorReply.comment}
                      </p>
                    </div>
                  ) : (
                    /* Reply Box */
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type a polite clinical reply or thank you..."
                        value={replyInputs[r._id] || ""}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({
                            ...prev,
                            [r._id]: e.target.value,
                          }))
                        }
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={isReplying || !replyInputs[r._id]?.trim()}
                        onClick={() => handleReplySubmit(r._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-9 px-4 gap-1.5 shrink-0 cursor-pointer"
                      >
                        {isReplying ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Edit Drawer Modal */}
      <EditDoctorProfileDrawer
        doctor={doctor}
        open={openEdit}
        setOpen={setOpenEdit}
        onUpdated={fetchProfile}
      />

      {/* Signature & Clinic Stamp Modal */}
      <SignatureStampModal
        isOpen={openSignatureModal}
        onClose={() => setOpenSignatureModal(false)}
        doctor={doctor}
        onUpdated={(updated) => {
          setDoctor(updated);
          localStorage.setItem("doctor", JSON.stringify(updated));
        }}
      />
    </div>
  );
}