import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  Calendar,
  MapPin,
  CreditCard,
  Tag,
  Gift,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Pill,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Receipt,
  FileText,
  AlertCircle,
  Video,
  Stethoscope,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/api/axios";
import { downloadInvoicePdf } from "@/utils/invoiceGenerator";

const STATUS_FILTERS = ["ALL", "PROCESSING", "SHIPPED", "DELIVERED", "CONFIRMED", "COMPLETED", "PENDING", "CANCELLED"];

const TYPE_FILTERS = [
  { key: "ALL", label: "All Transactions" },
  { key: "CONSULTATION", label: "Doctor Consultations", icon: Stethoscope },
  { key: "PHARMACY", label: "Pharmacy Orders", icon: Pill },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending Verification",
    badge: "bg-amber-500/10 text-amber-600 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
    step: 1,
    gradient: "from-amber-500 to-orange-500",
  },
  PROCESSING: {
    label: "Processing Order",
    badge: "bg-blue-500/10 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
    icon: Package,
    step: 2,
    gradient: "from-blue-600 to-indigo-600",
  },
  CONFIRMED: {
    label: "Appointment Confirmed",
    badge: "bg-blue-500/10 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
    icon: Video,
    step: 3,
    gradient: "from-blue-600 to-indigo-600",
  },
  SHIPPED: {
    label: "Shipped & In Transit",
    badge: "bg-purple-500/10 text-purple-600 border-purple-200",
    dot: "bg-purple-500",
    icon: Truck,
    step: 3,
    gradient: "from-purple-600 to-indigo-600",
  },
  DELIVERED: {
    label: "Delivered",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
    step: 4,
    gradient: "from-emerald-500 to-teal-600",
  },
  COMPLETED: {
    label: "Consultation Completed",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
    step: 4,
    gradient: "from-emerald-500 to-teal-600",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-rose-500/10 text-rose-600 border-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
    step: 0,
    gradient: "from-rose-500 to-red-600",
  },
};

export default function PatientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "highest"
  const [expandedOrders, setExpandedOrders] = useState({});
  const [downloadingId, setDownloadingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [currencySign, setCurrencySign] = useState("$");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/pharmacy/orders/my-orders");
      setOrders(data?.data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/pharmacy/settings");
      if (data?.data?.currencySign) {
        setCurrencySign(data.data.currencySign);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSettings();
  }, []);

  const toggleExpand = (id) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadInvoice = (order, e) => {
    if (e) e.stopPropagation();
    setDownloadingId(order._id);
    try {
      downloadInvoicePdf(order, currencySign);
      toast.success("Invoice PDF generated and downloaded!");
    } catch (err) {
      console.error("Invoice error:", err);
      toast.error("Failed to generate invoice PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = orders.length;
    const consultations = orders.filter((o) => o.orderType === "CONSULTATION").length;
    const pharmacy = orders.filter((o) => (o.orderType || "PHARMACY") === "PHARMACY").length;
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalSaved = orders.reduce((sum, o) => sum + Number(o.discountAmount || 0), 0);

    return { total, consultations, pharmacy, totalSpent, totalSaved };
  }, [orders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((ord) => {
        // Type filter
        if (selectedType !== "ALL") {
          const ordType = ord.orderType || "PHARMACY";
          if (ordType !== selectedType) return false;
        }

        // Status filter
        if (selectedStatus !== "ALL" && ord.status !== selectedStatus) {
          return false;
        }

        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const ordId = (ord.vrioOrderId || ord.stickyCrmOrderId || ord._id || "").toLowerCase();
          const matchesItem = (ord.items || []).some((it) =>
            (it.name || "").toLowerCase().includes(q)
          );
          const matchesDoctor = ord.doctor
            ? `${ord.doctor.firstName || ""} ${ord.doctor.lastName || ""} ${ord.doctor.specialization || ""}`.toLowerCase().includes(q)
            : false;
          const matchesAddress = (ord.shippingAddress?.city || "").toLowerCase().includes(q);

          return ordId.includes(q) || matchesItem || matchesDoctor || matchesAddress;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "highest") {
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [orders, selectedType, selectedStatus, search, sortBy]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-900/40">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Verified Invoices, Consultations & Live CRM Tracking</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              My Orders & Payment History
            </h1>
            <p className="text-indigo-200/80 text-sm max-w-2xl">
              Track doctor consultation bookings, pharmacy prescriptions, real-time CRM fulfillment, and download official PDF tax invoices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={fetchOrders}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl h-11 px-4 text-xs font-bold backdrop-blur-md gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link to="/patient/doctors">
              <Button className="bg-sky-600 hover:bg-sky-500 text-white rounded-2xl h-11 px-4 text-xs font-bold shadow-lg shadow-sky-600/30 gap-2 cursor-pointer">
                <Stethoscope className="w-4 h-4" />
                Book Consultation
              </Button>
            </Link>
            <Link to="/patient/pharmacy">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-11 px-4 text-xs font-bold shadow-lg shadow-indigo-600/30 gap-2 cursor-pointer">
                <Pill className="w-4 h-4" />
                Pharmacy Store
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/80">Total Transactions</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300/80">Doctor Consultations</p>
            <p className="text-2xl sm:text-3xl font-black text-sky-300 mt-1">{stats.consultations}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">Pharmacy Orders</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">{stats.pharmacy}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/80">Total Paid</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              {currencySign}{stats.totalSpent.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Category / Type Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
          {TYPE_FILTERS.map((t) => {
            const Icon = t.icon;
            const count =
              t.key === "ALL"
                ? orders.length
                : t.key === "CONSULTATION"
                ? stats.consultations
                : stats.pharmacy;
            const isActive = selectedType === t.key;

            return (
              <button
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by Order ID, Doctor name, medication, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white transition"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Amount</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((st) => {
            const count = st === "ALL" ? orders.length : orders.filter((o) => o.status === st).length;
            const isActive = selectedStatus === st;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                <span>{st === "ALL" ? "All Statuses" : st.charAt(0) + st.slice(1).toLowerCase()}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-600">Loading your verified orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-12 sm:p-16 text-center border-dashed border-2 rounded-3xl bg-slate-50/60 space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-black text-slate-800">No matching orders found</h3>
            <p className="text-xs text-slate-400">
              {search || selectedStatus !== "ALL"
                ? "Try adjusting your search criteria or filter tags."
                : "You haven't placed any pharmacy orders yet. Start exploring medications prescribed by your doctor."}
            </p>
          </div>
          <Link to="/patient/pharmacy">
            <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold px-6 h-11 shadow-lg shadow-indigo-600/20">
              Go to Pharmacy Store
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((ord) => {
            const isExpanded = !!expandedOrders[ord._id];
            const isConsultation = ord.orderType === "CONSULTATION";
            const statusMeta = STATUS_CONFIG[ord.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusMeta.icon;
            const ordRef = ord.vrioOrderId || ord.stickyCrmOrderId || ord._id?.slice(-8).toUpperCase();
            const itemCount = (ord.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
            const subtotal = (ord.items || []).reduce((sum, it) => sum + Number(it.price || 0) * (it.quantity || 1), 0);
            const discount = Number(ord.discountAmount || 0);

            // Consultation metadata extraction
            const doctorObj = ord.doctor || ord.items?.[0]?.doctor;
            const doctorName = doctorObj
              ? `Dr. ${doctorObj.firstName || ""} ${doctorObj.lastName || ""}`.trim()
              : "Doctor Consultation";
            const doctorSpec = doctorObj?.specialization || "TeleClinic Physician";
            const rawDate = ord.items?.[0]?.appointmentDate || ord.appointment?.appointmentDate;
            const apptDateStr = rawDate
              ? new Date(rawDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;
            const slotStr = ord.items?.[0]?.slot
              ? `${ord.items[0].slot.start} - ${ord.items[0].slot.end}`
              : ord.appointment?.slot
              ? `${ord.appointment.slot.start} - ${ord.appointment.slot.end}`
              : null;
            const appointmentId = ord.appointment?._id || ord.appointment;

            return (
              <div
                key={ord._id}
                className={`group bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/60 ${
                  isExpanded
                    ? isConsultation
                      ? "border-sky-300 ring-2 ring-sky-500/10"
                      : "border-indigo-300 ring-2 ring-indigo-500/10"
                    : "border-slate-200/80"
                }`}
              >
                {/* Visual Status Indicator Strip */}
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${
                    isConsultation
                      ? "from-sky-500 via-blue-600 to-indigo-600"
                      : statusMeta.gradient
                  }`}
                />

                {/* Main Order Card Body */}
                <div className="p-5 sm:p-7 space-y-5">
                  {/* Top Bar: Reference, Date, Status, Total, Primary Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Icon & Reference Info */}
                    <div className="flex items-start gap-3.5">
                      {isConsultation ? (
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 shadow-sm mt-0.5">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm mt-0.5">
                          <Receipt className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-black text-slate-900 tracking-tight">
                            {isConsultation ? `Consultation #${ordRef}` : `Order #${ordRef}`}
                          </span>
                          <button
                            onClick={() => handleCopy(ordRef, ord._id)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            title="Copy reference"
                          >
                            {copiedId === ord._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isConsultation ? (
                            <Badge className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-black uppercase">
                              🩺 Doctor Consultation
                            </Badge>
                          ) : (
                            <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black uppercase">
                              💊 Pharmacy Order
                            </Badge>
                          )}

                          <span className="text-[10px] uppercase font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            {ord.paymentStatus || "PAID"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(ord.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(ord.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isConsultation && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                                {doctorName} ({doctorSpec})
                              </span>
                            </>
                          )}
                          {!isConsultation && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-slate-600">
                                {itemCount} {itemCount === 1 ? "item" : "items"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Badge, Total Amount, Primary Action, Invoice Download & Expand */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-wrap">
                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold ${statusMeta.badge}`}>
                        <span className={`w-2 h-2 rounded-full ${statusMeta.dot} animate-pulse`} />
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusMeta.label}</span>
                      </div>

                      {/* Total Amount Tag */}
                      <div className="text-right pl-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {currencySign}{Number(ord.totalAmount).toFixed(2)}
                        </span>
                      </div>

                      {/* Consultation Direct Join Button */}
                      {isConsultation && appointmentId && (
                        <Link to={`/patient/consultation/${appointmentId}`}>
                          <Button className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-2xl h-10 px-4 text-xs font-bold shadow-md shadow-sky-600/20 gap-1.5 cursor-pointer animate-pulse">
                            <Video className="w-3.5 h-3.5" />
                            <span>Enter Room ➔</span>
                          </Button>
                        </Link>
                      )}

                      {/* Download Invoice PDF Button */}
                      <Button
                        onClick={(e) => handleDownloadInvoice(ord, e)}
                        disabled={downloadingId === ord._id}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-10 px-4 text-xs font-bold shadow-sm gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Receipt PDF</span>
                        <span className="sm:hidden">PDF</span>
                      </Button>

                      {/* Expand Details Button */}
                      <button
                        onClick={() => toggleExpand(ord._id)}
                        className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
                        title={isExpanded ? "Hide Details" : "View Full Details"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Visual Steps Tracker */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                    <div className="grid grid-cols-4 gap-2 relative">
                      {isConsultation ? (
                        <>
                          {/* Step 1 */}
                          <div className="flex flex-col items-center text-center space-y-1">
                            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                              ✓
                            </div>
                            <span className="text-[11px] font-bold text-slate-800">Booking Placed</span>
                            <span className="text-[9px] text-slate-400 hidden sm:block">Payment confirmed</span>
                          </div>

                          {/* Step 2 */}
                          <div className="flex flex-col items-center text-center space-y-1">
                            <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                              ✓
                            </div>
                            <span className="text-[11px] font-bold text-sky-700">CRM Synchronized</span>
                            <span className="text-[9px] text-slate-400 hidden sm:block">Vrio Item #{ord.items?.[0]?.vrioProductId || 3366}</span>
                          </div>

                          {/* Step 3 */}
                          <div className="flex flex-col items-center text-center space-y-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                ord.status === "CONFIRMED" || ord.status === "COMPLETED"
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              {ord.status === "CONFIRMED" || ord.status === "COMPLETED" ? "✓" : "3"}
                            </div>
                            <span className={`text-[11px] font-bold ${ord.status === "CONFIRMED" || ord.status === "COMPLETED" ? "text-blue-700" : "text-slate-400"}`}>
                              Doctor Confirmed
                            </span>
                            <span className="text-[9px] text-slate-400 hidden sm:block">Slot reserved</span>
                          </div>

                          {/* Step 4 */}
                          <div className="flex flex-col items-center text-center space-y-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                ord.status === "COMPLETED"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              {ord.status === "COMPLETED" ? "✓" : "4"}
                            </div>
                            <span className={`text-[11px] font-bold ${ord.status === "COMPLETED" ? "text-emerald-700" : "text-slate-400"}`}>
                              Consultation Done
                            </span>
                            <span className="text-[9px] text-slate-400 hidden sm:block">Summary saved</span>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Step 1 */}
                          <div className="flex flex-col items-center text-center space-y-1">
                            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                              ✓
                            </div>
                            <span className="text-[11px] font-bold text-slate-800">Order Placed</span>
                            <span className="text-[9px] text-slate-400 hidden sm:block">Payment confirmed</span>
                          </div>

                          {/* Step 2 */}
                          <div className="flex flex-col items-center text-center space-y-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                statusMeta.step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              {statusMeta.step >= 2 ? "✓" : "2"}
                            </div>
                            <span className={`text-[11px] font-bold ${statusMeta.step >= 2 ? "text-indigo-700" : "text-slate-400"}`}>
                              CRM Processing
                            </span>
                            <span className="text-[9px] text-slate-400 hidden sm:block">Fulfillment routing</span>
                          </div>

                          {/* Step 3 */}
                          <div className="flex flex-col items-center text-center space-y-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                statusMeta.step >= 3 ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              {statusMeta.step >= 3 ? "✓" : "3"}
                            </div>
                            <span className={`text-[11px] font-bold ${statusMeta.step >= 3 ? "text-purple-700" : "text-slate-400"}`}>
                              Dispatched
                            </span>
                            <span className="text-[9px] text-slate-400 hidden sm:block">With courier</span>
                          </div>

                          {/* Step 4 */}
                          <div className="flex flex-col items-center text-center space-y-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                statusMeta.step >= 4 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              {statusMeta.step >= 4 ? "✓" : "4"}
                            </div>
                            <span className={`text-[11px] font-bold ${statusMeta.step >= 4 ? "text-emerald-700" : "text-slate-400"}`}>
                              Delivered
                            </span>
                            <span className="text-[9px] text-slate-400 hidden sm:block">At doorstep</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Items Preview Strip */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      {isConsultation ? "Consultation Details:" : "Medicines:"}
                    </span>

                    {isConsultation ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-900 px-3 py-1 rounded-xl text-xs font-bold">
                          <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                          <span>{doctorName}</span>
                          <span className="text-sky-600 text-[10px] font-extrabold bg-white px-1.5 py-0.5 rounded">
                            {doctorSpec}
                          </span>
                        </span>

                        {apptDateStr && slotStr && (
                          <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-xl text-xs font-semibold">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                            <span>{apptDateStr} • {slotStr}</span>
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg">
                          <Zap className="w-3 h-3 text-indigo-500" />
                          <span>Item #{ord.items?.[0]?.vrioProductId || 3366} • Offer #{ord.items?.[0]?.vrioOfferId || 29}</span>
                        </span>
                      </div>
                    ) : (
                      (ord.items || []).map((it, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-indigo-50/70 border border-indigo-100 text-indigo-900 px-3 py-1 rounded-xl text-xs font-bold"
                        >
                          <Pill className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{it.name}</span>
                          <span className="bg-white/80 px-1.5 py-0.2 rounded-md text-[10px] text-indigo-600 font-extrabold">
                            ×{it.quantity}
                          </span>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Expanded Details Drawer */}
                  {isExpanded && (
                    <div className="pt-5 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
                      {/* Section Title */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          {isConsultation
                            ? "Detailed Consultation Receipt & CRM Item Breakdown"
                            : "Detailed Invoice & Order Breakdown"}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">ID: {ord._id}</span>
                      </div>

                      {/* Items Table */}
                      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                        <div className="bg-slate-50 px-5 py-3 flex justify-between text-[11px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-200">
                          <span>{isConsultation ? "Service Description" : "Item Description"}</span>
                          <div className="flex gap-8 text-right">
                            <span className="w-10">Qty</span>
                            <span className="w-20">Unit Price</span>
                            <span className="w-20">Total</span>
                          </div>
                        </div>
                        <div className="divide-y divide-slate-100 bg-white">
                          {(ord.items || []).map((it, idx) => (
                            <div key={idx} className="px-5 py-3.5 flex justify-between items-center text-xs">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-900 text-sm">
                                  {it.name || (isConsultation ? "Doctor Video Consultation" : "Medicine Item")}
                                </p>
                                {isConsultation ? (
                                  <p className="text-[11px] text-slate-500 font-medium">
                                    {doctorName} ({doctorSpec}) {apptDateStr ? `• ${apptDateStr}` : ""} {slotStr ? `at ${slotStr}` : ""}
                                  </p>
                                ) : (
                                  it.dosageForm && (
                                    <p className="text-[11px] text-slate-400">
                                      {it.dosageForm} • {it.strength || "Standard"}
                                    </p>
                                  )
                                )}
                              </div>
                              <div className="flex gap-8 text-right font-mono">
                                <span className="w-10 font-bold text-slate-700 text-center">{it.quantity || 1}</span>
                                <span className="w-20 font-medium text-slate-500">
                                  {currencySign}{Number(it.price).toFixed(2)}
                                </span>
                                <span className="w-20 font-black text-slate-900">
                                  {currencySign}{Number(it.price * (it.quantity || 1)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Two-column Info: Summary & Delivery */}
                      <div className="grid md:grid-cols-2 gap-5">
                        {/* Financial Breakdown */}
                        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                          <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                            Financial Summary
                          </p>

                          <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span className="font-semibold text-slate-900">{currencySign}{subtotal.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200/60">
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                                  Discount Applied {ord.discountCode ? `(${ord.discountCode})` : ""}
                                </span>
                                <span>-{currencySign}{discount.toFixed(2)}</span>
                              </div>
                            )}

                            <div className="flex justify-between text-slate-600">
                              <span>{isConsultation ? "Virtual Consultation Link" : "Doorstep Express Shipping"}</span>
                              <span className="font-bold text-emerald-600">INCLUDED</span>
                            </div>

                            <div className="flex justify-between text-sm font-black text-slate-900 pt-2.5 border-t border-slate-200">
                              <span>Grand Total Paid</span>
                              <span className="text-indigo-600 text-base font-black">
                                {currencySign}{Number(ord.totalAmount).toFixed(2)}
                              </span>
                            </div>

                            {ord.billingDetails?.cardLast4 && (
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2">
                                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  Charged to {(ord.billingDetails.cardType || "Card").toUpperCase()} ending in ••••{ord.billingDetails.cardLast4}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping / Patient & CRM Reference */}
                        <div className="space-y-3">
                          {/* Destination info */}
                          {isConsultation ? (
                            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-2">
                              <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5 text-sky-600" />
                                Telemedicine Access & Patient Details
                              </p>
                              <div className="text-xs text-slate-700 space-y-1">
                                <p className="font-bold text-slate-900">
                                  {ord.billingDetails?.fname || ord.patient?.firstName}{" "}
                                  {ord.billingDetails?.lname || ord.patient?.lastName}
                                </p>
                                <p className="text-slate-600">
                                  Email: {ord.billingDetails?.email || ord.patient?.email}
                                </p>
                                <p className="text-slate-500">
                                  Consultation: Video link activated on confirmed schedule
                                </p>
                              </div>
                            </div>
                          ) : (
                            ord.shippingAddress && (
                              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-2">
                                <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                                  Delivery Address
                                </p>
                                <div className="text-xs text-slate-700 space-y-0.5">
                                  <p className="font-bold text-slate-900">
                                    {ord.billingDetails?.fname} {ord.billingDetails?.lname}
                                  </p>
                                  <p className="text-slate-600">{ord.shippingAddress.line1}</p>
                                  <p className="text-slate-600">
                                    {ord.shippingAddress.city}, {ord.shippingAddress.state} {ord.shippingAddress.pincode}
                                  </p>
                                  <p className="text-slate-400">{ord.shippingAddress.country || "United States"}</p>
                                </div>
                              </div>
                            )
                          )}

                          {/* Vrio CRM Order Reference */}
                          {(ord.vrioOrderId || ord.stickyCrmOrderId) && (
                            <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                                  <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                                    Vrio CRM Sync Reference
                                  </p>
                                  <p className="text-xs font-mono font-black text-slate-900">
                                    {ord.vrioOrderId || ord.stickyCrmOrderId}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleCopy(ord.vrioOrderId || ord.stickyCrmOrderId, `crm-${ord._id}`)}
                                className="p-2 rounded-xl bg-white hover:bg-indigo-100 text-indigo-600 transition shadow-xs cursor-pointer"
                                title="Copy CRM ID"
                              >
                                {copiedId === `crm-${ord._id}` ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Download Full Invoice Button (Large Action) */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        {isConsultation && appointmentId && (
                          <Link to={`/patient/consultation/${appointmentId}`} className="flex-1">
                            <Button className="w-full h-12 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black rounded-2xl text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]">
                              <Video className="w-4 h-4" />
                              <span>Join Doctor Consultation Call</span>
                            </Button>
                          </Link>
                        )}
                        <Button
                          onClick={(e) => handleDownloadInvoice(ord, e)}
                          disabled={downloadingId === ord._id}
                          className={`${
                            isConsultation && appointmentId ? "flex-1" : "w-full"
                          } h-12 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-sm shadow-lg shadow-slate-900/25 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]`}
                        >
                          <Download className="w-4 h-4" />
                          <span>
                            {isConsultation
                              ? "Download Official Consultation Invoice (PDF)"
                              : "Download Official Pharmacy Invoice (PDF)"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
