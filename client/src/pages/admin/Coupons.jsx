import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag,
  Gift,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  Zap,
  Layers,
  Copy,
  Check,
  X,
  TrendingUp,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";
import { useCurrency } from "@/contexts/CurrencyContext";

const COUPON_TYPES = [
  { value: "PERCENTAGE", label: "Percentage Discount (%)", icon: Percent },
  { value: "FIXED", label: "Fixed Cart Deduction", icon: DollarSign },
  { value: "GIFT_CARD", label: "Digital Gift Card / Credit", icon: Gift },
];

export default function AdminCoupons() {
  const navigate = useNavigate();
  const { formatPrice, currencySign } = useCurrency();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    type: "PERCENTAGE",
    discountAmount: 20,
    discountCode: "",
    minOrderAmount: 0,
    maxDiscount: "",
    usageLimit: "",
    validUntil: "",
    status: "ACTIVE",
  });

  const fetchCoupons = async () => {
    try {
      const res = await adminApi.get("/coupons/admin");
      setCoupons(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load coupons:", error);
      toast.error("Failed to load discount coupons and gift cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      title: "",
      description: "",
      type: "PERCENTAGE",
      discountAmount: 20,
      discountCode: "",
      minOrderAmount: 0,
      maxDiscount: "",
      usageLimit: "",
      validUntil: "",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      title: coupon.title || "",
      description: coupon.description || "",
      type: coupon.type || "PERCENTAGE",
      discountAmount: coupon.discountAmount ?? 0,
      discountCode: coupon.discountCode || coupon.discountLabel || coupon.code || "",
      minOrderAmount: coupon.minOrderAmount ?? 0,
      maxDiscount: coupon.maxDiscount ?? "",
      usageLimit: coupon.usageLimit ?? "",
      validUntil: coupon.validUntil
        ? new Date(coupon.validUntil).toISOString().split("T")[0]
        : "",
      status: coupon.status || "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.title.trim()) {
      toast.error("Coupon code and title are required.");
      return;
    }

    try {
      setSubmitting(true);
      const cleanDiscCode = formData.discountCode.trim() || formData.code.trim().toUpperCase();
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountCode: cleanDiscCode,
        discountLabel: cleanDiscCode,
        discountAmount: Number(formData.discountAmount),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
      };

      if (editingCoupon) {
        const res = await adminApi.put(`/coupons/admin/${editingCoupon._id}`, payload);
        toast.success(res.data?.message || "Coupon updated successfully!");
      } else {
        const res = await adminApi.post("/coupons/admin", payload);
        toast.success(res.data?.message || "Coupon created successfully!");
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    const newStatus = coupon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await adminApi.put(`/coupons/admin/${coupon._id}`, { status: newStatus });
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, status: newStatus } : c))
      );
      toast.success(
        `Coupon ${coupon.code} is now ${newStatus === "ACTIVE" ? "🟢 ACTIVE" : "⚪ INACTIVE"}`
      );
    } catch (error) {
      toast.error("Failed to update coupon status.");
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await adminApi.delete(`/coupons/admin/${id}`);
      toast.success(res.data?.message || "Coupon deleted successfully.");
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete coupon.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & Sort
  const processedCoupons = useMemo(() => {
    let list = coupons.filter((c) => {
      const term = search.toLowerCase().trim();
      const code = (c.code || "").toLowerCase();
      const title = (c.title || "").toLowerCase();
      const discCode = (c.discountCode || c.discountLabel || "").toLowerCase();

      const matchesSearch = !term || code.includes(term) || title.includes(term) || discCode.includes(term);
      const matchesType = typeFilter === "ALL" || c.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === "value-desc") return Number(b.discountAmount || 0) - Number(a.discountAmount || 0);
      if (sortBy === "uses-desc") return Number(b.usedCount || 0) - Number(a.usedCount || 0);
      return 0;
    });

    return list;
  }, [coupons, search, typeFilter, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const activeCount = coupons.filter((c) => c.status === "ACTIVE").length;
  const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const giftCardCount = coupons.filter((c) => c.type === "GIFT_CARD").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-1">
            <Tag className="w-3.5 h-3.5" /> Promotions & Vrio CRM Discounts
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Coupons & Gift Cards</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Configure promotional promo codes, gift cards, and direct Vrio <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">discount_code</code> parameters
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-sm shadow-indigo-200 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Coupon / Gift Card
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-0 shadow-sm bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Coupons</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{coupons.length}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Promos</p>
              <p className="text-xl font-black text-emerald-600 mt-0.5">{activeCount}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gift Cards</p>
              <p className="text-xl font-black text-purple-600 mt-0.5">{giftCardCount}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Redemptions</p>
              <p className="text-xl font-black text-amber-600 mt-0.5">{totalUses}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search, Filter & Sort Bar */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search code, title, discount_label..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Types (Percentage, Fixed, Gift Card)</option>
              <option value="PERCENTAGE">Percentage Discounts (%)</option>
              <option value="FIXED">Fixed Deductions</option>
              <option value="GIFT_CARD">Gift Cards</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses (Active & Inactive)</option>
              <option value="ACTIVE">🟢 Active Only</option>
              <option value="INACTIVE">⚪ Inactive Only</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer font-semibold"
            >
              <option value="newest">📅 Created: Newest First</option>
              <option value="oldest">📅 Created: Oldest First</option>
              <option value="value-desc">💰 Value: High to Low</option>
              <option value="uses-desc">🔥 Redemptions: Most Used</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Coupons Table */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="text-left p-4">Promo Code</th>
                  <th className="text-left p-4">Offer Title</th>
                  <th className="text-left p-4">Discount Value</th>
                  <th className="text-left p-4">Vrio `discount_code`</th>
                  <th className="text-left p-4">Min Order / Cap</th>
                  <th className="text-left p-4">Redemptions</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {processedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No discount coupons found</p>
                      <p className="text-[11px] mt-0.5">Click "+ Create Coupon / Gift Card" to launch a promotion</p>
                    </td>
                  </tr>
                ) : (
                  processedCoupons.map((coupon) => {
                    const isActive = coupon.status === "ACTIVE";

                    return (
                      <tr key={coupon._id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Code Badge */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(coupon.code)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Copy code"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Title */}
                        <td className="p-4 font-semibold text-gray-900">
                          <p>{coupon.title}</p>
                          {coupon.description && (
                            <p className="text-gray-400 text-[11px] font-normal mt-0.5 truncate max-w-xs">
                              {coupon.description}
                            </p>
                          )}
                        </td>

                        {/* Discount Value */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs ${
                              coupon.type === "PERCENTAGE"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : coupon.type === "GIFT_CARD"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {coupon.type === "PERCENTAGE" ? (
                              <>
                                <Percent className="w-3 h-3" /> {coupon.discountAmount}% OFF
                              </>
                            ) : coupon.type === "GIFT_CARD" ? (
                              <>
                                <Gift className="w-3 h-3" /> {formatPrice(coupon.discountAmount)} Gift Card
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-3 h-3" /> {formatPrice(coupon.discountAmount)} OFF
                              </>
                            )}
                          </span>
                        </td>

                        {/* Vrio discount_code */}
                        <td className="p-4">
                          <span className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200/80 font-bold">
                            {coupon.discountCode || coupon.discountLabel || coupon.code}
                          </span>
                        </td>

                        {/* Min Order & Max Discount */}
                        <td className="p-4 text-slate-600 text-xs">
                          <p>
                            Min: {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : "None"}
                          </p>
                          {coupon.maxDiscount && (
                            <p className="text-[10px] text-slate-400">
                              Max Cap: {formatPrice(coupon.maxDiscount)}
                            </p>
                          )}
                        </td>

                        {/* Uses */}
                        <td className="p-4 text-slate-700 font-medium">
                          <span className="font-bold">{coupon.usedCount || 0}</span>
                          <span className="text-slate-400">
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (Unlimited)"}
                          </span>
                        </td>

                        {/* Status Switch */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {isActive ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-slate-400" />
                            )}
                            {isActive ? "ACTIVE" : "INACTIVE"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(coupon)}
                              className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingId === coupon._id}
                              onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Coupon"
                            >
                              {deletingId === coupon._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-purple-50/50 relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {editingCoupon ? "Edit Discount Coupon" : "Create New Coupon / Gift Card"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure discount rates, restrictions, and Vrio CRM <code className="font-mono text-indigo-700">discount_code</code> payload mapping
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="couponCode">Promo Code *</Label>
                  <Input
                    id="couponCode"
                    placeholder="e.g. SAVE20, HEALTH50, GIFT100"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    required
                    className="rounded-xl font-mono uppercase font-bold text-indigo-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="couponType">Discount Mechanism *</Label>
                  <select
                    id="couponType"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    {COUPON_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="couponTitle">Offer Display Title *</Label>
                  <Input
                    id="couponTitle"
                    placeholder="e.g. Summer Care 20% Off, New Patient Welcome Voucher"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="discountAmount">
                    {formData.type === "PERCENTAGE"
                      ? "Percentage Off (%) *"
                      : `Discount Amount (${currencySign}) *`}
                  </Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 20"
                    value={formData.discountAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, discountAmount: e.target.value })
                    }
                    required
                    className="rounded-xl font-bold text-slate-900"
                  />
                </div>

                {/* Vrio CRM discount_code Parameter Card */}
                <div className="space-y-1.5">
                  <Label htmlFor="discountCode" className="text-indigo-950 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    Vrio `discount_code` Parameter *
                  </Label>
                  <Input
                    id="discountCode"
                    placeholder="e.g. SAVE20 (sent in Vrio JSON)"
                    value={formData.discountCode}
                    onChange={(e) =>
                      setFormData({ ...formData, discountCode: e.target.value })
                    }
                    className="rounded-xl font-mono text-xs border-indigo-200 bg-indigo-50/30"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Sent directly to Vrio CRM API as <code className="font-mono text-indigo-700">discount_code</code>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="minOrderAmount">Minimum Order Amount ({currencySign})</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    min="0"
                    placeholder="0 (No minimum)"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                {formData.type === "PERCENTAGE" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="maxDiscount">Max Discount Cap ({currencySign})</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      min="0"
                      placeholder="e.g. 50 (Optional cap)"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscount: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="usageLimit">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    placeholder="e.g. 500 (Blank for unlimited)"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="validUntil">Expiration Date</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    className="rounded-xl text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="description">Terms & Description</Label>
                  <textarea
                    id="description"
                    rows={2}
                    placeholder="Offer terms, eligible items, or customer-facing note..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div
                onClick={() =>
                  setFormData({
                    ...formData,
                    status: formData.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  })
                }
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  formData.status === "ACTIVE"
                    ? "bg-emerald-50/70 border-emerald-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        formData.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    Coupon Active Status
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formData.status === "ACTIVE"
                      ? "Patients can apply this coupon in their pharmacy cart"
                      : "Coupon is disabled and cannot be redeemed"}
                  </p>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    formData.status === "ACTIVE" ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl h-10 px-4 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-6 text-xs shadow-md shadow-indigo-600/20 cursor-pointer gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : editingCoupon ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Update Coupon
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Create Coupon
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
