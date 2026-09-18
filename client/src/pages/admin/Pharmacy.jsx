import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pill,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
  Zap,
  X,
  ShieldCheck,
  FileText,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";
import { useCurrency } from "@/contexts/CurrencyContext";

const CATEGORIES = [
  "All",
  "Pain Relief",
  "Antibiotics",
  "Cardiovascular",
  "Vitamins & Supplements",
  "Dermatological",
  "Respiratory",
  "Gastrointestinal",
  "General",
];

const DOSAGE_FORMS = ["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops"];

export default function AdminPharmacy() {
  const { formatPrice, currencySign } = useCurrency();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    genericName: "",
    category: "General",
    dosageForm: "Tablet",
    strength: "",
    price: "",
    stockQuantity: 100,
    inStock: true,
    requiresPrescription: false,
    description: "",
  });

  const MEDICINES_QUERY_KEY = ["admin-pharmacy-medicines"];

  const {
    data: medicines = [],
    isLoading: loading,
  } = useQuery({
    queryKey: MEDICINES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await adminApi.get("/admin/pharmacy/medicines");
      return data.data || [];
    },
    meta: { errorMessage: "Failed to load medicines catalog." },
  });

  const setMedicines = (updater) => {
    queryClient.setQueryData(MEDICINES_QUERY_KEY, (prev) =>
      typeof updater === "function" ? updater(prev || []) : updater
    );
  };

  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setForm({
      name: "",
      genericName: "",
      category: "General",
      dosageForm: "Tablet",
      strength: "",
      price: "",
      stockQuantity: 100,
      inStock: true,
      requiresPrescription: false,
      description: "",
      campaignId: 1,
      prepaidCampaignId: 2,
      routeId: 1,
      itemId: 1,
      offerId: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setEditingMedicine(med);
    setForm({
      name: med.name || "",
      genericName: med.genericName || "",
      category: med.category || "General",
      dosageForm: med.dosageForm || "Tablet",
      strength: med.strength || "",
      price: med.price || "",
      stockQuantity: med.stockQuantity || 100,
      inStock: med.inStock !== false,
      requiresPrescription: Boolean(med.requiresPrescription),
      description: med.description || "",
      campaignId: med.campaignId || 1,
      prepaidCampaignId: med.prepaidCampaignId || "",
      routeId: med.routeId || 1,
      itemId: med.itemId || med.vrioProductId || 1,
      offerId: med.offerId || med.vrioOfferId || 1,
    });
    setIsModalOpen(true);
  };

  const handleToggleStock = async (med) => {
    const newStockState = !med.inStock;
    setTogglingId(med._id);

    // Optimistic UI update
    setMedicines((prev) =>
      prev.map((m) => (m._id === med._id ? { ...m, inStock: newStockState } : m))
    );

    try {
      await adminApi.patch(`/admin/pharmacy/medicines/${med._id}/stock`, {
        inStock: newStockState,
      });
      toast.success(
        `${med.name} is now ${newStockState ? "🟢 IN STOCK" : "⚪ OUT OF STOCK"}`
      );
    } catch (error) {
      // Revert on error
      setMedicines((prev) =>
        prev.map((m) => (m._id === med._id ? { ...m, inStock: med.inStock } : m))
      );
      toast.error(error.response?.data?.message || "Failed to update stock status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from catalog?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await adminApi.delete(`/admin/pharmacy/medicines/${id}`);
      toast.success(`${name} removed from inventory.`);
      setMedicines((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete medicine.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      return toast.error("Medicine name and price are required.");
    }

    setSubmitting(true);
    try {
      if (editingMedicine) {
        const res = await adminApi.put(
          `/admin/pharmacy/medicines/${editingMedicine._id}`,
          form
        );
        toast.success("Medicine updated successfully.");
        setMedicines((prev) =>
          prev.map((m) => (m._id === editingMedicine._id ? res.data.data : m))
        );
      } else {
        const res = await adminApi.post("/admin/pharmacy/medicines", form);
        toast.success("Medicine added to pharmacy catalog.");
        setMedicines((prev) => [res.data.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save medicine.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name?.toLowerCase().includes(search.toLowerCase()) ||
      med.genericName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || med.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const inStockCount = medicines.filter((m) => m.inStock).length;
  const outOfStockCount = medicines.filter((m) => !m.inStock).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-indigo-600" /> Pharmacy Inventory & Stock Control
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage pharmaceutical catalog, pricing, formulations, and live stock levels
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl h-11 px-5 text-xs gap-2 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </Button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Products
              </span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {medicines.length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Active catalog SKUs</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                In Stock (Available)
              </span>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">
                {inStockCount}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Ready for patient orders</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Out of Stock
              </span>
              <p className="text-2xl font-black text-rose-600 mt-0.5">
                {outOfStockCount}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Requires inventory refill</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by brand name, generic salt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="text-left p-4">Product Name</th>
                  <th className="text-left p-4">Generic Salt</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Form / Strength</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-center p-4">Stock Status (ON/OFF)</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((med) => {
                  const isUpdatingStock = togglingId === med._id;

                  return (
                    <tr
                      key={med._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{med.name}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {med.requiresPrescription && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                              Rx Required
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            Camp #{med.campaignId || 1} • Item #{med.itemId || med.vrioProductId || 1} • Offer #{med.offerId || med.vrioOfferId || 1}
                          </span>
                          {med.prepaidCampaignId && (
                            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                              Prepaid: #{med.prepaidCampaignId}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 text-xs">
                        {med.genericName || "—"}
                      </td>

                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-100"
                        >
                          {med.category || "General"}
                        </Badge>
                      </td>

                      <td className="p-4 text-slate-600 text-xs">
                        {med.dosageForm || "Tablet"} {med.strength ? `• ${med.strength}` : ""}
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        {formatPrice(med.price)}
                      </td>

                      {/* 1-Click Stock Toggle */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          disabled={isUpdatingStock}
                          onClick={() => handleToggleStock(med)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition shadow-xs cursor-pointer ${
                            med.inStock
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          }`}
                          title={`Click to switch to ${med.inStock ? "OUT OF STOCK" : "IN STOCK"}`}
                        >
                          {isUpdatingStock ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : med.inStock ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{med.inStock ? "IN STOCK" : "OUT OF STOCK"}</span>
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(med)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                            title="Edit Medicine"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === med._id}
                            onClick={() => handleDeleteMedicine(med._id, med.name)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Medicine"
                          >
                            {deletingId === med._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                      No medicines match the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Medicine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-purple-50/50 relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {editingMedicine ? "Edit Pharmaceutical SKU" : "Add New Pharmaceutical Product"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure clinical details, pricing, stock, and Vrio CRM campaign mappings
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
              {/* Section 1: Basic Clinical Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>General Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="name">Brand / Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Atorvastatin 20, Paracetamol 650"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="rounded-xl font-medium"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="genericName">Generic Salt / Molecule Name</Label>
                    <Input
                      id="genericName"
                      placeholder="e.g. Atorvastatin Calcium, Acetaminophen"
                      value={form.genericName}
                      onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category">Therapeutic Category</Label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dosageForm">Dosage Form</Label>
                    <select
                      id="dosageForm"
                      value={form.dosageForm}
                      onChange={(e) => setForm({ ...form, dosageForm: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >
                      {DOSAGE_FORMS.map((formType) => (
                        <option key={formType} value={formType}>
                          {formType}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Dosage & Pricing */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dosage & Commercial Pricing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="strength">Strength / Dosage Concentration</Label>
                    <Input
                      id="strength"
                      placeholder="e.g. 20mg, 500mg, 10mg/ml"
                      value={form.strength}
                      onChange={(e) => setForm({ ...form, strength: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="price">Retail Price ({currencySign}) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 210"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      className="rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="description">Product Description & Indications</Label>
                    <textarea
                      id="description"
                      rows={2}
                      placeholder="Usage indications, therapeutic benefits, contraindications..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Vrio CRM Parameters Card */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-blue-50/40 rounded-2xl border border-indigo-100/90 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                      Vrio CRM Parameters & Offer Mapping
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-100 font-semibold self-start sm:self-auto">
                    Direct Order & Fallback Routing
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="itemId" className="text-[11px] font-bold text-slate-700">
                      Item ID (SKU) *
                    </Label>
                    <Input
                      id="itemId"
                      type="number"
                      min="1"
                      placeholder="e.g. 2083"
                      value={form.itemId}
                      onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                      className="bg-white rounded-xl h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="offerId" className="text-[11px] font-bold text-slate-700">
                      Offer ID *
                    </Label>
                    <Input
                      id="offerId"
                      type="number"
                      min="1"
                      placeholder="e.g. 250"
                      value={form.offerId}
                      onChange={(e) => setForm({ ...form, offerId: e.target.value })}
                      className="bg-white rounded-xl h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="campaignId" className="text-[11px] font-bold text-slate-700">
                      Primary Campaign
                    </Label>
                    <Input
                      id="campaignId"
                      type="number"
                      min="1"
                      placeholder="1 (Default)"
                      value={form.campaignId}
                      onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
                      className="bg-white rounded-xl h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="prepaidCampaignId" className="text-[11px] font-bold text-amber-800">
                      Prepaid Campaign ID *
                    </Label>
                    <Input
                      id="prepaidCampaignId"
                      type="number"
                      min="1"
                      placeholder="e.g. 2"
                      value={form.prepaidCampaignId}
                      onChange={(e) => setForm({ ...form, prepaidCampaignId: e.target.value })}
                      required
                      className="bg-white rounded-xl h-9 text-xs font-mono border-amber-200"
                    />
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <Label htmlFor="routeId" className="text-[11px] font-bold text-slate-700">
                      Route ID
                    </Label>
                    <Input
                      id="routeId"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={form.routeId}
                      onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                      className="bg-white rounded-xl h-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Status & Prescription Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* In Stock Toggle Card */}
                <div
                  onClick={() => setForm({ ...form, inStock: !form.inStock })}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    form.inStock
                      ? "bg-emerald-50/70 border-emerald-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="pr-2">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          form.inStock ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      In Stock Availability
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {form.inStock ? "Patients can purchase immediately" : "Marked as out of stock"}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      form.inStock ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </div>
                </div>

                {/* Prescription Required Toggle Card */}
                <div
                  onClick={() => setForm({ ...form, requiresPrescription: !form.requiresPrescription })}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    form.requiresPrescription
                      ? "bg-purple-50/70 border-purple-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="pr-2">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck
                        className={`w-3.5 h-3.5 ${
                          form.requiresPrescription ? "text-purple-600" : "text-slate-400"
                        }`}
                      />
                      Doctor Rx Required
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {form.requiresPrescription ? "Prescription-only medication" : "Over-the-counter (OTC)"}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      form.requiresPrescription ? "bg-purple-600 justify-end" : "bg-slate-300 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </div>
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
                  ) : editingMedicine ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Update Medicine
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Add to Catalog
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

