import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, RefreshCw, Loader2, CheckCircle2, XCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";
import { useCurrency } from "@/contexts/CurrencyContext";

const PAYOUTS_QUERY_KEY = ["admin-payouts"];
const STATUS_FILTERS = ["PENDING", "APPROVED", "PROCESSING", "PAID", "REJECTED", "ALL"];

// Mirrors the server's allowed transitions (PAID / REJECTED are final).
const NEXT_ACTIONS = {
  PENDING: ["APPROVED", "PAID", "REJECTED"],
  APPROVED: ["PAID", "REJECTED"],
  PROCESSING: ["PAID", "REJECTED"],
};

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

const METHOD_LABELS = { BANK_TRANSFER: "Bank transfer", UPI: "UPI", PAYPAL: "PayPal" };

/** The account the money must go to, for the payout's method. */
const AccountDetails = ({ payout }) => {
  const a = payout.accountDetails || {};
  if (payout.payoutMethod === "UPI") return <span className="font-mono">{a.upiId || "—"}</span>;
  if (payout.payoutMethod === "PAYPAL") return <span className="font-mono">{a.paypalEmail || "—"}</span>;
  return (
    <span className="block leading-relaxed">
      {a.accountHolderName || "—"}
      <br />
      {a.bankName || "—"} · <span className="font-mono">{a.accountNumber || "—"}</span>
      <br />
      <span className="text-slate-400">Routing/IFSC:</span> <span className="font-mono">{a.routingOrIfsc || "—"}</span>
    </span>
  );
};

export default function AdminPayouts() {
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [busyId, setBusyId] = useState(null);
  // { payout, status: "PAID" | "REJECTED" } while asking for a reference / reason
  const [dialog, setDialog] = useState(null);
  const [dialogText, setDialogText] = useState("");

  const { data: payouts = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: PAYOUTS_QUERY_KEY,
    queryFn: async () => (await adminApi.get("/admin/payouts")).data?.data || [],
    meta: { errorMessage: "Failed to load payout requests." },
  });

  const counts = useMemo(() => {
    const result = { ALL: payouts.length };
    for (const p of payouts) result[p.status] = (result[p.status] || 0) + 1;
    return result;
  }, [payouts]);

  const visible = statusFilter === "ALL" ? payouts : payouts.filter((p) => p.status === statusFilter);

  const updateStatus = async (payout, status, extra = {}) => {
    setBusyId(payout._id);
    try {
      const res = await adminApi.patch(`/admin/payouts/${payout._id}/status`, { status, ...extra });
      toast.success(res.data?.message || `Payout marked ${status.toLowerCase()}.`);
      setDialog(null);
      setDialogText("");
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payout.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAction = (payout, status) => {
    if (status === "APPROVED") {
      updateStatus(payout, status);
      return;
    }
    setDialog({ payout, status });
    setDialogText("");
  };

  const submitDialog = (e) => {
    e.preventDefault();
    if (!dialog || !dialogText.trim()) return;
    updateStatus(
      dialog.payout,
      dialog.status,
      dialog.status === "PAID" ? { referenceNumber: dialogText.trim() } : { rejectionReason: dialogText.trim() }
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-indigo-600" />
            Doctor Payouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review withdrawal requests, send the money, then record the transfer reference. Paid and rejected payouts are final.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-2xl h-10 px-4 text-xs font-bold border-slate-200 hover:bg-slate-50 gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
              statusFilter === status ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()} ({counts[status] || 0})
          </button>
        ))}
      </div>

      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading payouts...
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center py-16 text-sm text-slate-500">No payouts in this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 text-left">Requested</th>
                  <th className="p-3 text-left">Doctor</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-left">Pay to</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((payout) => {
                  const actions = NEXT_ACTIONS[payout.status] || [];
                  const busy = busyId === payout._id;
                  return (
                    <tr key={payout._id} className="align-top">
                      <td className="p-3 whitespace-nowrap text-slate-600">
                        {new Date(payout.createdAt).toLocaleDateString()}
                        {payout.notes && <p className="text-[10px] text-slate-400 max-w-[160px] mt-1">“{payout.notes}”</p>}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-800">
                          Dr. {payout.doctor?.firstName} {payout.doctor?.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400">{payout.doctor?.email}</p>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 whitespace-nowrap">{formatPrice(payout.amount, 2)}</td>
                      <td className="p-3 text-slate-700">
                        <p className="font-semibold mb-0.5">{METHOD_LABELS[payout.payoutMethod] || payout.payoutMethod}</p>
                        <AccountDetails payout={payout} />
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded-md border font-bold text-[10px] ${STATUS_STYLES[payout.status] || ""}`}>
                          {payout.status}
                        </span>
                        {payout.referenceNumber && <p className="text-[10px] text-slate-500 mt-1">Ref: {payout.referenceNumber}</p>}
                        {payout.rejectionReason && <p className="text-[10px] text-rose-600 mt-1 max-w-[180px]">{payout.rejectionReason}</p>}
                        {payout.processedBy && <p className="text-[10px] text-slate-400 mt-1">by {payout.processedBy}</p>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1.5">
                          {actions.includes("APPROVED") && (
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => handleAction(payout, "APPROVED")} className="h-8 rounded-xl gap-1 text-xs">
                              <ThumbsUp className="w-3.5 h-3.5" /> Approve
                            </Button>
                          )}
                          {actions.includes("PAID") && (
                            <Button size="sm" disabled={busy} onClick={() => handleAction(payout, "PAID")} className="h-8 rounded-xl gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark paid
                            </Button>
                          )}
                          {actions.includes("REJECTED") && (
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => handleAction(payout, "REJECTED")} className="h-8 rounded-xl gap-1 text-xs text-rose-600 border-rose-200 hover:bg-rose-50">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          )}
                          {busy && <Loader2 className="w-4 h-4 animate-spin text-slate-400 self-center" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {dialog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={submitDialog} className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {dialog.status === "PAID" ? "Mark payout as paid" : "Reject payout"}
            </h3>
            <p className="text-xs text-slate-500">
              {dialog.status === "PAID"
                ? `Send ${formatPrice(dialog.payout.amount, 2)} to Dr. ${dialog.payout.doctor?.lastName || ""} first, then enter the transfer reference from your bank/UPI/PayPal.`
                : "The doctor sees this reason and the amount returns to their available balance."}
            </p>
            <Input
              autoFocus
              value={dialogText}
              onChange={(e) => setDialogText(e.target.value)}
              placeholder={dialog.status === "PAID" ? "Transfer reference / UTR" : "Reason for rejection"}
              maxLength={dialog.status === "PAID" ? 120 : 500}
              className="rounded-xl"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialog(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!dialogText.trim() || busyId === dialog.payout._id}
                className={`rounded-xl text-white ${dialog.status === "PAID" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
              >
                {dialog.status === "PAID" ? "Mark paid" : "Reject payout"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
