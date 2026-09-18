import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pill,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  CreditCard,
  Building,
  Sparkles,
  FileText,
  Lock,
  CheckCircle2,
  Tag,
  Gift,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/api/axios";
import PatientOrders from "./Orders";

const CATEGORIES = [
  "All",
  "Pain Relief",
  "Antibiotics",
  "Cardiovascular",
  "Vitamins & Supplements",
  "Respiratory",
  "Gastrointestinal",
];

/**
 * Detect card network from digits
 */
export const detectCardNetwork = (num) => {
  const clean = String(num || "").replace(/\D/g, "");
  if (/^4/.test(clean)) {
    return {
      brand: "visa",
      label: "Visa",
      cardTypeId: 1,
      theme: "from-blue-700 to-indigo-900",
      accent: "bg-blue-600",
    };
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) {
    return {
      brand: "mastercard",
      label: "MasterCard",
      cardTypeId: 2,
      theme: "from-amber-600 to-rose-700",
      accent: "bg-gradient-to-r from-red-500 to-amber-500",
    };
  }
  if (/^3[47]/.test(clean)) {
    return {
      brand: "amex",
      label: "American Express",
      cardTypeId: 3,
      theme: "from-teal-700 to-cyan-900",
      accent: "bg-teal-600",
    };
  }
  if (/^(6011|65|64[4-9])/.test(clean)) {
    return {
      brand: "discover",
      label: "Discover",
      cardTypeId: 4,
      theme: "from-orange-600 to-amber-800",
      accent: "bg-orange-500",
    };
  }
  return {
    brand: "unknown",
    label: "Credit / Debit Card",
    cardTypeId: 1,
    theme: "from-slate-800 to-slate-950",
    accent: "bg-slate-700",
  };
};

export default function Pharmacy() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("store"); // "store" or "orders"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("pharmacyCart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Gift Card State
  const [giftCardInput, setGiftCardInput] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);
  const [applyingGiftCard, setApplyingGiftCard] = useState(false);

  // Address State
  const [address, setAddress] = useState({
    line1: "",
    city: "",
    state: "",
    pincode: "",
    country: "US",
  });
  const [addressAutoFilled, setAddressAutoFilled] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Card & Payment State
  const [paymentForm, setPaymentForm] = useState({
    cardHolder: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const detectedCard = detectCardNetwork(paymentForm.cardNumber);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem("pharmacyCart", JSON.stringify(cart));
  }, [cart]);

  const { data: currencySign = "$" } = useQuery({
    queryKey: ["pharmacy-settings-currency"],
    queryFn: async () => {
      const { data } = await api.get("/pharmacy/settings");
      return data?.data?.currencySign || "$";
    },
  });

  const {
    data: medicines = [],
    isFetching: loadingMedicines,
    refetch: fetchMedicines,
  } = useQuery({
    // `search` is intentionally excluded: search only re-fetches on explicit submit.
    queryKey: ["patient-medicines", selectedCategory],
    queryFn: async () => {
      const params = {};
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get("/pharmacy/medicines", { params });
      if (data?.currencySign) {
        queryClient.setQueryData(["pharmacy-settings-currency"], data.currencySign);
      }
      return data?.data || [];
    },
    enabled: activeTab === "store",
    meta: { errorMessage: "Failed to load medicines." },
  });

  const { data: orders = [], isFetching: loadingOrders } = useQuery({
    queryKey: ["patient-pharmacy-orders"],
    queryFn: async () => {
      const { data } = await api.get("/pharmacy/orders/my-orders");
      return data?.data || [];
    },
    enabled: activeTab !== "store",
    meta: { errorMessage: "Failed to load orders." },
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["patient-prescriptions"],
    queryFn: async () => {
      const { data } = await api.get("/prescriptions/patient");
      return data?.data || [];
    },
    enabled: activeTab === "store",
    meta: { onError: (err) => console.error("Failed to load prescriptions:", err) },
  });

  const loading = activeTab === "store" ? loadingMedicines : loadingOrders;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMedicines();
  };

  const addToCart = (med) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.medicineId === med._id);
      if (existing) {
        return prev.map((item) =>
          item.medicineId === med._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          medicineId: med._id,
          name: med.name,
          price: med.price,
          strength: med.strength,
          dosageForm: med.dosageForm,
          campaignId: med.campaignId || 1,
          itemId: med.itemId || med.vrioProductId || 1,
          offerId: med.offerId || med.vrioOfferId || 1,
          quantity: 1,
        },
      ];
    });
    toast.success(`Added ${med.name} to cart`);
  };

  const handleAILoadPrescription = async (prescriptionId) => {
    setAiLoading(true);
    try {
      const res = await api.post("/ai/read-prescription-to-cart", {
        prescriptionId,
      });

      const data = res.data?.data;
      if (data && data.cartItems?.length > 0) {
        setCart((prev) => {
          const updated = [...prev];
          for (const item of data.cartItems) {
            const existingIndex = updated.findIndex((c) => c.medicineId === item.medicineId);
            if (existingIndex > -1) {
              updated[existingIndex].quantity += item.quantity;
            } else {
              updated.push(item);
            }
          }
          return updated;
        });

        toast.success(`🤖 AI analyzed prescription! Added ${data.matchedItemsCount} medicines directly into your cart.`);
      }
    } catch (err) {
      console.error("Failed to load prescription via AI:", err);
      toast.error(err.response?.data?.message || "Failed to auto-load prescription.");
    } finally {
      setAiLoading(false);
    }
  };

  const updateQuantity = (medicineId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.medicineId === medicineId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Apply Coupon
  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) {
      toast.error("Please enter a promo code.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Please add items to your cart first.");
      return;
    }

    try {
      setApplyingCoupon(true);
      const res = await api.post("/coupons/apply", {
        code: couponCodeInput.trim(),
        orderTotal: cartTotal,
      });

      setAppliedCoupon(res.data?.data);
      toast.success(res.data?.message || "Coupon applied successfully!");
      setCouponCodeInput("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed.");
  };

  // Apply Gift Card
  const handleApplyGiftCard = async (e) => {
    if (e) e.preventDefault();
    if (!giftCardInput.trim()) {
      toast.error("Please enter a gift card code.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Please add items to your cart first.");
      return;
    }

    try {
      setApplyingGiftCard(true);
      const promoDiscount = appliedCoupon ? Number(appliedCoupon.discountValue || 0) : 0;
      const remainingAfterPromo = Math.max(0, cartTotal - promoDiscount);
      
      const res = await api.post("/gift-cards/apply", {
        code: giftCardInput.trim(),
        orderTotal: remainingAfterPromo,
      });

      setAppliedGiftCard(res.data?.data);
      toast.success(res.data?.message || "Gift card applied successfully!");
      setGiftCardInput("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or inactive gift card.");
    } finally {
      setApplyingGiftCard(false);
    }
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
    toast.info("Gift card removed.");
  };

  // Total Calculations
  const promoDiscountValue = appliedCoupon ? Number(appliedCoupon.discountValue || 0) : 0;
  const giftCardDiscountValue = appliedGiftCard ? Number(appliedGiftCard.applyAmount || 0) : 0;
  const totalDiscountValue = promoDiscountValue + giftCardDiscountValue;
  const finalPayableTotal = Math.max(0, Math.round((cartTotal - totalDiscountValue) * 100) / 100);

  const handleOpenCheckout = async () => {
    setIsCheckoutOpen(true);
    setPaymentForm({
      cardHolder: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    });
    setAddress({
      line1: "",
      city: "",
      state: "",
      pincode: "",
      country: "US",
    });

    try {
      setLoadingAddress(true);
      const res = await api.get("/patients/profile");
      const profile = res.data?.data;
      if (profile) {
        const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
        if (fullName) {
          setPaymentForm((prev) => ({ ...prev, cardHolder: fullName }));
        }

        const addr = profile.address;
        if (addr && (addr.line1 || addr.city || addr.state || addr.pincode)) {
          setAddress({
            line1: addr.line1 || "",
            city: addr.city || "",
            state: addr.state || "",
            pincode: addr.pincode || "",
            country: addr.country || "US",
          });
          setAddressAutoFilled(true);
          toast.success("Delivery address auto-filled from your profile!");
        } else {
          setAddressAutoFilled(false);
        }
      }
    } catch (err) {
      console.warn("Failed to auto-fill address from patient profile:", err?.message);
    } finally {
      setLoadingAddress(false);
    }
  };

  // Format card number with spaces (e.g. 4111 2222 3333 4444)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/.{1,4}/g) || [];
    setPaymentForm((prev) => ({
      ...prev,
      cardNumber: parts.join(" "),
    }));
  };

  // Format Expiry date (MM/YY)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setPaymentForm((prev) => ({
      ...prev,
      cardExpiry: raw,
    }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!address.line1?.trim() || !address.city?.trim() || !address.state?.trim() || !address.pincode?.trim()) {
      toast.error("Please enter your complete delivery address.");
      return;
    }

    if (!paymentForm.cardHolder?.trim()) {
      toast.error("Please enter the cardholder name.");
      return;
    }

    const rawCard = paymentForm.cardNumber.replace(/\D/g, "");
    if (rawCard.length < 13) {
      toast.error("Please enter a valid card number.");
      return;
    }

    const expiryParts = paymentForm.cardExpiry.split("/");
    const expMonth = expiryParts[0] ? Number(expiryParts[0]) : null;
    const expYear = expiryParts[1] ? Number(expiryParts[1]) : null;

    if (!expMonth || !expYear || expMonth < 1 || expMonth > 12) {
      toast.error("Please enter a valid expiration date (MM/YY).");
      return;
    }

    if (!paymentForm.cardCvv || paymentForm.cardCvv.length < 3) {
      toast.error("Please enter a valid 3 or 4 digit CVV.");
      return;
    }

    const nameParts = paymentForm.cardHolder.trim().split(" ");
    const fname = nameParts[0] || "Customer";
    const lname = nameParts.slice(1).join(" ") || "Patient";

    setSubmittingOrder(true);
    try {
      const discCodeVal =
        appliedCoupon?.discountCode ||
        appliedCoupon?.discount_code ||
        appliedCoupon?.code ||
        null;

      const giftCardsPayload =
        appliedGiftCard?.code
          ? [
              {
                gift_card_code: appliedGiftCard.code.trim().toUpperCase(),
                gift_card_apply: giftCardDiscountValue,
              },
            ]
          : appliedCoupon?.type === "GIFT_CARD" && appliedCoupon?.code
          ? [
              {
                gift_card_code: appliedCoupon.code.trim().toUpperCase(),
                gift_card_apply: promoDiscountValue,
              },
            ]
          : undefined;

      const patientSessionId =
        sessionStorage.getItem("patient_sess_id") ||
        `sess_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
      sessionStorage.setItem("patient_sess_id", patientSessionId);

      const payload = {
        items: cart,
        couponCode: appliedCoupon?.code || null,
        couponType: appliedCoupon?.type || null,
        discountCode: discCodeVal,
        discount_code: discCodeVal,
        discountLabel: discCodeVal,
        discount_label: discCodeVal,
        discountAmount: promoDiscountValue,   // coupon/promo only; gift cards sent separately
        gift_cards: giftCardsPayload,
        session_id: patientSessionId,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        order_notes: "Patient direct pharmacy checkout order",
        shippingAddress: address,
        billingDetails: {
          fname,
          lname,
          address1: address.line1,
          city: address.city,
          state: address.state,
          zipcode: address.pincode,
          country: address.country || "US",
        },
        paymentDetails: {
          cardNumber: rawCard,
          cardCvv: paymentForm.cardCvv || "123",
          cardExpMonth: expMonth,
          cardExpYear: expYear,
          cardTypeId: detectedCard.cardTypeId,
          cardType: detectedCard.brand,
          discountCode: discCodeVal,
          discount_code: discCodeVal,
          discountLabel: discCodeVal,
          discount_label: discCodeVal,
          gift_cards: giftCardsPayload,
          session_id: patientSessionId,
        },
      };

      const { data } = await api.post("/pharmacy/orders", payload);
      toast.success("Order placed successfully!", {
        description: `Vrio Ref: ${data?.data?.vrioOrderId || data?.data?.stickyCrmOrderId || data?.data?._id}`,
      });

      setCart([]);
      setAppliedCoupon(null);
      setAppliedGiftCard(null);
      localStorage.removeItem("pharmacyCart");
      setIsCheckoutOpen(false);
      setActiveTab("orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">TeleClinic Pharmacy</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Certified medicines, AI-powered prescription fulfillment, and home delivery
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("store")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "store" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Medicine Store
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "orders" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Orders ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === "store" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Store Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Prescription Fulfillment Banner */}
            {prescriptions.length > 0 && (
              <Card className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white border-0 shadow-xl rounded-3xl overflow-hidden relative">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <CardContent className="p-6 relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      AI Prescription Sync
                    </div>
                    <Badge className="bg-indigo-500/30 text-indigo-100 border-indigo-400/30">
                      {prescriptions.length} Active Prescriptions
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Refill Directly from Doctor Prescription</h3>
                    <p className="text-indigo-200 text-xs mt-1">
                      Our clinical AI reads your doctor's latest diagnosis and automatically fills your cart with recommended doses and instructions.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {prescriptions.slice(0, 3).map((pres) => (
                      <Button
                        key={pres._id}
                        onClick={() => handleAILoadPrescription(pres._id)}
                        disabled={aiLoading}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md gap-2 h-9"
                      >
                        {aiLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-indigo-300" />
                        )}
                        Load: {pres.diagnosis || "Recent Prescription"} ({new Date(pres.createdAt).toLocaleDateString()})
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search & Categories Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search medicines by brand or generic name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 bg-white rounded-2xl border-slate-200 text-sm shadow-sm"
                />
              </form>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Medicine Product Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : medicines.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 rounded-3xl bg-slate-50/50">
                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-base">No medicines found</h3>
                <p className="text-xs text-slate-400 mt-1">Try changing your search term or category filters.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {medicines.map((med) => (
                  <Card
                    key={med._id}
                    className="border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-3xl overflow-hidden bg-white flex flex-col justify-between group"
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-700 text-[10px] font-bold border-indigo-100 uppercase"
                        >
                          {med.category}
                        </Badge>
                        {med.requiresPrescription ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                            Rx Required
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                            OTC
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition">
                          {med.name}
                        </h4>
                        <p className="text-xs text-slate-400 italic mt-0.5">{med.genericName}</p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                          {med.dosageForm} • {med.strength}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {med.description}
                      </p>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-50 mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Price</span>
                        <span className="text-xl font-black text-slate-900">{currencySign}{Number(med.price).toFixed(2)}</span>
                      </div>

                      <Button
                        onClick={() => addToCart(med)}
                        disabled={!med.inStock}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-10 px-4 text-xs font-bold shadow-md shadow-indigo-500/20"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {med.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg rounded-3xl bg-white p-5 sticky top-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Your Cart</h3>
                    <p className="text-[11px] text-slate-400">{cart.length} unique medicines</p>
                  </div>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-rose-500 hover:text-rose-600 text-xs font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Cart List */}
              {cart.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Cart is empty</p>
                  <p className="text-[11px] text-slate-400">Add medicines from the catalogue to proceed</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs border border-slate-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {currencySign}{Number(item.price).toFixed(2)} each
                          </p>
                        </div>
                        <span className="font-bold text-slate-900">
                          {currencySign}{Number(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.medicineId, -1)}
                            className="text-slate-500 hover:text-slate-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.medicineId, 1)}
                            className="text-slate-500 hover:text-slate-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            setCart((prev) => prev.filter((i) => i.medicineId !== item.medicineId))
                          }
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cart Summary & Action */}
              {cart.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  {/* Promo Code Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-600" />
                        Promo Code
                      </span>
                      {appliedCoupon && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Applied
                        </span>
                      )}
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                            {appliedCoupon.code}
                          </span>
                          <span className="font-bold text-emerald-700">
                            -{currencySign}{promoDiscountValue.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-emerald-600 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove Coupon"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="e.g. WELCOME20, NEW15"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="h-8 text-xs uppercase font-mono rounded-xl bg-white border-slate-200"
                        />
                        <Button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCodeInput.trim()}
                          className="h-8 px-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 cursor-pointer"
                        >
                          {applyingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Dedicated Gift Card Box */}
                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-amber-600" />
                        Digital Gift Card
                      </span>
                      {appliedGiftCard && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                          Balance Applied
                        </span>
                      )}
                    </div>

                    {appliedGiftCard ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-200 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {appliedGiftCard.code}
                          </span>
                          <span className="font-bold text-amber-800">
                            -{currencySign}{giftCardDiscountValue.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveGiftCard}
                          className="text-amber-700 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove Gift Card"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="e.g. GIFT100, GC-..."
                          value={giftCardInput}
                          onChange={(e) => setGiftCardInput(e.target.value.toUpperCase())}
                          className="h-8 text-xs uppercase font-mono rounded-xl bg-white border-amber-200"
                        />
                        <Button
                          type="button"
                          onClick={handleApplyGiftCard}
                          disabled={applyingGiftCard || !giftCardInput.trim()}
                          className="h-8 px-3 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shrink-0 cursor-pointer shadow-xs shadow-amber-200"
                        >
                          {applyingGiftCard ? <Loader2 className="w-3 h-3 animate-spin" /> : "Redeem"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">{currencySign}{Number(cartTotal).toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Promo Discount ({appliedCoupon.code})</span>
                        <span>-{currencySign}{promoDiscountValue.toFixed(2)}</span>
                      </div>
                    )}
                    {appliedGiftCard && (
                      <div className="flex justify-between text-amber-700 font-semibold">
                        <span>Gift Card Applied ({appliedGiftCard.code})</span>
                        <span>-{currencySign}{giftCardDiscountValue.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Doorstep Delivery</span>
                      <span className="font-semibold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Pay</span>
                      <span className="text-base font-black text-indigo-600">{currencySign}{finalPayableTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleOpenCheckout}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl h-11 text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* ── My Orders Tab ── */
        <PatientOrders />
      )}

      {/* Checkout Dialog Modal with Auto Card Detection */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <Card className="max-w-lg w-full border-0 shadow-2xl rounded-3xl bg-white p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
                    Secure Card Checkout
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Encrypted CRM Order Routing & Instant Card Verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center text-xs font-bold transition shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto pr-1 space-y-5 flex-1 custom-scrollbar">
              {/* Virtual Card Graphic Preview */}
              <div
                className={`w-full h-44 sm:h-48 rounded-2xl p-5 text-white bg-gradient-to-tr ${detectedCard.theme} shadow-xl shadow-indigo-950/15 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border border-white/10`}
              >
                {/* Background decorative circles */}
                <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-black/10 blur-xl pointer-events-none" />

                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2.5">
                    {/* Gold EMV Chip */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-300/80 flex items-center justify-center shadow-inner relative overflow-hidden">
                      <div className="w-7 h-4 border-y border-amber-800/25 rounded-sm" />
                      <div className="absolute inset-y-0 w-px bg-amber-800/25" />
                    </div>
                    {/* NFC Signal */}
                    <div className="flex items-center gap-0.5 opacity-70">
                      <span className="text-[10px] font-mono tracking-widest uppercase font-semibold">
                        NFC
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Brand Badge */}
                  <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm">
                    {detectedCard.brand === "visa" ? (
                      <span className="font-black italic tracking-tight text-sm text-white drop-shadow">
                        VISA
                      </span>
                    ) : detectedCard.brand === "mastercard" ? (
                      <div className="flex items-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-400 -ml-1.5" />
                        <span className="text-[11px] font-extrabold ml-1.5 tracking-tight">Mastercard</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                        {detectedCard.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 relative z-10">
                  {/* Card Number */}
                  <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white drop-shadow-md py-0.5">
                    {paymentForm.cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  {/* Cardholder & Expiry */}
                  <div className="flex justify-between items-end pt-1 border-t border-white/15">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/70 font-semibold block">
                        Cardholder
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow-sm">
                        {paymentForm.cardHolder ? paymentForm.cardHolder.toUpperCase() : "YOUR NAME"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-white/70 font-semibold block">
                        Expires
                      </span>
                      <span className="text-xs font-mono font-bold text-white drop-shadow-sm">
                        {paymentForm.cardExpiry || "MM/YY"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCheckout} autoComplete="off" className="space-y-4">
                {/* Payment Fields Box */}
                <div className="space-y-3.5 p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                      Payment Information
                    </Label>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      256-bit SSL Encrypted
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-1">
                    <Label htmlFor="cardHolder" className="text-[11px] text-slate-600 font-semibold">
                      Cardholder Name
                    </Label>
                    <Input
                      id="cardHolder"
                      name="telemed_cardholder_name"
                      autoComplete="off"
                      value={paymentForm.cardHolder}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, cardHolder: e.target.value })
                      }
                      placeholder="e.g. John Doe"
                      required
                      className="rounded-xl h-10 text-xs bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="cardNumber" className="text-[11px] text-slate-600 font-semibold">
                        Card Number
                      </Label>
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        {detectedCard.brand === "visa" ? (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 text-[10px]">
                            ✓ Visa Verified
                          </span>
                        ) : detectedCard.brand === "mastercard" ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80 text-[10px]">
                            ✓ MasterCard Verified
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Visa, Mastercard, Amex, Discover</span>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        name="telemed_card_number"
                        autoComplete="new-password"
                        value={paymentForm.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                        required
                        className="rounded-xl h-10 text-xs bg-white font-mono border-slate-200 pr-12 font-bold focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {detectedCard.brand === "visa" ? (
                          <span className="font-black italic text-blue-700 text-xs tracking-tight">
                            VISA
                          </span>
                        ) : detectedCard.brand === "mastercard" ? (
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-amber-400 -ml-1.5" />
                          </div>
                        ) : (
                          <CreditCard className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="cardExpiry" className="text-[11px] text-slate-600 font-semibold">
                        Expiration Date
                      </Label>
                      <Input
                        id="cardExpiry"
                        name="telemed_card_exp"
                        autoComplete="off"
                        value={paymentForm.cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        maxLength={5}
                        required
                        className="rounded-xl h-10 text-xs bg-white font-mono border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cardCvv" className="text-[11px] text-slate-600 font-semibold">
                        Security Code (CVV)
                      </Label>
                      <Input
                        id="cardCvv"
                        name="telemed_card_cvc"
                        autoComplete="new-password"
                        type="password"
                        value={paymentForm.cardCvv}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          })
                        }
                        placeholder="•••"
                        maxLength={4}
                        required
                        className="rounded-xl h-10 text-xs bg-white font-mono border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-3 p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="line1" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-600" />
                      Delivery Address
                    </Label>
                    {addressAutoFilled ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Auto-filled from profile
                      </span>
                    ) : loadingAddress ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" /> Fetching saved address...
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="line1" className="text-[11px] text-slate-600 font-semibold">
                      Street Address
                    </Label>
                    <Input
                      id="line1"
                      name="telemed_shipping_addr"
                      autoComplete="off"
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      placeholder="e.g. 123 Main St, Apt 4B"
                      required
                      className="rounded-xl h-10 text-xs bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-[11px] text-slate-600 font-semibold">
                        City
                      </Label>
                      <Input
                        id="city"
                        name="telemed_shipping_city"
                        autoComplete="off"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="e.g. New York"
                        required
                        className="rounded-xl h-10 text-xs bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="state" className="text-[11px] text-slate-600 font-semibold">
                        State
                      </Label>
                      <Input
                        id="state"
                        name="telemed_shipping_state"
                        autoComplete="off"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        placeholder="e.g. NY"
                        required
                        className="rounded-xl h-10 text-xs bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pincode" className="text-[11px] text-slate-600 font-semibold">
                        Zip Code
                      </Label>
                      <Input
                        id="pincode"
                        name="telemed_shipping_zip"
                        autoComplete="off"
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        placeholder="e.g. 10001"
                        required
                        className="rounded-xl h-10 text-xs bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* 1. Promotional Discount Code Section */}
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      1. Promo Code
                    </Label>
                    {appliedCoupon && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        Coupon Active
                      </span>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded border border-emerald-200 shadow-2xs">
                          {appliedCoupon.code}
                        </span>
                        <span className="font-bold text-emerald-700">
                          -{currencySign}{promoDiscountValue.toFixed(2)} ({appliedCoupon.title})
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
                        placeholder="Enter code (e.g. WELCOME20, NEW15)"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="h-10 text-xs uppercase font-mono rounded-xl bg-white border-slate-200"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCodeInput.trim()}
                        className="h-10 px-4 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 cursor-pointer shadow-sm shadow-indigo-500/20"
                      >
                        {applyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* 2. Dedicated Digital Gift Card Section */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      2. Redeem Gift Card
                    </Label>
                    {appliedGiftCard && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full border border-amber-300">
                        Gift Card Active
                      </span>
                    )}
                  </div>

                  {appliedGiftCard ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 text-xs shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200">
                          {appliedGiftCard.code}
                        </span>
                        <div>
                          <span className="font-bold text-amber-800 block">
                            -{currencySign}{giftCardDiscountValue.toFixed(2)} applied
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Available card balance: {currencySign}{Number(appliedGiftCard.availableBalance).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveGiftCard}
                        className="text-amber-700 hover:text-rose-600 p-1 cursor-pointer font-bold text-xs flex items-center gap-1"
                        title="Remove Gift Card"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Enter gift card code (e.g. GIFT100, GC-...)"
                        value={giftCardInput}
                        onChange={(e) => setGiftCardInput(e.target.value.toUpperCase())}
                        className="h-10 text-xs uppercase font-mono rounded-xl bg-white border-amber-200"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyGiftCard}
                        disabled={applyingGiftCard || !giftCardInput.trim()}
                        className="h-10 px-4 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shrink-0 cursor-pointer shadow-sm shadow-amber-500/20"
                      >
                        {applyingGiftCard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Redeem"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Order Breakdown Summary */}
                <div className="p-4 bg-indigo-50/70 rounded-2xl space-y-2 text-xs border border-indigo-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cart.length} medications)</span>
                    <span className="font-bold text-slate-900">{currencySign}{Number(cartTotal).toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        Promo Discount ({appliedCoupon.code})
                      </span>
                      <span>-{currencySign}{promoDiscountValue.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedGiftCard && (
                    <div className="flex justify-between text-amber-800 font-bold">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3 h-3 text-amber-600" />
                        Gift Card Applied ({appliedGiftCard.code})
                      </span>
                      <span>-{currencySign}{giftCardDiscountValue.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Routing</span>
                    <span className="font-bold text-indigo-900">
                      {detectedCard.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-indigo-200/60">
                    <span>Total Charged to Card</span>
                    <span className="text-indigo-700 text-base font-extrabold">
                      {currencySign}{finalPayableTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl h-12 text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition active:scale-[0.99] cursor-pointer"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Routing & Processing with Vrio CRM...
                    </>
                  ) : (
                    `Pay ${currencySign}${finalPayableTotal.toFixed(2)} & Place Order`
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}