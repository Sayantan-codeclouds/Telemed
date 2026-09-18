import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  User,
  Stethoscope,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";

const STATUS_FILTERS = ["ALL", "OPEN", "IN_PROGRESS", "SOLVED", "CLOSED"];
const SENDER_FILTERS = ["ALL", "Patient", "Doctor", "Guest"];

const STATUS_CONFIG = {
  OPEN: {
    label: "Open / New",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
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

const PRIORITY_BADGES = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-rose-50 text-rose-700 border-rose-200 font-black",
};

const DEFAULT_COUNTS = { total: 0, open: 0, inProgress: 0, solved: 0 };

export default function AdminSupportTickets() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSender, setSelectedSender] = useState("ALL");

  // Resolution modal state
  const [resolvingId, setResolvingId] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const {
    data: { tickets, counts } = { tickets: [], counts: DEFAULT_COUNTS },
    isLoading: loading,
    refetch: fetchTickets,
  } = useQuery({
    // `search` is intentionally excluded: search only re-fetches on explicit submit.
    queryKey: ["admin-support-tickets", selectedStatus, selectedSender],
    queryFn: async () => {
      const params = {};
      if (selectedStatus !== "ALL") params.status = selectedStatus;
      if (selectedSender !== "ALL") params.senderType = selectedSender;
      if (search.trim()) params.search = search.trim();

      const { data } = await adminApi.get("/support/admin/tickets", { params });
      return { tickets: data?.data || [], counts: data?.counts || DEFAULT_COUNTS };
    },
    meta: { errorMessage: "Failed to load support tickets." },
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleUpdateStatus = async (ticketId, newStatus, response = "", notes = "") => {
    try {
      setUpdating(true);
      const payload = { status: newStatus };
      if (response.trim()) payload.adminResponse = response.trim();
      if (notes.trim()) payload.adminNotes = notes.trim();

      const res = await adminApi.patch(`/support/admin/tickets/${ticketId}`, payload);
      toast.success(
        newStatus === "SOLVED"
          ? `Ticket #${res.data?.data?.ticketId} marked as SOLVED! Confirmation email dispatched to user.`
          : `Ticket status updated to ${newStatus}.`
      );

      setResolvingId(null);
      setResponseText("");
      setAdminNotes("");
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to permanently delete this support ticket?")) {
      return;
    }
    try {
      await adminApi.delete(`/support/admin/tickets/${ticketId}`);
      toast.success("Support ticket deleted.");
      fetchTickets();
    } catch {
      toast.error("Failed to delete support ticket.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <LifeBuoy className="w-7 h-7 text-indigo-600" />
            Support Help Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage incoming email support tickets from patients and doctors, reply, and mark as resolved.
          </p>
        </div>

        <Button
          onClick={fetchTickets}
          variant="outline"
          className="rounded-2xl h-10 px-4 text-xs font-bold border-slate-200 hover:bg-slate-50 gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Desk
        </Button>
      </div>

      {/* Metrics Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 rounded-3xl border-slate-200 shadow-xs bg-white space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tickets</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{counts.total}</p>
        </Card>

        <Card className="p-5 rounded-3xl border-amber-200 shadow-xs bg-amber-50/50 space-y-1">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Open / In Queue
          </p>
          <p className="text-2xl sm:text-3xl font-black text-amber-900">{counts.open}</p>
        </Card>

        <Card className="p-5 rounded-3xl border-blue-200 shadow-xs bg-blue-50/50 space-y-1">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-900">{counts.inProgress}</p>
        </Card>

        <Card className="p-5 rounded-3xl border-emerald-200 shadow-xs bg-emerald-50/50 space-y-1">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Solved Tickets</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-900">{counts.solved}</p>
        </Card>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by ticket ID (#TIC-...), user name, email, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-slate-50 rounded-2xl border-slate-200 text-xs sm:text-sm"
            />
          </div>

          <Button type="submit" className="h-11 px-5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
            Search
          </Button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedStatus === st
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Statuses" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Role:</span>
            {SENDER_FILTERS.map((sf) => (
              <button
                key={sf}
                onClick={() => setSelectedSender(sf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedSender === sf
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500 font-bold mt-2">Loading support desk tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 rounded-3xl bg-slate-50/60 space-y-2">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No support tickets found</h3>
          <p className="text-xs text-slate-400">All customer and doctor inquiries are clear or matched no filters.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => {
            const statusMeta = STATUS_CONFIG[t.status] || STATUS_CONFIG.OPEN;
            const StatusIcon = statusMeta.icon;
            const isResolving = resolvingId === t._id;
            const isDoctor = t.senderType === "Doctor";

            return (
              <Card
                key={t._id}
                className="border-0 shadow-sm hover:shadow-md transition rounded-3xl bg-white p-5 sm:p-6 space-y-4 overflow-hidden"
              >
                {/* Top Row: Ticket ID, Role, Status, Priority, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                      #{t.ticketId}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isDoctor
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}
                    >
                      {isDoctor ? <Stethoscope className="w-3 h-3 text-emerald-600" /> : <User className="w-3 h-3 text-blue-600" />}
                      {t.senderType}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.MEDIUM}`}>
                      {t.priority}
                    </span>

                    <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-md font-medium">
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.color}`}>
                      <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
                      <StatusIcon className="w-3 h-3" />
                      {statusMeta.label}
                    </span>

                    <span className="text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Submitter details & Subject */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-base font-black text-slate-900">{t.subject}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {t.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${t.email}`} className="text-indigo-600 hover:underline">
                          {t.email}
                        </a>
                      </span>
                      {t.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {t.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Quick Buttons */}
                  <div className="flex items-center gap-2 self-start">
                    {t.status !== "SOLVED" ? (
                      <Button
                        onClick={() => {
                          setResolvingId(isResolving ? null : t._id);
                          setResponseText(t.adminResponse || "");
                          setAdminNotes(t.adminNotes || "");
                        }}
                        className="h-9 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isResolving ? "Cancel" : "Mark as Solved"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpdateStatus(t._id, "IN_PROGRESS")}
                        variant="outline"
                        className="h-9 px-3 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        Re-open Ticket
                      </Button>
                    )}

                    <button
                      onClick={() => handleDelete(t._id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* User Message Text */}
                <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Inquiry Message:</p>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">{t.message}</p>
                </div>

                {/* Existing Solution if Solved */}
                {t.status === "SOLVED" && t.adminResponse && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Resolution Provided to User:
                    </p>
                    <p className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed">{t.adminResponse}</p>
                    {t.resolvedAt && (
                      <p className="text-[10px] text-emerald-700 pt-1">
                        Solved on {new Date(t.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Resolution Drawer Form */}
                {isResolving && (
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Resolve & Send Solution Email to {t.name}
                      </h4>
                      <span className="text-[11px] text-emerald-700">Recipient: {t.email}</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Resolution Reply (Will be emailed directly to the user)
                      </label>
                      <textarea
                        rows={3}
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl bg-white border border-emerald-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                        placeholder="Explain the solution or next steps taken to fix the user's issue..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Internal Admin Notes (Optional - not visible to user)
                      </label>
                      <Input
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="h-9 text-xs rounded-xl bg-white border-slate-200"
                        placeholder="e.g. Verified order payment in Vrio CRM directly"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setResolvingId(null)}
                        className="h-9 px-4 text-xs font-bold rounded-xl"
                      >
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleUpdateStatus(t._id, "SOLVED", responseText, adminNotes)}
                        disabled={updating}
                        className="h-9 px-5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 gap-1.5"
                      >
                        {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Confirm & Mark as Solved
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
