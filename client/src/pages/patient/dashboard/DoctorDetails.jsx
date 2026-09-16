import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2,
  Award,
  Clock,
  Video,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  CreditCard,
  FileText,
  AlertCircle,
  Star,
  ThumbsUp,
  MessageSquare,
  Tag,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/api/axios";
import DoctorReviewModal from "@/components/patient/DoctorReviewModal";
import { useCurrency } from "@/contexts/CurrencyContext";

const SYMPTOM_PRESETS = [
  "Routine Health Checkup",
  "Follow-up Consultation",
  "Review Medical Reports",
  "Prescription Refill",
  "Chest Pain / Heart Concerns",
  "Skin Rash / Allergy",
  "Fever & Body Ache",
  "Second Medical Opinion",
];

export const detectCardNetwork = (num) => {
  const clean = String(num || "").replace(/\D/g, "");
  if (/^4/.test(clean)) {
    return {
      brand: "visa",
      label: "Visa",
      cardTypeId: 1,
      badgeColor: "bg-blue-600 text-white",
    };
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) {
    return {
      brand: "mastercard",
      label: "MasterCard",
      cardTypeId: 2,
      badgeColor: "bg-amber-600 text-white",
    };
  }
  if (/^3[47]/.test(clean)) {
    return {
      brand: "amex",
      label: "American Express",
      cardTypeId: 3,
      badgeColor: "bg-teal-600 text-white",
    };
  }
  if (/^(6011|65|64[4-9])/.test(clean)) {
    return {
      brand: "discover",
      label: "Discover",
      cardTypeId: 4,
      badgeColor: "bg-orange-600 text-white",
    };
  }
  return {
    brand: "visa",
    label: "Visa",
    cardTypeId: 1,
    badgeColor: "bg-slate-700 text-white",
  };
};

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Reviews State
  const [reviewsData, setReviewsData] = useState({
    averageRating: 5.0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    topTags: [],
    reviews: [],
  });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [filterStar, setFilterStar] = useState("ALL");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Coupon & Promo Code State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Vrio CRM Gateway & Pay to Consult State
  const [crmConfig, setCrmConfig] = useState({
    consultationItemId: 3366,
    consultationOfferId: 29,
    isEnabled: true,
  });
  const [paymentForm, setPaymentForm] = useState({
    cardHolder: "",
    cardNumber: "",
    cardExpMonth: "",
    cardExpYear: "",
    cardCvv: "",
  });
  const [billingAddress, setBillingAddress] = useState({
    line1: "",
    city: "",
    state: "",
    pincode: "",
    country: "US",
  });
  const [autoFilledProfile, setAutoFilledProfile] = useState(false);

  const fetchDoctorDetails = async () => {
    try {
      const res = await api.get(`/doctors/${id}`);
      setDoctor(res.data.data);
    } catch (err) {
      console.error("Failed to load doctor profile:", err);
      toast.error("Unable to load doctor profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await api.get(`/reviews/doctor/${id}`);
      if (res.data?.data) {
        setReviewsData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load doctor reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load Doctor Details, Reviews, CRM Settings & Patient Profile
  useEffect(() => {
    fetchDoctorDetails();
    fetchReviews();

    // Fetch CRM public settings for Item ID & Offer ID
    api
      .get("/pharmacy/settings")
      .then((res) => {
        if (res.data?.data) {
          setCrmConfig({
            consultationItemId: res.data.data.consultationItemId || 3366,
            consultationOfferId: res.data.data.consultationOfferId || 29,
            isEnabled: res.data.data.isEnabled ?? true,
          });
        }
      })
      .catch(() => {});

    // Pre-fill patient address and cardholder name from database profile
    api
      .get("/patients/profile")
      .then((res) => {
        const prof = res.data?.data;
        if (prof) {
          const fullName = `${prof.firstName || ""} ${prof.lastName || ""}`.trim();
          setPaymentForm((prev) => ({
            ...prev,
            cardHolder: prev.cardHolder || fullName,
          }));
          if (prof.address) {
            setBillingAddress({
              line1: prof.address.line1 || "",
              city: prof.address.city || "",
              state: prof.address.state || "",
              pincode: prof.address.pincode || "",
              country: prof.address.country || "US",
            });
            setAutoFilledProfile(true);
          }
        }
      })
      .catch(() => {});
  }, [id]);

  // Generate Next 10 Days for Date Selector
  const upcomingDays = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      const fullWeekday = d.toLocaleDateString("en-US", { weekday: "long" });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString("en-US", { month: "short" });

      // Check if doctor works on this day
      const isAvailable = doctor?.availability?.some(
        (avail) => avail.enabled && avail.day === fullWeekday
      );

      days.push({
        dateString,
        weekday,
        fullWeekday,
        dayNum,
        month,
        isAvailable,
        isToday: i === 0,
      });
    }
    return days;
  }, [doctor]);

  // Select first available day by default
  useEffect(() => {
    if (doctor && upcomingDays.length > 0 && !selectedDate) {
      const firstAvail = upcomingDays.find((d) => d.isAvailable);
      if (firstAvail) {
        handleDateSelect(firstAvail.dateString);
      }
    }
  }, [doctor, upcomingDays]);

  const fetchSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const res = await api.get(`/doctors/${id}/available-slots?date=${date}`);
      setSlots(res.data?.data || []);
      setSelectedSlot(null);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    await fetchSlots(date);
  };

  const handleCustomDateChange = async (e) => {
    const date = e.target.value;
    if (!date) return;

    const weekday = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const available = doctor.availability?.some(
      (d) => d.enabled && d.day === weekday
    );

    if (!available) {
      toast.warning(`Dr. ${doctor.lastName || ""} is not scheduled on ${weekday}s.`);
    }

    setSelectedDate(date);
    await fetchSlots(date);
  };

  const detectedCard = useMemo(() => {
    return detectCardNetwork(paymentForm.cardNumber);
  }, [paymentForm.cardNumber]);

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setPaymentForm((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleBookAppointment = async () => {
    if (!selectedDate) {
      return toast.error("Please select an appointment date.");
    }
    if (!selectedSlot) {
      return toast.error("Please choose an available consultation time slot.");
    }
    if (reason.trim().length < 5) {
      return toast.error("Please enter a brief reason for consultation (min 5 characters).");
    }

    const cleanCard = paymentForm.cardNumber.replace(/\D/g, "");
    if (cleanCard.length < 15) {
      return toast.error("Please enter a valid credit card number (15 or 16 digits).");
    }
    const expMonth = Number(paymentForm.cardExpMonth);
    const expYear = Number(paymentForm.cardExpYear);
    if (!expMonth || expMonth < 1 || expMonth > 12) {
      return toast.error("Please enter a valid card expiration month (01 - 12).");
    }
    if (!expYear || expYear < 24) {
      return toast.error("Please enter a valid expiration year (e.g. 26, 27).");
    }
    if (paymentForm.cardCvv.length < 3) {
      return toast.error("Please enter a valid 3 or 4-digit card security code (CVV).");
    }
    if (!paymentForm.cardHolder.trim()) {
      return toast.error("Please enter the cardholder name as printed on the card.");
    }
    if (!billingAddress.line1.trim() || !billingAddress.city.trim()) {
      return toast.error("Please provide your delivery/billing address.");
    }

    setBooking(true);
    try {
      const names = paymentForm.cardHolder.trim().split(" ");
      const fname = names[0] || "Patient";
      const lname = names.slice(1).join(" ") || "User";

      const res = await api.post("/appointments", {
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        slot: selectedSlot,
        reason: reason.trim(),
        couponCode: appliedCoupon?.code || null,
        discountAmount: discountAmount,
        paymentDetails: {
          cardNumber: cleanCard,
          cardCvv: paymentForm.cardCvv,
          cardExpMonth: expMonth,
          cardExpYear: expYear < 100 ? 2000 + expYear : expYear,
          cardTypeId: detectedCard.cardTypeId,
          cardType: detectedCard.brand,
        },
        billingDetails: {
          fname,
          lname,
          address1: billingAddress.line1.trim(),
          city: billingAddress.city.trim(),
          state: billingAddress.state.trim() || "CA",
          zipcode: billingAddress.pincode.trim() || "12345",
          country: billingAddress.country?.trim() || "US",
        },
      });

      setBookedAppointment(res.data?.data || { success: true });
      toast.success("Consultation booked and paid successfully!", {
        description: res.data?.data?.vrioOrderId
          ? `Order Ref: #${res.data.data.vrioOrderId}`
          : undefined,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book and process consultation payment.");
    } finally {
      setBooking(false);
    }
  };

  const originalFee = Number(doctor?.consultationFee ?? 500);

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) {
      toast.error("Please enter a promo code or gift card.");
      return;
    }

    try {
      setApplyingCoupon(true);
      const res = await api.post("/coupons/apply", {
        code: couponCodeInput.trim(),
        orderTotal: originalFee,
      });

      setAppliedCoupon(res.data?.data);
      toast.success(res.data?.message || "Coupon applied successfully!");
      setCouponCodeInput("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon or gift card.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed.");
  };

  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountValue || 0) : 0;
  const finalPayableFee = Math.max(0, Math.round((originalFee - discountAmount) * 100) / 100);

  // Group slots into Morning and Afternoon/Evening
  const groupedSlots = useMemo(() => {
    const morning = [];
    const afternoon = [];

    slots.forEach((s) => {
      const startHour = parseInt(s.start.split(":")[0], 10);
      if (startHour < 12) {
        morning.push(s);
      } else {
        afternoon.push(s);
      }
    });

    return { morning, afternoon };
  }, [slots]);

  const filteredReviews = useMemo(() => {
    if (!reviewsData?.reviews) return [];
    if (filterStar === "ALL") return reviewsData.reviews;
    if (filterStar === "LOW") return reviewsData.reviews.filter((r) => r.rating <= 2);
    return reviewsData.reviews.filter((r) => Math.round(r.rating) === Number(filterStar));
  }, [reviewsData, filterStar]);

  const patient = JSON.parse(localStorage.getItem("patient") || "{}");
  const currentPatientId = patient?._id || patient?.id;

  const userReview = useMemo(() => {
    if (!currentPatientId || !reviewsData?.reviews) return null;
    return reviewsData.reviews.find(
      (r) =>
        String(r.patient?._id || r.patient) === String(currentPatientId)
    );
  }, [reviewsData, currentPatientId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading Doctor Profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Doctor Profile Not Found</h2>
        <p className="text-slate-500 text-xs">
          The requested doctor profile may have been removed or updated.
        </p>
        <Link to="/patient/doctors">
          <Button className="rounded-xl mt-2">Back to Doctors Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/patient/doctors")}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition group"
        >
          <ArrowLeft className="w-4 h-4 transition group-hover:-translate-x-1" />
          Back to Doctors Directory
        </button>

        <Badge className="bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 gap-1.5 py-1 px-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Medical Practitioner
        </Badge>
      </div>

      {/* Hero Doctor Profile Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
            {/* Avatar */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <img
                src={
                  doctor.profileImage ||
                  `https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=0D9488&color=fff&size=200`
                }
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-slate-100 shadow-md"
              />
              <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Online for Consultations" />
            </div>

            {/* Doctor Info */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h1>
                  <Badge className="bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                    {doctor.specialization || "General Physician"}
                  </Badge>
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                      userReview
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    }`}
                    title={userReview ? "Click to edit your review" : "Click to write a review"}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{reviewsData?.averageRating ? reviewsData.averageRating.toFixed(1) : "5.0"}</span>
                    <span className="text-slate-400 font-normal">
                      ({reviewsData?.totalReviews || 0} reviews)
                    </span>
                    {userReview ? (
                      <span className="text-emerald-700 ml-1 text-[11px] font-semibold underline">
                        ✓ You Rated ({userReview.rating}★) • Edit
                      </span>
                    ) : (
                      <span className="text-blue-600 ml-1 text-[11px] font-semibold underline">
                        + Add Review
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-slate-500 text-xs sm:text-sm flex items-center justify-center md:justify-start gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {doctor.hospital || "TeleClinic Virtual Care Network"}
                </p>
              </div>

              {/* Badges / Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-500" /> Experience
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {doctor.experience || 8}+ Years
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Video className="w-3 h-3 text-blue-500" /> Mode
                  </span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    HD Video Call
                  </p>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-left col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Consultation Fee
                  </span>
                  <p className="text-sm font-black text-indigo-900 mt-0.5">
                    {formatPrice(doctor.consultationFee ?? 500)}
                  </p>
                </div>
              </div>

              {/* Active Working Days */}
              <div className="pt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Weekly Consultation Days
                </span>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const isWorking = doctor.availability?.some(
                      (d) => d.enabled && d.day.toLowerCase() === day.toLowerCase()
                    );

                    return (
                      <span
                        key={day}
                        className={`text-xs font-bold px-3 py-1 rounded-xl transition ${
                          isWorking
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-400 border border-slate-200 opacity-60"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Suite Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Interactive Date & Slot Selector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Date Selector */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Select Consultation Date
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose an upcoming day to check live available slots
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={handleCustomDateChange}
                  className="w-36 h-9 text-xs rounded-xl border-slate-200"
                  title="Pick specific calendar date"
                />
              </div>
            </div>

            {/* Next 10 Days Carousel Chips */}
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-2 pt-2">
              {upcomingDays.slice(0, 5).map((day) => {
                const isSelected = selectedDate === day.dateString;

                return (
                  <button
                    key={day.dateString}
                    type="button"
                    disabled={!day.isAvailable}
                    onClick={() => handleDateSelect(day.dateString)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-102"
                        : day.isAvailable
                        ? "bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer"
                        : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {day.weekday}
                    </span>
                    <span className="text-base font-black my-0.5">
                      {day.dayNum}
                    </span>
                    <span className="text-[10px] font-semibold">
                      {day.isAvailable ? (
                        <span className={isSelected ? "text-blue-100" : "text-emerald-600"}>
                          Available
                        </span>
                      ) : (
                        "Off"
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Second row of days */}
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-2">
              {upcomingDays.slice(5, 10).map((day) => {
                const isSelected = selectedDate === day.dateString;

                return (
                  <button
                    key={day.dateString}
                    type="button"
                    disabled={!day.isAvailable}
                    onClick={() => handleDateSelect(day.dateString)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : day.isAvailable
                        ? "bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer"
                        : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {day.weekday}
                    </span>
                    <span className="text-sm font-black my-0.5">
                      {day.dayNum} {day.month}
                    </span>
                    <span className="text-[9px] font-semibold">
                      {day.isAvailable ? (
                        <span className={isSelected ? "text-blue-100" : "text-emerald-600"}>
                          Available
                        </span>
                      ) : (
                        "Off"
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Step 2: Time Slots */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Choose Time Slot
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDate
                      ? `Available appointments for ${new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`
                      : "Please choose a date above"}
                  </p>
                </div>
              </div>

              {selectedSlot && (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {selectedSlot.start} - {selectedSlot.end}
                </Badge>
              )}
            </div>

            {loadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs font-semibold">Loading available slots...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No Open Slots on this Date</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  The doctor does not have scheduled hours or all slots are booked on this date. Please pick another date above.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {/* Morning Slots */}
                {groupedSlots.morning.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      🌅 Morning Sessions
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {groupedSlots.morning.map((slot) => {
                        const isSelected =
                          selectedSlot?.start === slot.start &&
                          selectedSlot?.end === slot.end;

                        return (
                          <button
                            key={`${slot.start}-${slot.end}`}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-102"
                                : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            {slot.start} - {slot.end}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Afternoon / Evening Slots */}
                {groupedSlots.afternoon.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      🌇 Afternoon & Evening Sessions
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {groupedSlots.afternoon.map((slot) => {
                        const isSelected =
                          selectedSlot?.start === slot.start &&
                          selectedSlot?.end === slot.end;

                        return (
                          <button
                            key={`${slot.start}-${slot.end}`}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-102"
                                : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            {slot.start} - {slot.end}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Step 3: Consultation Reason */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reason for Consultation & Symptoms
                </h3>
                <p className="text-xs text-slate-500">
                  Provide brief context to help Dr. {doctor.lastName} prepare for your session
                </p>
              </div>
            </div>

            {/* Quick Symptom Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                ⚡ Quick Presets (Click to add)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SYMPTOM_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReason(preset)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-xs font-medium transition cursor-pointer border border-transparent hover:border-purple-200"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              rows={3}
              placeholder="e.g. Experiencing mild shortness of breath during exertion for the past 4 days. Would like a clinical review."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-2xl border-slate-200 text-xs leading-relaxed"
            />
          </Card>
        </div>

        {/* Right Col: Consultation Invoice & Instant Confirmation */}
        <div className="space-y-5">
          <Card className="border border-slate-200/80 shadow-lg shadow-slate-200/40 rounded-3xl bg-white p-6 space-y-6 sticky top-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Consultation Summary
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Telemedicine Session Details
                </p>
              </div>
            </div>

            {/* Appointment Highlights */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Practitioner
                </span>
                <p className="font-bold text-slate-900">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>
                <p className="text-slate-500 font-medium">{doctor.specialization}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Date & Time Slot
                </span>
                <p className="font-bold text-slate-900">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "— Date not selected"}
                </p>
                <p className="text-indigo-600 font-bold">
                  {selectedSlot ? `${selectedSlot.start} - ${selectedSlot.end}` : "— Slot not selected"}
                </p>
              </div>
            </div>

            {/* Promo Code & Gift Card Section */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  Have a Promo Code or Gift Card?
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Coupon Active
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                      {appliedCoupon.code}
                    </span>
                    <span className="font-bold text-emerald-700">
                      -{formatPrice(discountAmount)} ({appliedCoupon.title})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-emerald-600 hover:text-rose-600 p-1 cursor-pointer font-bold text-xs flex items-center gap-1"
                    title="Remove Coupon"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. WELCOME20, GIFT100"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="h-8 text-xs uppercase font-mono rounded-xl bg-white border-slate-200"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCodeInput.trim()}
                    className="h-8 px-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 cursor-pointer shadow-sm shadow-indigo-500/20"
                  >
                    {applyingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Doctor Consultation Fee</span>
                <span className="font-bold text-slate-900">{formatPrice(doctor.consultationFee ?? 500)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    Discount ({appliedCoupon.code})
                  </span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Telehealth Video Room (HD)</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Digital Prescription Delivery</span>
                <span className="font-bold text-emerald-600">INCLUDED</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-900">Total Payable</span>
                <span className="text-2xl font-black text-indigo-700">
                  {formatPrice(finalPayableFee)}
                </span>
              </div>
            </div>

            {/* Vrio CRM Product Assurance Card */}
            <div className="p-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border border-blue-200/80 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Vrio CRM Secured Consultation
                </span>
                <Badge className="bg-blue-600 text-white text-[10px] font-mono font-bold">
                  Item #{crmConfig.consultationItemId || 3366} • Offer #{crmConfig.consultationOfferId || 29}
                </Badge>
              </div>
              <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                Official telemedicine consultation product. Billed directly via encrypted Vrio CRM payment gateway.
              </p>
            </div>

            {/* Payment & Billing Address Form */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {/* Payment Details Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Credit / Debit Card Details
                </span>
                <Badge className={`text-[10px] font-bold uppercase ${detectedCard.badgeColor}`}>
                  {detectedCard.label}
                </Badge>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Cardholder Name
                </label>
                <Input
                  placeholder="e.g. John Doe"
                  value={paymentForm.cardHolder}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, cardHolder: e.target.value }))}
                  className="h-9 text-xs rounded-xl border-slate-200"
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Card Number
                </label>
                <div className="relative">
                  <Input
                    placeholder="Credit Card Number"
                    value={paymentForm.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="h-9 text-xs font-mono rounded-xl border-slate-200 pr-10"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Exp Month
                  </label>
                  <Input
                    placeholder="MM"
                    value={paymentForm.cardExpMonth}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        cardExpMonth: e.target.value.replace(/\D/g, "").slice(0, 2),
                      }))
                    }
                    maxLength={2}
                    className="h-9 text-xs font-mono text-center rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Exp Year
                  </label>
                  <Input
                    placeholder="YYYY"
                    value={paymentForm.cardExpYear}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        cardExpYear: e.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    maxLength={4}
                    className="h-9 text-xs font-mono text-center rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    CVV
                  </label>
                  <Input
                    type="password"
                    placeholder="CVV"
                    value={paymentForm.cardCvv}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    maxLength={4}
                    className="h-9 text-xs font-mono text-center rounded-xl border-slate-200"
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Billing / Patient Address
                  </span>
                  {autoFilledProfile && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Auto-filled from profile
                    </span>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Street Address (Line 1)"
                    value={billingAddress.line1}
                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, line1: e.target.value }))}
                    className="h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="City"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, city: e.target.value }))}
                    className="h-9 text-xs rounded-xl border-slate-200"
                  />
                  <Input
                    placeholder="State (e.g. CA)"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, state: e.target.value }))}
                    className="h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="ZIP / Postal Code"
                    value={billingAddress.pincode}
                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                    className="h-9 text-xs rounded-xl border-slate-200"
                  />
                  <Input
                    placeholder="Country (US)"
                    value={billingAddress.country}
                    onChange={(e) => setBillingAddress((prev) => ({ ...prev, country: e.target.value }))}
                    className="h-9 text-xs rounded-xl border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Pay & Confirm Button */}
            <Button
              type="button"
              disabled={booking || !selectedDate || !selectedSlot}
              onClick={handleBookAppointment}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl h-12 shadow-lg shadow-indigo-500/20 text-xs sm:text-sm gap-2 cursor-pointer transition-all"
            >
              {booking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Vrio Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay {formatPrice(finalPayableFee)} & Confirm Consultation
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-slate-400 font-medium leading-relaxed">
              🔒 256-Bit SSL Encrypted. Dispatched to Vrio CRM with product item #{crmConfig.consultationItemId || 3366} & offer #{crmConfig.consultationOfferId || 29}.
            </p>
          </Card>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ── Patient Reviews & Ratings Section ── */}
      {/* ============================================================ */}
      <div id="patient-reviews" className="space-y-6 pt-6 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Patient Ratings & Reviews
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verified clinical feedback from patients who consulted Dr. {doctor.firstName} {doctor.lastName}
            </p>
          </div>

          <Button
            onClick={() => setReviewModalOpen(true)}
            className={`font-bold rounded-2xl h-11 px-5 text-xs shadow-md gap-2 self-start sm:self-auto cursor-pointer ${
              userReview
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20"
            }`}
          >
            {userReview ? (
              <>
                <Star className="w-4 h-4 fill-white text-white" /> Edit Your Review ({userReview.rating}★)
              </>
            ) : (
              <>
                <Star className="w-4 h-4 fill-slate-950 text-slate-950" /> Rate & Review Doctor
              </>
            )}
          </Button>
        </div>

        {/* Rating Breakdown & Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score & Stars */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 flex flex-col justify-between">
            <div className="text-center sm:text-left space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Satisfaction
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900">
                  {reviewsData?.averageRating ? reviewsData.averageRating.toFixed(1) : "5.0"}
                </span>
                <span className="text-slate-400 font-bold text-base">/ 5.0</span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(reviewsData?.averageRating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Based on <span className="font-bold text-slate-800">{reviewsData?.totalReviews || 0}</span> patient review{reviewsData?.totalReviews === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50/60 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>100% verified telemedicine patient feedback</span>
            </div>
          </Card>

          {/* Rating Distribution Bars */}
          <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 md:col-span-2 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Rating Distribution
            </span>

            <div className="space-y-2 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewsData?.ratingDistribution?.[stars] || 0;
                const total = reviewsData?.totalReviews || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : stars === 5 ? 100 : 0;

                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-12 font-bold text-slate-700 shrink-0 flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stars >= 4
                            ? "bg-emerald-500"
                            : stars === 3
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-400 font-semibold text-[11px]">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Top Positive Experience Tags */}
            {reviewsData?.topTags && reviewsData.topTags.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Top Patient Compliments
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {reviewsData.topTags.slice(0, 6).map(({ tag, count }) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl border border-blue-200"
                    >
                      <ThumbsUp className="w-3 h-3 text-blue-500" />
                      {tag} <span className="text-blue-400">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Filter Strip & Reviews List */}
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 space-y-6">
          {/* Your Submitted Review Highlight Banner */}
          {userReview && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  {userReview.rating}★
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-emerald-950">You reviewed this practitioner</h4>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      ✓ Submitted {new Date(userReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {userReview.review ? (
                    <p className="text-emerald-800 line-clamp-1 mt-0.5 font-medium italic">
                      "{userReview.review}"
                    </p>
                  ) : (
                    <p className="text-emerald-700 text-[11px] mt-0.5">
                      Rating: {userReview.rating} Stars {userReview.tags?.length > 0 ? `• ${userReview.tags.join(", ")}` : ""}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setReviewModalOpen(true)}
                className="bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-2xs"
              >
                ✏️ Edit Your Review
              </Button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: "ALL", label: `All (${reviewsData?.totalReviews || 0})` },
                { key: "5", label: "5 Stars" },
                { key: "4", label: "4 Stars" },
                { key: "3", label: "3 Stars" },
                { key: "LOW", label: "1-2 Stars" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterStar(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterStar === tab.key
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setReviewModalOpen(true)}
              className={`rounded-xl text-xs font-bold gap-1 cursor-pointer ${
                userReview
                  ? "border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100"
                  : "border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${userReview ? "fill-emerald-600 text-emerald-600" : "fill-amber-500 text-amber-500"}`} />
              {userReview ? "Edit Your Review" : "Write a Review"}
            </Button>
          </div>

          {/* List of Reviews */}
          {loadingReviews ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs font-semibold">Loading patient feedback...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Star className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {filterStar === "ALL"
                    ? "No reviews posted for this doctor yet."
                    : `No reviews found matching ${filterStar} stars.`}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Be the first to share your consultation experience and help other patients!
                </p>
              </div>
              <Button
                onClick={() => setReviewModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs mt-2 gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" /> Be First to Review
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((r) => {
                const reviewerName = r.isAnonymous
                  ? "Verified Patient"
                  : `${r.patient?.firstName || "Patient"} ${r.patient?.lastName || ""}`.trim();

                const avatar = r.isAnonymous
                  ? `https://ui-avatars.com/api/?name=Verified+Patient&background=64748b&color=fff`
                  : r.patient?.profileImage ||
                    `https://ui-avatars.com/api/?name=${reviewerName}&background=0284c7&color=fff`;

                return (
                  <div
                    key={r._id}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-3"
                  >
                    {/* Review Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatar}
                          alt={reviewerName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {reviewerName}
                            </h4>
                            {r.isAnonymous && (
                              <Badge className="text-[10px] bg-slate-200 text-slate-700 border-0 font-medium py-0">
                                Anonymous
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Consulted on {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Stars Badge */}
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-amber-800">
                          {r.rating}.0
                        </span>
                      </div>
                    </div>

                    {/* Review Content (if provided) */}
                    {r.review && (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        "{r.review}"
                      </p>
                    )}

                    {/* Tags */}
                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
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

                    {/* Doctor's Response Bubble */}
                    {r.doctorReply?.comment && (
                      <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dr. {doctor.firstName} {doctor.lastName}'s Response:</span>
                          <span className="text-[10px] text-emerald-600 font-normal ml-auto">
                            {r.doctorReply.repliedAt
                              ? new Date(r.doctorReply.repliedAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <p className="text-emerald-800 leading-relaxed font-medium text-xs">
                          {r.doctorReply.comment}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Review Submission Modal */}
      <DoctorReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        doctor={doctor}
        existingReview={userReview}
        onSuccess={() => {
          fetchDoctorDetails();
          fetchReviews();
        }}
      />

      {/* Booking Confirmation Dialog */}
      {bookedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-0 overflow-hidden text-center p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">
                Consultation Booked!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your video consultation request with Dr. {doctor.firstName} {doctor.lastName} has been scheduled successfully.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Doctor:</span>
                <span className="font-bold text-slate-800">Dr. {doctor.firstName} {doctor.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Date:</span>
                <span className="font-bold text-slate-800">{new Date(selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Time Slot:</span>
                <span className="font-bold text-indigo-600">{selectedSlot?.start} - {selectedSlot?.end}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-400 font-bold">Payment Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ PAID
                </span>
              </div>
              {bookedAppointment?.vrioOrderId && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Vrio Reference:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    #{bookedAppointment.vrioOrderId}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              {bookedAppointment?._id && (
                <Button
                  onClick={() => navigate(`/patient/consultation/${bookedAppointment._id}`)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl h-11 text-xs gap-1.5 shadow-md shadow-indigo-500/20"
                >
                  <Video className="w-4 h-4" /> Enter Consultation Room ➔
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/patient/appointments")}
                className="w-full rounded-xl h-11 text-xs font-bold"
              >
                View in My Appointments
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
