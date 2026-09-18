import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Stethoscope,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Layers,
  X,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
} from "@/components/ui/select";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";

const CATEGORIES = ["All", "Clinical", "Surgical", "Specialist", "Wellness", "Diagnostic", "Other"];

const CATEGORY_COLORS = {
  Clinical: "bg-blue-50 text-blue-700 border-blue-200",
  Surgical: "bg-rose-50 text-rose-700 border-rose-200",
  Specialist: "bg-purple-50 text-purple-700 border-purple-200",
  Wellness: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Diagnostic: "bg-amber-50 text-amber-700 border-amber-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

const SPECIALIZATIONS_QUERY_KEY = ["admin-specializations"];

export default function AdminSpecializations() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Clinical",
    description: "",
    displayOrder: 0,
    isActive: true,
  });

  const {
    data: specializations = [],
    isLoading: loading,
    refetch: fetchSpecializations,
  } = useQuery({
    queryKey: SPECIALIZATIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await adminApi.get("/specializations/admin");
      return res.data?.data || [];
    },
    meta: { errorMessage: "Failed to load specializations from database." },
  });

  const setSpecializations = (updater) => {
    queryClient.setQueryData(SPECIALIZATIONS_QUERY_KEY, (prev) =>
      typeof updater === "function" ? updater(prev || []) : updater
    );
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "Clinical",
      description: "",
      displayOrder: specializations.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      category: item.category || "Clinical",
      description: item.description || "",
      displayOrder: item.displayOrder ?? 0,
      isActive: Boolean(item.isActive),
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Specialization name is required.");
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        const res = await adminApi.put(`/specializations/admin/${editingItem._id}`, formData);
        toast.success(res.data?.message || "Specialization updated successfully!");
      } else {
        const res = await adminApi.post("/specializations/admin", formData);
        toast.success(res.data?.message || "Specialization created successfully!");
      }
      setModalOpen(false);
      fetchSpecializations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save specialization.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      setTogglingId(item._id);
      const res = await adminApi.patch(`/specializations/admin/${item._id}/toggle`);
      toast.success(res.data?.message || "Status updated!");
      setSpecializations((prev) =>
        prev.map((s) => (s._id === item._id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (item) => {
    if (item.doctorCount > 0) {
      toast.error(
        `Cannot delete "${item.name}" because ${item.doctorCount} active physician(s) are assigned to it. Toggle it to inactive instead.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete "${item.name}"?`)) {
      return;
    }

    try {
      setDeletingId(item._id);
      const res = await adminApi.delete(`/specializations/admin/${item._id}`);
      toast.success(res.data?.message || "Specialization deleted successfully.");
      setSpecializations((prev) => prev.filter((s) => s._id !== item._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete specialization.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSpecializations = useMemo(() => {
    return specializations.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        (item.description || "").toLowerCase().includes(search.toLowerCase().trim());

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [specializations, search, selectedCategory]);

  const activeCount = specializations.filter((s) => s.isActive).length;
  const totalDoctors = specializations.reduce((sum, s) => sum + (s.doctorCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            Clinical Master Registry
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Doctor Specializations
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure the types of doctors, clinical specialties, and medical categories available platform-wide
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl h-11 px-6 text-xs sm:text-sm gap-2 shadow-md shadow-indigo-200 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Specialization
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-0 shadow-sm rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Specializations
              </span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{specializations.length}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active in System
              </span>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{activeCount}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm rounded-3xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Assigned Physicians
              </span>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{totalDoctors}</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-0 shadow-sm rounded-3xl bg-white p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search specializations by name or clinical scope..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-slate-50 border-slate-200 text-xs sm:text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : `${cat} Category`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Categories:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Specializations Table */}
      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">Specialization Name</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Clinical Scope / Description</th>
                <th className="py-4 px-5 text-center">Physicians</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSpecializations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No specializations found</p>
                    <p className="text-[11px] mt-0.5">Try clearing search filters or add a new specialization</p>
                  </td>
                </tr>
              ) : (
                filteredSpecializations.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                          <span className="text-[10px] font-mono text-slate-400">
                            Order #{item.displayOrder ?? 0}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-5">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-bold border ${
                          CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other
                        }`}
                      >
                        {item.category || "Clinical"}
                      </Badge>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-5 max-w-xs text-slate-600 leading-relaxed">
                      {item.description || "—"}
                    </td>

                    {/* Assigned Doctors */}
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                        <Users className="w-3 h-3 text-slate-400" />
                        {item.doctorCount || 0}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        disabled={togglingId === item._id}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {togglingId === item._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : item.isActive ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          title="Edit Specialization"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === item._id || item.doctorCount > 0}
                          onClick={() => handleDelete(item)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-30 cursor-pointer"
                          title={
                            item.doctorCount > 0
                              ? "Cannot delete while doctors are assigned"
                              : "Delete Specialization"
                          }
                        >
                          {deletingId === item._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-blue-50/50 relative">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingItem ? "Edit Specialization" : "Create New Specialization"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingItem
                      ? `Update parameters for "${editingItem.name}"`
                      : "Add a new medical specialty to the doctor database"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Specialization Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Cardiologist, Neurologist, Orthopedic Surgeon"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Clinical Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Clinical Scope / Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Brief summary of ailments, body systems, or surgeries treated..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Active Status</p>
                  <p className="text-[11px] text-slate-500">
                    Active specialties appear in doctor profiles and search filters
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    formData.isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {formData.isActive ? "Active" : "Inactive"}
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs h-10 px-6 gap-2 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {editingItem ? "Update Specialization" : "Create Specialization"}
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
