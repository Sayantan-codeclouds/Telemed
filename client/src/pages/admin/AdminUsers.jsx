import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  Shield,
  Headphones,
  UserPlus,
  Search,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Lock,
  RefreshCw,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";

const ROLE_CONFIG = {
  SuperAdmin: {
    label: "Super Admin",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    icon: ShieldCheck,
    desc: "Full system authority. Controls CRM gateway, API keys, and admin user permissions.",
  },
  Admin: {
    label: "Admin",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Shield,
    desc: "Operational manager. Manages doctors, patients, appointments, pharmacy, and coupons.",
  },
  CustomerSupport: {
    label: "Customer Support",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Headphones,
    desc: "Frontline support specialist. Handles patient tickets, consultations, orders, and resends invoices.",
  },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Current logged in admin info
  const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
  const isSuperAdmin = currentAdmin.role === "SuperAdmin";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "CustomerSupport",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.get("/admin/users");
      setUsers(data.data || []);
    } catch (err) {
      console.error("Failed to load admin team:", err);
      toast.error(err.response?.data?.message || "Failed to load admin users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await adminApi.post("/admin/users", formData);
      toast.success(data.message || "Admin team member created successfully!");
      setIsAddModalOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "CustomerSupport",
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      const { data } = await adminApi.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(data.message || "Role updated successfully!");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      setUpdatingId(user._id);
      const { data } = await adminApi.patch(`/admin/users/${user._id}/status`, { status: nextStatus });
      toast.success(data.message || `User marked as ${nextStatus}!`);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} (${user.email}) from the admin team?`)) {
      return;
    }

    try {
      setUpdatingId(user._id);
      const { data } = await adminApi.delete(`/admin/users/${user._id}`);
      toast.success(data.message || "Admin user removed successfully.");
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete admin user.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const counts = {
    total: users.length,
    superAdmin: users.filter((u) => u.role === "SuperAdmin").length,
    admin: users.filter((u) => u.role === "Admin").length,
    support: users.filter((u) => u.role === "CustomerSupport").length,
    active: users.filter((u) => u.status === "ACTIVE").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-600" /> Admin Team & RBAC Permissions
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage admin users, assign Customer Support roles, and enforce security boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="rounded-xl font-bold gap-2 text-xs h-10 border-slate-200"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            Reload
          </Button>

          {isSuperAdmin && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold gap-2 text-xs h-10 shadow-lg shadow-indigo-600/20"
            >
              <UserPlus className="w-4 h-4" />
              Add Team Member
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Team</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{counts.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Customer Support</span>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{counts.support}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Super Admins</span>
              <p className="text-2xl font-black text-purple-600 mt-0.5">{counts.superAdmin}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Active Accounts</span>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{counts.active}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
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
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {["ALL", "CustomerSupport", "Admin", "SuperAdmin"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  roleFilter === role
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {role === "ALL" ? "All Roles" : ROLE_CONFIG[role]?.label || role}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Admin Users Table */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="text-left p-4">Team Member</th>
                  <th className="text-left p-4">Contact Info</th>
                  <th className="text-left p-4">Assigned Role</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-left p-4">Joined Date</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const roleMeta = ROLE_CONFIG[user.role] || ROLE_CONFIG.CustomerSupport;
                  const isSelf = user._id === currentAdmin.id || user._id === currentAdmin._id;
                  const isUpdating = updatingId === user._id;

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-indigo-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {user.firstName?.[0] || "U"}
                            {user.lastName?.[0] || ""}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              {user.firstName} {user.lastName}
                              {isSelf && (
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-mono">
                              ID: {user._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4">
                        <div className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {user.phone}
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        {isSuperAdmin && !isSelf ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={user.role}
                              disabled={isUpdating}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className={`text-xs font-bold border rounded-xl px-2.5 py-1.5 outline-none cursor-pointer ${roleMeta.badge}`}
                            >
                              <option value="CustomerSupport">Customer Support</option>
                              <option value="Admin">Admin</option>
                              <option value="SuperAdmin">Super Admin</option>
                            </select>
                          </div>
                        ) : (
                          <Badge className={`${roleMeta.badge} font-bold text-xs`}>
                            <roleMeta.icon className="w-3 h-3 mr-1" />
                            {roleMeta.label}
                          </Badge>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-tight">
                          {roleMeta.desc}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          disabled={isUpdating || isSelf || !isSuperAdmin}
                          onClick={() => handleStatusToggle(user)}
                          title={isSelf ? "Cannot deactivate yourself" : "Toggle status"}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          } ${isSelf || !isSuperAdmin ? "cursor-default opacity-80" : "cursor-pointer"}`}
                        >
                          {user.status === "ACTIVE" ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-xs text-slate-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {isSuperAdmin && !isSelf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleDeleteUser(user)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            title="Remove admin team member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-slate-400 text-xs">
                      No admin users found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-0 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Add Team Member
                  </h3>
                  <p className="text-xs text-slate-400">
                    Provision new administrator or customer support access.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                    First Name *
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Alex"
                    required
                    className="rounded-xl h-10"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                    Last Name *
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Morgan"
                    required
                    className="rounded-xl h-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="alex.morgan@teleclinic.com"
                  required
                  className="rounded-xl h-10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Temporary Password *
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                  required
                  className="rounded-xl h-10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Phone Number (Optional)
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-xl h-10"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">
                  Assign Portal Role *
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      id: "CustomerSupport",
                      label: "Customer Support Specialist",
                      desc: "Can manage support tickets, view patients, view orders, and resend invoice emails. Restricted from CRM gateway and API keys.",
                      icon: Headphones,
                      badge: "text-emerald-700 border-emerald-300 bg-emerald-50",
                    },
                    {
                      id: "Admin",
                      label: "Operations Admin",
                      desc: "Can manage doctors, patients, appointments, pharmacy catalogue, orders, and coupons.",
                      icon: Shield,
                      badge: "text-blue-700 border-blue-300 bg-blue-50",
                    },
                    {
                      id: "SuperAdmin",
                      label: "Super Admin",
                      desc: "Full system authority. Has access to all modules, CRM gateway, API keys, and team provisioning.",
                      icon: ShieldCheck,
                      badge: "text-purple-700 border-purple-300 bg-purple-50",
                    },
                  ].map((roleOption) => (
                    <div
                      key={roleOption.id}
                      onClick={() => setFormData((prev) => ({ ...prev, role: roleOption.id }))}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                        formData.role === roleOption.id
                          ? "border-indigo-600 bg-indigo-50/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={roleOption.id}
                        checked={formData.role === roleOption.id}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <roleOption.icon className="w-4 h-4 text-slate-700" />
                          <span className="text-xs font-bold text-slate-900">{roleOption.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {roleOption.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl text-xs font-bold h-10 px-5 border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-10 px-5 gap-2 shadow-sm"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Create Team Member
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
