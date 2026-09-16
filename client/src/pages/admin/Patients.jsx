import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  UserPlus,
  X,
  User,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";
import { getProfileImageUrl } from "@/utils/imageUrl";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter & Sort state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Add Patient Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "Password@123",
    gender: "Male",
    bloodGroup: "O+",
    dateOfBirth: "",
    status: "ACTIVE",
  });

  const fetchPatients = async () => {
    try {
      const { data } = await adminApi.get("/admin/patients");
      setPatients(data.data || []);
    } catch (error) {
      console.error("Failed to load patients:", error);
      toast.error("Failed to load patient accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "Password@123",
      gender: "Male",
      bloodGroup: "O+",
      dateOfBirth: "",
      status: "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("First name, last name, email, and phone are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminApi.post("/admin/patients", formData);
      toast.success(res.data?.message || "Patient registered successfully!");
      setModalOpen(false);
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create patient account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (patient) => {
    const newStatus = patient.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUpdatingStatusId(patient._id);

    // Optimistic UI update
    setPatients((prev) =>
      prev.map((p) => (p._id === patient._id ? { ...p, status: newStatus } : p))
    );

    try {
      await adminApi.patch(`/admin/patients/${patient._id}/status`, {
        status: newStatus,
      });
      toast.success(
        `Patient ${patient.firstName} ${patient.lastName} is now ${newStatus === "ACTIVE" ? "🟢 ACTIVE (ON)" : "⚪ INACTIVE (OFF)"}`
      );
    } catch (error) {
      // Revert on error
      setPatients((prev) =>
        prev.map((p) => (p._id === patient._id ? { ...p, status: patient.status } : p))
      );
      toast.error(error.response?.data?.message || "Failed to update patient status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeletePatient = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete patient "${name}" and all associated appointments?`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await adminApi.delete(`/admin/patients/${id}`);
      toast.success(res.data.message || "Patient deleted successfully.");
      setPatients((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete patient.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and Sort Patients
  const processedPatients = useMemo(() => {
    let list = patients.filter((p) => {
      const term = search.toLowerCase().trim();
      const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      const email = (p.email || "").toLowerCase();
      const phone = p.phone || "";

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && p.status === "ACTIVE") ||
        (statusFilter === "INACTIVE" && p.status !== "ACTIVE");

      const matchesGender =
        genderFilter === "ALL" ||
        (p.gender || "").toLowerCase() === genderFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesGender;
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
      return 0;
    });

    return list;
  }, [patients, search, statusFilter, genderFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const activeCount = patients.filter((p) => p.status === "ACTIVE").length;
  const inactiveCount = patients.filter((p) => p.status !== "ACTIVE").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-1">
            <User className="w-3.5 h-3.5" /> Patient Directory
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Accounts</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {patients.length} patient accounts • <strong className="text-emerald-700">{activeCount} Active (ON)</strong> • <span className="text-slate-500">{inactiveCount} Inactive (OFF)</span>
          </p>
        </div>

        <Button
          onClick={handleOpenModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-sm shadow-indigo-200 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add Patient
        </Button>
      </div>

      {/* Search, Filter & Date Sorting Bar */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone..."
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

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Name Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer font-semibold"
            >
              <option value="newest">📅 Joined: Newest First</option>
              <option value="oldest">📅 Joined: Oldest First</option>
              <option value="name-asc">🔤 Patient Name: A to Z</option>
              <option value="name-desc">🔤 Patient Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          {[
            { id: "ALL", label: `All Patients (${patients.length})` },
            { id: "ACTIVE", label: `Active (${activeCount})` },
            { id: "INACTIVE", label: `Inactive (${inactiveCount})` },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setStatusFilter(chip.id)}
              className={`shrink-0 text-xs px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                statusFilter === chip.id
                  ? "bg-indigo-600 text-white shadow-xs"
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

      {/* Patients Table */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="text-left p-4">Patient</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Blood Group / Gender</th>
                  <th className="text-left p-4">Verification</th>
                  <th className="text-center p-4">Status (ON / OFF)</th>
                  <th className="text-left p-4">Joined On</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {processedPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No patients match the selected filters</p>
                      <p className="text-[11px] mt-0.5">Try resetting search or status filters</p>
                    </td>
                  </tr>
                ) : (
                  processedPatients.map((patient) => {
                    const isActive = patient.status === "ACTIVE";
                    const isUpdating = updatingStatusId === patient._id;
                    const avatarUrl = getProfileImageUrl(
                      patient.profileImage,
                      `${patient.firstName} ${patient.lastName}`,
                      "2563eb"
                    );

                    return (
                      <tr
                        key={patient._id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="p-4 font-semibold text-gray-900">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarUrl}
                              alt={patient.firstName}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  patient.firstName + " " + patient.lastName
                                )}&background=2563eb&color=fff&size=80`;
                              }}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200 shadow-2xs"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: #{patient._id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-600 font-medium">{patient.email}</p>
                          <p className="text-gray-400 text-[11px] mt-0.5">
                            {patient.phone || "—"}
                          </p>
                        </td>
                        <td className="p-4 text-gray-600">
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg font-medium text-[11px] border border-slate-200/60">
                            {patient.bloodGroup || "O+"} • {patient.gender || "Male"}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            className={
                              patient.isEmailVerified
                                ? "bg-emerald-50 text-emerald-700 text-[10px]"
                                : "bg-amber-50 text-amber-700 text-[10px]"
                            }
                          >
                            {patient.isEmailVerified ? "Verified" : "Pending"}
                          </Badge>
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(patient)}
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

                        <td className="p-4 text-gray-500 text-xs">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {patient.createdAt
                                ? new Date(patient.createdAt).toLocaleDateString(undefined, {
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
                            disabled={deletingId === patient._id}
                            onClick={() =>
                              handleDeletePatient(
                                patient._id,
                                `${patient.firstName} ${patient.lastName}`
                              )
                            }
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Patient"
                          >
                            {deletingId === patient._id ? (
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

      {/* Add Patient Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/50 relative">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Register New Patient
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create a new patient chart and credentials in the TeleClinic network
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePatient} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="e.g. Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Password@123"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="rounded-xl font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400 block">
                  Defaults to Password@123. The patient can change this anytime.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <select
                    id="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Initial Account Status</p>
                  <p className="text-[11px] text-slate-500">
                    Active patients can log in and book appointments immediately
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs h-10 px-6 gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Register Patient
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
