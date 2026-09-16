import { useState, useEffect } from "react";
import {
  Star,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/api/axios";
import { getProfileImageUrl } from "@/utils/imageUrl";

const RATING_LABELS = {
  1: { label: "Disappointing", color: "text-rose-500", desc: "Did not meet expectations" },
  2: { label: "Fair", color: "text-amber-500", desc: "Acceptable but could be better" },
  3: { label: "Good", color: "text-amber-500", desc: "Helpful and satisfactory care" },
  4: { label: "Very Good", color: "text-emerald-500", desc: "Thorough and professional" },
  5: { label: "Exceptional", color: "text-emerald-600", desc: "Outstanding consultation experience" },
};

const SUGGESTED_TAGS = [
  "Attentive & Compassionate",
  "Clear Medical Explanation",
  "Punctual Consultation",
  "Thorough Diagnosis",
  "Effective Prescription",
  "Polite & Reassuring",
  "Great Follow-up Advice",
  "Highly Recommended",
];

export default function DoctorReviewModal({
  isOpen,
  onClose,
  doctor,
  appointmentId = null,
  existingReview = null,
  onSuccess,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState([
    "Attentive & Compassionate",
    "Clear Medical Explanation",
  ]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill if editing existing review
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setReview(existingReview.review || "");
      setSelectedTags(
        Array.isArray(existingReview.tags) && existingReview.tags.length > 0
          ? existingReview.tags
          : ["Attentive & Compassionate", "Clear Medical Explanation"]
      );
      setIsAnonymous(Boolean(existingReview.isAnonymous));
    } else {
      setRating(5);
      setReview("");
      setSelectedTags([
        "Attentive & Compassionate",
        "Clear Medical Explanation",
      ]);
      setIsAnonymous(false);
    }
  }, [existingReview, isOpen]);

  if (!isOpen || !doctor) return null;

  const isEditing = Boolean(existingReview);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      return toast.error("Please choose a star rating.");
    }

    setSubmitting(true);
    try {
      const res = await api.post("/reviews", {
        doctorId: doctor._id || doctor.id,
        appointmentId,
        rating,
        review: review.trim(),
        tags: selectedTags,
        isAnonymous,
      });

      toast.success(res.data?.message || "Thank you for reviewing Dr. " + (doctor.lastName || "Doctor") + "!");
      if (onSuccess) onSuccess(res.data?.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;
  const currentRatingInfo = RATING_LABELS[activeRating] || RATING_LABELS[5];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={getProfileImageUrl(
                doctor.profileImage,
                `${doctor.firstName || "Dr"} ${doctor.lastName || ""}`,
                "2563eb"
              )}
              alt={`Dr. ${doctor.firstName || "Doctor"}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.firstName || "Dr")}+${encodeURIComponent(doctor.lastName || "")}&background=2563eb&color=fff&size=120`;
              }}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div>
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                {isEditing ? "Edit Your Review & Feedback" : "Doctor Review & Feedback"}
              </span>
              <h3 className="text-lg font-black text-white">
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              <p className="text-xs text-white/70">
                {doctor.specialization || "TeleClinic Physician"} • {doctor.hospital || "Virtual Network"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating Picker */}
          <div className="text-center space-y-2 py-1 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              How was your consultation experience?
            </span>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-115 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeRating
                        ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-0.5">
              <span className={`text-sm font-black ${currentRatingInfo.color}`}>
                {activeRating} Star{activeRating > 1 ? "s" : ""} — {currentRatingInfo.label}
              </span>
              <p className="text-[11px] text-slate-400">{currentRatingInfo.desc}</p>
            </div>
          </div>

          {/* Quick Experience Highlights / Tags */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              What stood out most? (Select all that apply)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Field (Optional) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="reviewText" className="font-bold text-slate-700">
                Detailed Feedback / Comments <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-slate-400 text-[11px]">{review.length}/1000</span>
            </div>
            <Textarea
              id="reviewText"
              rows={3}
              maxLength={1000}
              placeholder="Share optional feedback (e.g. Doctor listened patiently, provided clear diagnosis and helpful instructions)..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="rounded-2xl border-slate-200 text-xs leading-relaxed"
            />
          </div>

          {/* Anonymous checkbox */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">Post Anonymously</p>
                <p className="text-[10px] text-slate-400">Your name will be hidden on public reviews</p>
              </div>
            </div>
            <input
              type="checkbox"
              id="isAnonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-blue-600"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl h-11 text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !rating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl h-11 text-xs shadow-md shadow-blue-500/20 gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-300" /> {isEditing ? "Update Review" : "Post Review"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
