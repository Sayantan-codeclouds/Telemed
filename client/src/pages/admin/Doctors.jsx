import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  UserPlus,
  Stethoscope,
  X,
  Sparkles,
  Building,
  CreditCard,
  Award,
  Calendar,
  ArrowUpDown,
  Filter,
  SlidersHorizontal,
  Percent,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";
import api from "@/api/axios";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getProfileImageUrl } from "@/utils/imageUrl";

export default function AdminDoctors() {
  const { formatPrice, currencySign } = useCurrency();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter & Sort state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [specFilter, setSpecFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Commission Modal state
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [selectedDoctorForCommission, setSelectedDoctorForCommission] = useState(null);
  const [commissionInput, setCommissionInput] = useState(10);
  const [savingCommission, setSavingCommission] = useState(false);

  // Add Doctor Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "Password@123",
    specialization: "General Physician",
    hospital: "TeleClinic Medical Center",
    experience: 5,
    qualification: "MBBS",
    licenseNumber: "",
    consultationFee: 500,
    platformCommissionPercent: 10,
    status: "ACTIVE",
  });

  const fetchDoctors = async () => {
    try {
      const { data } = await adminApi.get("/admin/doctors");
      setDoctors(data.data || []);
    } catch (error) {
      console.error("Failed to load doctors:", error);
      toast.error("Failed to load doctor network.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const { data } = await api.get("/specializations");
      if (data?.data && data.data.length > 0) {
        setSpecializations(data.data.map((s) => s.name));
      }
    } catch (error) {
      console.error("Failed to load specializations:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "Password@123",
      specialization: specializations[0] || "General Physician",
      hospital: "TeleClinic Medical Center",
      experience: 5,
      qualification: "MBBS",
      licenseNumber: "",
      consultationFee: 500,
      platformCommissionPercent: 10,
      status: "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleOpenCommissionModal = (doctor) => {
    setSelectedDoctorForCommission(doctor);
    setCommissionInput(doctor.platformCommissionPercent ?? 10);
    setCommissionModalOpen(true);
  };

  const handleSaveCommission = async (e) => {
    e.preventDefault();
    if (!selectedDoctorForCommission) return;

    const rate = Number(commissionInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Please enter a valid percentage between 0% and 100%.");
      return;
    }

    try {
      setSavingCommission(true);
      const res = await adminApi.patch(
        `/admin/doctors/${selectedDoctorForCommission._id}/commission`,
        { commissionPercent: rate }
      );

      setDoctors((prev) =>
        prev.map((d) =>
          d._id === selectedDoctorForCommission._id
            ? { ...d, platformCommissionPercent: rate }
            : d
        )
      );

      toast.success(
        res.data?.message ||
          `Commission set to ${rate}% (${100 - rate}% payout) for Dr. ${selectedDoctorForCommission.firstName} ${selectedDoctorForCommission.lastName}`
      );
      setCommissionModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update commission rate.");
    } finally {
      setSavingCommission(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("First name, last name, email, and phone number are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminApi.post("/admin/doctors", formData);
      toast.success(res.data?.message || "Doctor registered successfully!");
      setModalOpen(false);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create doctor account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (doctor) => {
    const newStatus = doctor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUpdatingStatusId(doctor._id);

    // Optimistic UI update
    setDoctors((prev) =>
      prev.map((d) => (d._id === doctor._id ? { ...d, status: newStatus } : d))
    );

    try {
      await adminApi.patch(`/admin/doctors/${doctor._id}/status`, {
        status: newStatus,
      });
      toast.success(
        `Dr. ${doctor.firstName} ${doctor.lastName} is now ${newStatus === "ACTIVE" ? "🟢 ACTIVE (ON)" : "⚪ INACTIVE (OFF)"}`
      );
    } catch (error) {
      // Revert on error
      setDoctors((prev) =>
        prev.map((d) => (d._id === doctor._id ? { ...d, status: doctor.status } : d))
      );
      toast.error(error.response?.data?.message || "Failed to update doctor status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete Dr. ${name} and all their consultation records?`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await adminApi.delete(`/admin/doctors/${id}`);
      toast.success(res.data.message || "Doctor deleted successfully.");
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete doctor.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and Sort Doctors
  const processedDoctors = useMemo(() => {
    let list = doctors.filter((d) => {
      const term = search.toLowerCase().trim();
      const fullName = `${d.firstName || ""} ${d.lastName || ""}`.toLowerCase();
      const email = (d.email || "").toLowerCase();
      const spec = (d.specialization || "").toLowerCase();
      const hospital = (d.hospital || "").toLowerCase();

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        email.includes(term) ||
        spec.includes(term) ||
        hospital.includes(term);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && d.status === "ACTIVE") ||
        (statusFilter === "INACTIVE" && d.status !== "ACTIVE");

      const matchesSpec =
        specFilter === "ALL" ||
        (d.specialization || "").toLowerCase() === specFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesSpec;
    });

    list.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "name-asc") {
        const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
        const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === "name-desc") {
        const nameA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
        const nameB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
        return nameB.localeCompare(nameA);
      }
      if (sortBy === "fee-desc") {
        return Number(b.consultationFee ?? 500) - Number(a.consultationFee ?? 500);
      }
      if (sortBy === "fee-asc") {
        return Number(a.consultationFee ?? 500) - Number(b.consultationFee ?? 500);
      }
      return 0;
    });

    return list;
  }, [doctors, search, statusFilter, specFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const activeCount = doctors.filter((d) => d.status === "ACTIVE").length;
  const inactiveCount = doctors.filter((d) => d.status !== "ACTIVE").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-1">
            <Stethoscope className="w-3.5 h-3.5" /> Clinical Practitioner Oversight
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Network Oversight</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {doctors.length} doctors total • <strong className="text-emerald-700">{activeCount} Active (ON)</strong> • <span className="text-slate-500">{inactiveCount} Inactive (OFF)</span>
          </p>
        </div>

        <Button
          onClick={handleOpenModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-sm shadow-emerald-200 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add Doctor
        </Button>
      </div>

      {/* Search, Filter & Date Sorting Bar */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, clinic..."
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

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses (Active & Inactive)</option>
              <option value="ACTIVE">🟢 Active Only (ON)</option>
              <option value="INACTIVE">⚪ Inactive Only (OFF)</option>
            </select>
          </div>

          {/* Specialization Filter */}
          <div>
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Field Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer font-semibold"
            >
              <option value="newest">📅 Joined: Newest First</option>
              <option value="oldest">📅 Joined: Oldest First</option>
              <option value="name-asc">🔤 Doctor Name: A to Z</option>
              <option value="name-desc">🔤 Doctor Name: Z to A</option>
              <option value="fee-desc">💰 Fee: High to Low</option>
              <option value="fee-asc">💰 Fee: Low to High</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          {[
            { id: "ALL", label: `All Doctors (${doctors.length})` },
            { id: "ACTIVE", label: `Active (${activeCount})` },
            { id: "INACTIVE", label: `Inactive (${inactiveCount})` },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setStatusFilter(chip.id)}
              className={`shrink-0 text-xs px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                statusFilter === chip.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {chip.label}
            </button>
          ))}

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 ml-3 mr-1">
            Sort:
          </span>
          {[
            { id: "newest", label: "Newest Joined" },
            { id: "oldest", label: "Oldest Joined" },
            { id: "name-asc", label: "Name (A-Z)" },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSortBy(chip.id)}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold transition cursor-pointer ${
                sortBy === chip.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Doctors Table */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="text-left p-4">Doctor</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Specialization</th>
                  <th className="text-left p-4">Fee / Session</th>
                  <th className="text-center p-4">Platform / Payout %</th>
                  <th className="text-left p-4">Verification</th>
                  <th className="text-center p-4">Status (ON / OFF)</th>
                  <th className="text-left p-4">Joined On</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {processedDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No doctors match the selected filters</p>
                      <p className="text-[11px] mt-0.5">Try resetting search, status, or specialization filters</p>
                    </td>
                  </tr>
                ) : (
                  processedDoctors.map((doctor) => {
                    const isActive = doctor.status === "ACTIVE";
                    const isUpdating = updatingStatusId === doctor._id;
                    const avatarUrl = getProfileImageUrl(
                      doctor.profileImage,
                      `Dr. ${doctor.firstName} ${doctor.lastName}`,
                      "16a34a"
                    );

                    return (
                      <tr
                        key={doctor._id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarUrl}
                              alt={doctor.firstName}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  doctor.firstName + " " + doctor.lastName
                                )}&background=16a34a&color=fff&size=80`;
                              }}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-2xs"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {doctor.hospital || "TeleClinic Virtual Clinic"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-600 font-medium">{doctor.email}</p>
                          <p className="text-gray-400 text-[11px] mt-0.5">
                            {doctor.phone || "—"}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            {doctor.specialization || "General Physician"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-900 font-bold">
                          {formatPrice(doctor.consultationFee ?? 500)}
                        </td>
                        {/* Platform / Payout % Column */}
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenCommissionModal(doctor)}
                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/90 text-indigo-700 font-semibold text-xs transition cursor-pointer shadow-2xs hover:shadow-xs"
                            title="Click to customize platform commission & doctor payout rate"
                          >
                            <Percent className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform shrink-0" />
                            <div className="flex flex-col items-start leading-tight text-left">
                              <span className="font-bold text-slate-800 text-[11px]">
                                {100 - (doctor.platformCommissionPercent ?? 10)}% Payout
                              </span>
                              <span className="text-[10px] text-indigo-600 font-medium">
                                {doctor.platformCommissionPercent ?? 10}% Fee
                              </span>
                            </div>
                            <span className="ml-1 text-[10px] text-indigo-500 font-bold opacity-70 group-hover:opacity-100 transition-opacity underline">
                              Set
                            </span>
                          </button>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            className={
                              doctor.isEmailVerified
                                ? "bg-emerald-50 text-emerald-700 text-[10px]"
                                : "bg-amber-50 text-amber-700 text-[10px]"
                            }
                          >
                            {doctor.isEmailVerified ? "Verified" : "Pending"}
                          </Badge>
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(doctor)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isActive ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-slate-400" />
                            )}
                            {isActive ? "ON" : "OFF"}
                          </button>
                        </td>

                        {/* Joined On Column */}
                        <td className="p-4 text-gray-500 text-xs">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {doctor.createdAt
                                ? new Date(doctor.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "—"}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === doctor._id}
                            onClick={() =>
                              handleDeleteDoctor(
                                doctor._id,
                                `${doctor.firstName} ${doctor.lastName}`
                              )
                            }
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Doctor"
                          >
                            {deletingId === doctor._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
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

      {/* Add Doctor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-slate-50 to-blue-50/50 relative">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Register New Physician
                  </h3>
                  <p className="text-xs text-slate-500">
                    Onboard a licensed doctor to the TeleClinic provider network
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Form - Scrollable */}
            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="docFirstName">First Name *</Label>
                  <Input
                    id="docFirstName"
                    placeholder="e.g. Arun"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="docLastName">Last Name *</Label>
                  <Input
                    id="docLastName"
                    placeholder="e.g. Mukherjee"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="docEmail">Email Address *</Label>
                  <Input
                    id="docEmail"
                    type="email"
                    placeholder="dr.arun@teleclinic.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="docPhone">Phone Number *</Label>
                  <Input
                    id="docPhone"
                    placeholder="+91 98301 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="docSpecialization">Primary Specialization *</Label>
                  <select
                    id="docSpecialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    {specializations.length > 0 ? (
                      specializations.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))
                    ) : (
                      <option value="General Physician">General Physician</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docHospital">Hospital / Medical Center *</Label>
                  <Input
                    id="docHospital"
                    placeholder="e.g. Apollo Gleneagles Hospital"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="docExp">Experience (Years)</Label>
                  <Input
                    id="docExp"
                    type="number"
                    placeholder="e.g. 10"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="docQual">Degrees & Certs</Label>
                  <Input
                    id="docQual"
                    placeholder="e.g. MBBS, MD"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="docFee">Consultation Fee ({currencySign})</Label>
                  <Input
                    id="docFee"
                    type="number"
                    placeholder="e.g. 500"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="docCommission">Platform Fee (%)</Label>
                  <div className="relative">
                    <Input
                      id="docCommission"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="10"
                      value={formData.platformCommissionPercent}
                      onChange={(e) => setFormData({ ...formData, platformCommissionPercent: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      required
                      className="rounded-xl pr-7 font-bold text-indigo-700"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 bg-indigo-50/60 border border-indigo-100 rounded-xl p-2 px-3">
                💼 <strong>Payout Split:</strong> Doctor receives <span className="font-bold text-emerald-700">{100 - (formData.platformCommissionPercent || 0)}%</span> take-home, TeleClinic platform retains <span className="font-bold text-indigo-700">{formData.platformCommissionPercent || 0}%</span>.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="docLicense">Medical License / Reg No.</Label>
                  <Input
                    id="docLicense"
                    placeholder="e.g. MCI-2024-9988"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docPassword">Temporary Password</Label>
                  <Input
                    id="docPassword"
                    type="text"
                    placeholder="Password@123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Initial Account Status</p>
                  <p className="text-[11px] text-slate-500">
                    Active physicians can immediately log in and set up consultation slots
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      status: formData.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                    })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    formData.status === "ACTIVE"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {formData.status === "ACTIVE" ? "ACTIVE (ON)" : "INACTIVE (OFF)"}
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
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-10 px-6 gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Register Doctor
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Commission & Payout Rate Modal */}
      {commissionModalOpen && selectedDoctorForCommission && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-slate-50 relative">
              <button
                type="button"
                onClick={() => setCommissionModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Set Doctor Payout & Commission
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dr. {selectedDoctorForCommission.firstName} {selectedDoctorForCommission.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveCommission} className="p-6 space-y-5">
              {/* Doctor Details Pill */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Specialization
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedDoctorForCommission.specialization || "General Physician"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Consultation Fee
                  </span>
                  <p className="text-xs font-black text-emerald-600">
                    {formatPrice(selectedDoctorForCommission.consultationFee ?? 500)}
                  </p>
                </div>
              </div>

              {/* Commission Rate Input */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="commRate" className="text-xs font-bold text-slate-700">
                    Platform Commission Rate (%)
                  </Label>
                  <span className="text-xs font-black text-indigo-600">
                    {commissionInput}% Platform / {Math.max(0, 100 - Number(commissionInput))}% Doctor
                  </span>
                </div>

                <div className="relative">
                  <Input
                    id="commRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(Math.min(100, Math.max(0, Number(e.target.value))))}
                    required
                    className="rounded-2xl pr-10 text-sm font-bold text-slate-800"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    %
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
                  {[0, 5, 10, 15, 20, 25].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCommissionInput(preset)}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        Number(commissionInput) === preset
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Breakdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-slate-50 border border-indigo-100/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Gross Consultation Fee</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(selectedDoctorForCommission.consultationFee ?? 500)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-indigo-700 font-medium">
                  <span>Platform Commission ({commissionInput}%)</span>
                  <span className="font-bold">
                    {formatPrice(
                      Math.round(((selectedDoctorForCommission.consultationFee ?? 500) * Number(commissionInput)) / 100)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-indigo-100/80 flex items-center justify-between text-emerald-700 font-bold">
                  <span>Doctor Payout ({Math.max(0, 100 - Number(commissionInput))}%)</span>
                  <span className="text-sm font-black">
                    {formatPrice(
                      (selectedDoctorForCommission.consultationFee ?? 500) -
                        Math.round(((selectedDoctorForCommission.consultationFee ?? 500) * Number(commissionInput)) / 100)
                    )}
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCommissionModalOpen(false)}
                  className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={savingCommission}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs h-10 px-6 gap-2 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  {savingCommission ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Save Rate
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
