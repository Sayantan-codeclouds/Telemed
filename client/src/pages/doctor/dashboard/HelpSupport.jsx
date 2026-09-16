import { useState, useEffect, useMemo } from "react";
import {
  LifeBuoy,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  Stethoscope,
  Loader2,
  Inbox,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import doctorApi from "@/api/doctorApi";

const DOCTOR_CATEGORIES = [
  "Clinical & Consultation Platform",
  "Patient Records & History",
  "E-Prescription & Pharmacy Sync",
  "Doctor Availability & Scheduling",
  "Payouts & Compensation",
  "Account & Verification",
  "General Physician Support",
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

export default function DoctorHelpSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");

  const [form, setForm] = useState({
    name: `Dr. ${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || "",
    email: doctor.email || "",
    phone: doctor.phone || "",
    category: "Clinical & Consultation Platform",
    priority: "HIGH",
    subject: "",
    message: "",
  });

  const [doctorSupportEmail, setDoctorSupportEmail] = useState("sayantan.das@codeclouds.com");

  const fetchSettings = async () => {
    try {
      const { data } = await doctorApi.get("/settings");
      if (data?.data?.doctorSupportEmail || data?.data?.supportEmail) {
        setDoctorSupportEmail(data.data.doctorSupportEmail || data.data.supportEmail);
      }
    } catch {
      // fallback
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await doctorApi.get("/support/doctor/my-tickets");
      setTickets(data?.data || []);
    } catch (err) {
      console.error("Failed to load doctor tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchSettings();
  }, []);

  const stats = useMemo(
    () => ({
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
      toast.error("Please fill in both the subject and message.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please provide a valid email.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await doctorApi.post("/support/doctor/submit", form);
      toast.success(res.data?.message || "Doctor support request sent!");
      setForm((prev) => ({
        ...prev,
        subject: "",
        message: "",
        category: "Clinical & Consultation Platform",
        priority: "HIGH",
      }));
      // Small delay to let the DB write settle before re-fetching
      setTimeout(() => fetchTickets(), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20 border border-emerald-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur-md">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
              <span>Priority Clinical Desk & Technical Support</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Doctor Help & Support
            </h1>
            <p className="text-emerald-200/80 text-sm max-w-xl">
              Direct assistance for medical consultation streaming, e-prescription sync, patient records, or account settings.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl space-y-1.5 text-xs text-emerald-100">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-300" />
              <span className="font-bold text-white">{doctorSupportEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>Dedicated Clinical SLA: &lt; 30 Mins</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Submit form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl border-slate-200/80 shadow-sm bg-white p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-emerald-600" />
                Submit Physician Request
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Our support team will receive your query immediately and reply to your registered doctor email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Doctor Name</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Official Email</Label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Department Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {DOCTOR_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Priority Level</Label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="LOW">Low - General query</option>
                    <option value="MEDIUM">Medium - Operational issue</option>
                    <option value="HIGH">High - Consultation / Schedule impact</option>
                    <option value="URGENT">Urgent - Clinical emergency / block</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Subject</Label>
                <Input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200"
                  placeholder="e.g. Video stream issue during consultation #124"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Detailed Message</Label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  placeholder="Describe your issue or feedback..."
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Doctor Ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Ticket
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Your Tickets</h2>
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
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
                      : "bg-white text-slate-500 border-slate-200 hover:border-emerald-200 hover:text-emerald-600"
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
              <p className="text-sm font-bold text-slate-700">No support tickets</p>
              <p className="text-xs text-slate-400">All submitted doctor support tickets will appear here.</p>
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
                    className="p-4 sm:p-5 rounded-2xl border-slate-200/80 shadow-xs bg-white space-y-3 hover:border-emerald-200 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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

                    {t.status === "SOLVED" && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Admin Solution:</span>
                        </div>
                        <p className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed">
                          {t.adminResponse || "Ticket marked as resolved."}
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
