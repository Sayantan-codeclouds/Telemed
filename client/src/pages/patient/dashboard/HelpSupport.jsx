import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LifeBuoy,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Loader2,
  RefreshCw,
  Inbox,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/api/axios";

const CATEGORIES = [
  "Technical & App Issue",
  "Appointments & Consultations",
  "Prescriptions & Medicines",
  "Pharmacy & Delivery",
  "Billing & Payments",
  "Gift Cards & Coupons",
  "Account & Security",
  "General Inquiry",
];

const STATUS_CONFIG = {
  OPEN: {
    label: "Open - In Queue",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "Under Review",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: RefreshCw,
  },
  SOLVED: {
    label: "Solved",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Closed",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    icon: CheckCircle2,
  },
};

const PRIORITY_CONFIG = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  URGENT: "bg-rose-50 text-rose-700 border-rose-200",
};

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "SOLVED", label: "Solved" },
  { key: "CLOSED", label: "Closed" },
];

export default function PatientHelpSupport() {
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const patient = JSON.parse(localStorage.getItem("patient") || "{}");

  const [form, setForm] = useState({
    name: `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "",
    email: patient.email || "",
    phone: patient.phone || "",
    category: "General Inquiry",
    priority: "MEDIUM",
    subject: "",
    message: "",
  });

  const { data: supportEmail = "support@teleclinic.com" } = useQuery({
    queryKey: ["patient-support-settings"],
    queryFn: async () => {
      const { data } = await api.get("/settings");
      return data?.data?.supportEmail || "support@teleclinic.com";
    },
  });

  const {
    data: tickets = [],
    isLoading: loading,
    refetch: fetchTickets,
  } = useQuery({
    queryKey: ["patient-my-tickets"],
    queryFn: async () => {
      const { data } = await api.get("/support/my-tickets");
      return data?.data || [];
    },
    meta: { onError: (err) => console.error("Failed to load support tickets:", err) },
  });

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      solved: tickets.filter((t) => t.status === "SOLVED").length,
    }),
    [tickets]
  );

  const filteredTickets = useMemo(
    () => (statusFilter === "ALL" ? tickets : tickets.filter((t) => t.status === statusFilter)),
    [tickets, statusFilter]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in both the subject and detailed message.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/support/submit", form);
      toast.success(res.data?.message || "Support ticket submitted successfully!");
      setForm((prev) => ({
        ...prev,
        subject: "",
        message: "",
        category: "General Inquiry",
        priority: "MEDIUM",
      }));
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit support request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-900/40">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>24/7 Patient Support & Clinical Assistance</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Help & Support Center
            </h1>
            <p className="text-indigo-200/80 text-sm max-w-xl">
              Have an issue with your appointment, medication order, or account? Submit a ticket below and our healthcare team will respond via email and portal.
            </p>
          </div>

          {/* Quick Contact Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-indigo-200">
              <Mail className="w-4 h-4 text-indigo-300" />
              <span className="font-semibold text-white">{supportEmail}</span>
            </div>
            <div className="flex items-center gap-2.5 text-indigo-200">
              <Clock className="w-4 h-4 text-indigo-300" />
              <span>Average Response Time: &lt; 2 Hours</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Submit Ticket Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl border-slate-200/80 shadow-sm bg-white p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-indigo-600" />
                Submit a Support Request
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the form below. We'll send an instant email confirmation with your tracking ticket reference.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Your Full Name</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Email Address (for reply)</Label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Issue Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Urgency Priority</Label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="LOW">Low - General Question</option>
                    <option value="MEDIUM">Medium - Normal Request</option>
                    <option value="HIGH">High - Important issue</option>
                    <option value="URGENT">Urgent - Critical / Prescription block</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Subject Summary</Label>
                <Input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200"
                  placeholder="Briefly state your concern (e.g. Pharmacy Order #35520 tracking)"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Detailed Message</Label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  placeholder="Please describe the issue in detail so our support team can assist you quickly..."
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Email & Submitting Ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Support Request
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Submitted Tickets History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Your Support Requests</h2>
            <Button
              onClick={fetchTickets}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs h-8 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Inbox className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Open</span>
              </div>
              <p className="text-xl font-black text-amber-600 mt-1">{stats.open}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">In Review</span>
              </div>
              <p className="text-xl font-black text-blue-600 mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Solved</span>
              </div>
              <p className="text-xl font-black text-emerald-600 mt-1">{stats.solved}</p>
            </div>
          </div>

          {/* Status Filter Pills */}
          {tickets.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                    statusFilter === f.key
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20"
                      : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
                  }`}
                >
                  {f.label}
                  {f.key !== "ALL" && (
                    <span className="ml-1 opacity-70">
                      ({tickets.filter((t) => t.status === f.key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white space-y-3 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                    <div className="h-5 w-20 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
                  <div className="h-10 w-full bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 rounded-3xl bg-slate-50/60 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No support tickets yet</p>
              <p className="text-xs text-slate-400">
                Any tickets you submit will appear here with live resolution updates from our admin team.
              </p>
            </Card>
          ) : filteredTickets.length === 0 ? (
            <Card className="p-6 text-center border-dashed border-2 rounded-3xl bg-slate-50/60 space-y-1">
              <p className="text-sm font-bold text-slate-700">No tickets in this status</p>
              <p className="text-xs text-slate-400">Try a different filter above.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((t) => {
                const statusMeta = STATUS_CONFIG[t.status] || STATUS_CONFIG.OPEN;
                const priorityClass = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.MEDIUM;

                return (
                  <Card
                    key={t._id}
                    className="p-4 sm:p-5 rounded-2xl border-slate-200/80 shadow-xs bg-white space-y-3 hover:border-indigo-200 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          #{t.ticketId}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                          {t.subject}
                        </h4>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusMeta.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {t.category}
                      </span>
                      {t.priority === "URGENT" || t.priority === "HIGH" ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold border ${priorityClass}`}
                        >
                          <Flame className="w-2.5 h-2.5" />
                          {t.priority}
                        </span>
                      ) : null}
                      <span>•</span>
                      <span>
                        {new Date(t.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl line-clamp-3">
                      {t.message}
                    </p>

                    {/* Admin Resolution Section */}
                    {t.status === "SOLVED" && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Admin Solution / Reply:</span>
                        </div>
                        <p className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed">
                          {t.adminResponse || "Your request has been verified and marked as solved by the support team."}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
