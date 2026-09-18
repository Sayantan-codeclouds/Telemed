import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Building2,
  CreditCard,
  Download,
  Search,
  Loader2,
  TrendingUp,
  FileSpreadsheet,
  X,
  Smartphone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import doctorApi from "@/api/doctorApi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getProfileImageUrl } from "@/utils/imageUrl";

const EMPTY_EARNINGS_DATA = {
  summary: {
    grossEarnings: 0,
    platformCommissionPercent: 10,
    platformFeeTotal: 0,
    netEarnings: 0,
    totalWithdrawn: 0,
    pendingWithdrawn: 0,
    availableBalance: 0,
    completedConsultationsCount: 0,
  },
  payoutSettings: {},
  monthlyData: [],
  consultationLedger: [],
};

export default function DoctorEarnings() {
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState("LEDGER"); // "LEDGER" | "PAYOUTS" | "SETTINGS"
  const [searchLedger, setSearchLedger] = useState("");

  // Payout Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Payout Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    routingOrIfsc: "",
    upiId: "",
    paypalEmail: "",
    preferredMethod: "BANK_TRANSFER",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const {
    data: { data, payouts } = { data: EMPTY_EARNINGS_DATA, payouts: [] },
    isLoading: loading,
    refetch: fetchEarningsData,
  } = useQuery({
    queryKey: ["doctor-earnings"],
    queryFn: async () => {
      const [earningsRes, payoutsRes] = await Promise.all([
        doctorApi.get("/doctors/earnings"),
        doctorApi.get("/doctors/payouts"),
      ]);
      return {
        data: earningsRes.data?.data || {},
        payouts: payoutsRes.data?.data || [],
      };
    },
    meta: { errorMessage: "Failed to load earnings information." },
  });

  // Seed the editable payout settings form once when earnings data arrives,
  // adjusted during render instead of via an effect.
  const [appliedData, setAppliedData] = useState(undefined);
  if (data && data !== appliedData) {
    setAppliedData(data);
    if (data.payoutSettings) {
      setSettingsForm({
        accountHolderName: data.payoutSettings.accountHolderName || "",
        bankName: data.payoutSettings.bankName || "",
        accountNumber: data.payoutSettings.accountNumber || "",
        routingOrIfsc: data.payoutSettings.routingOrIfsc || "",
        upiId: data.payoutSettings.upiId || "",
        paypalEmail: data.payoutSettings.paypalEmail || "",
        preferredMethod: data.payoutSettings.preferredMethod || "BANK_TRANSFER",
      });
    }
  }

  // Filter consultation ledger
  const filteredLedger = useMemo(() => {
    return (data.consultationLedger || []).filter((item) => {
      const term = searchLedger.toLowerCase().trim();
      if (!term) return true;
      const patientName = `${item.patient?.firstName || ""} ${item.patient?.lastName || ""}`.toLowerCase();
      const dateStr = new Date(item.appointmentDate).toLocaleDateString().toLowerCase();
      return patientName.includes(term) || dateStr.includes(term);
    });
  }, [data.consultationLedger, searchLedger]);

  // Handle Payout Request Submit
  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);

    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid payout amount.");
      return;
    }

    if (amountNum > data.summary.availableBalance) {
      toast.error(
        `Amount cannot exceed your available balance of ${formatPrice(data.summary.availableBalance)}.`
      );
      return;
    }

    setSubmittingPayout(true);
    try {
      const res = await doctorApi.post("/doctors/payouts", {
        amount: amountNum,
        notes: payoutNotes.trim(),
      });

      toast.success(res.data?.message || "Payout request submitted successfully!");
      setIsPayoutModalOpen(false);
      setPayoutAmount("");
      setPayoutNotes("");
      // Refresh earnings and payouts
      fetchEarningsData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit payout request. Please try again."
      );
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Handle Save Payout Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await doctorApi.put("/doctors/payout-settings", settingsForm);
      toast.success(res.data?.message || "Payout account settings saved successfully!");
      fetchEarningsData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save payout settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Export CSV statement
  const handleExportCSV = () => {
    if (!data.consultationLedger || data.consultationLedger.length === 0) {
      toast.warning("No consultation records available to export.");
      return;
    }

    const headers = ["Date", "Patient Name", "Patient Email", "Gross Fee", "Platform Share (10%)", "Net Earnings", "Status"];
    const rows = data.consultationLedger.map((item) => [
      `"${new Date(item.appointmentDate).toLocaleDateString()}"`,
      `"${item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : "Patient"}"`,
      `"${item.patient?.email || ""}"`,
      item.grossFee,
      item.platformFee,
      item.netAmount,
      `"${item.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TeleClinic_Earnings_Statement_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Statement exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-500">Loading your financial earnings...</p>
      </div>
    );
  }

  const { summary, monthlyData } = data;
  const maxMonthlyGross = Math.max(...(monthlyData || []).map((m) => m.gross), 1);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Earnings & Payouts Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track your consultation revenue, platform share, transfer history, and withdrawal accounts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="rounded-2xl h-11 px-4 text-xs font-bold gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export Statement
          </Button>

          <Button
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={summary.availableBalance <= 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-11 px-5 text-xs gap-2 shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            <Wallet className="w-4 h-4" /> Request Payout
          </Button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance Card */}
        <Card className="border-2 border-emerald-500/30 shadow-md bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                Available Withdrawable
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black">{formatPrice(summary.availableBalance)}</p>
              <p className="text-emerald-100 text-xs mt-1">
                Net earnings ready for transfer
              </p>
            </div>
          </div>
        </Card>

        {/* Net Take-Home */}
        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Net Earnings (Take-Home)
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {formatPrice(summary.netEarnings)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                After {summary.platformCommissionPercent ?? 10}% platform share ({formatPrice(summary.platformFeeTotal)})
              </p>
            </div>
          </div>
        </Card>

        {/* Gross Revenue */}
        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Gross Consultations
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {formatPrice(summary.grossEarnings)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                From {summary.completedConsultationsCount} completed visits
              </p>
            </div>
          </div>
        </Card>

        {/* Total Disbursed */}
        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Paid Out
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {formatPrice(summary.totalWithdrawn)}
              </p>
              <p className="text-xs text-amber-600 font-medium mt-1">
                {summary.pendingWithdrawn > 0
                  ? `${formatPrice(summary.pendingWithdrawn)} in transit`
                  : "All requested funds disbursed"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Revenue Trend Visualizer */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Monthly Revenue Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Consultation earnings overview for the past 6 months
            </p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs">
            {summary.platformCommissionPercent ?? 10}% Platform Fee ({summary.doctorPayoutPercent ?? (100 - (summary.platformCommissionPercent ?? 10))}% Payout)
          </Badge>
        </div>

        {/* Visual Bars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {monthlyData.map((m, idx) => {
            const heightPercent = Math.max(12, Math.round((m.gross / maxMonthlyGross) * 100));
            return (
              <div
                key={idx}
                className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{m.month}</span>
                  <span className="text-[10px] text-slate-400">{m.consultationsCount} visits</span>
                </div>

                <div className="h-20 w-full flex items-end bg-slate-200/50 rounded-xl p-1">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-lg transition-all duration-500"
                  />
                </div>

                <div className="space-y-0.5">
                  <p className="font-black text-xs text-slate-900">{formatPrice(m.net)}</p>
                  <p className="text-[10px] text-slate-400">Gross: {formatPrice(m.gross)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tabs Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("LEDGER")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "LEDGER"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Consultation Earnings ({data.consultationLedger?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("PAYOUTS")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "PAYOUTS"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Payout Requests ({payouts.length})
        </button>

        <button
          onClick={() => setActiveTab("SETTINGS")}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "SETTINGS"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" /> Bank & Payout Settings
        </button>
      </div>

      {/* TAB 1: Consultation Earnings Ledger */}
      {activeTab === "LEDGER" && (
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by patient name or date..."
                value={searchLedger}
                onChange={(e) => setSearchLedger(e.target.value)}
                className="pl-10 h-10 text-xs rounded-xl"
              />
            </div>

            <span className="text-xs text-slate-400">
              Showing {filteredLedger.length} completed consultations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="p-4">Patient</th>
                  <th className="p-4">Consultation Date</th>
                  <th className="p-4 text-right">Gross Fee</th>
                  <th className="p-4 text-right">Platform Share (10%)</th>
                  <th className="p-4 text-right">Net Take-Home</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-700">No completed consultations yet</p>
                      <p className="text-[11px] mt-0.5">
                        Earnings will automatically record here as soon as appointments are completed.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProfileImageUrl(
                              item.patient?.profileImage,
                              `${item.patient?.firstName || "P"} ${item.patient?.lastName || "T"}`,
                              "0284c7"
                            )}
                            alt="Patient"
                            className="w-9 h-9 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : "Patient"}
                            </p>
                            <p className="text-[11px] text-slate-400">{item.patient?.email || "—"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 font-medium">
                        <div>
                          <span>
                            {new Date(item.appointmentDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {item.slot?.start && (
                            <span className="text-[11px] text-slate-400 block font-normal">
                              {item.slot.start} - {item.slot.end}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right font-bold text-slate-700">
                        {formatPrice(item.grossFee)}
                      </td>

                      <td className="p-4 text-right font-semibold text-rose-600">
                        -{formatPrice(item.platformFee)}
                      </td>

                      <td className="p-4 text-right font-black text-emerald-700">
                        {formatPrice(item.netAmount)}
                      </td>

                      <td className="p-4 text-center">
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                          COMPLETED
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: Payout Requests History */}
      {activeTab === "PAYOUTS" && (
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Transfer & Withdrawal Ledger</h3>
            <Button
              size="sm"
              onClick={() => setIsPayoutModalOpen(true)}
              disabled={summary.availableBalance <= 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 h-8 px-3"
            >
              <Wallet className="w-3.5 h-3.5" /> New Withdrawal
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Date Requested</th>
                  <th className="p-4">Payout Method</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Disbursed / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <Wallet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-700">No payout requests yet</p>
                      <p className="text-[11px] mt-0.5">
                        When you request a payout from your available balance, status updates will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => {
                    const isPaid = p.status === "PAID";
                    const isPending = p.status === "PENDING" || p.status === "PROCESSING" || p.status === "APPROVED";

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/60 transition">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          #PAY-{p._id.slice(-6).toUpperCase()}
                        </td>

                        <td className="p-4 text-slate-600">
                          {new Date(p.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-slate-800">
                            {p.payoutMethod?.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                            {p.accountDetails?.bankName
                              ? `${p.accountDetails.bankName} (••••${p.accountDetails.accountNumber?.slice(-4) || ""})`
                              : p.accountDetails?.upiId || "Bank Account"}
                          </span>
                        </td>

                        <td className="p-4 text-right font-black text-sm text-slate-900">
                          {formatPrice(p.amount)}
                        </td>

                        <td className="p-4 text-center">
                          <Badge
                            className={`text-[10px] font-bold ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : isPending
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {p.status}
                          </Badge>
                        </td>

                        <td className="p-4 text-slate-500 text-[11px]">
                          {p.referenceNumber && (
                            <span className="font-mono text-emerald-700 block font-semibold">
                              Ref: {p.referenceNumber}
                            </span>
                          )}
                          {p.rejectionReason && (
                            <span className="text-rose-600 block">{p.rejectionReason}</span>
                          )}
                          {p.processedAt && (
                            <span className="text-slate-400 block text-[10px]">
                              Paid on {new Date(p.processedAt).toLocaleDateString()}
                            </span>
                          )}
                          {!p.referenceNumber && !p.rejectionReason && "Processing by finance"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Bank & Payout Settings */}
      {activeTab === "SETTINGS" && (
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-6 max-w-3xl">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Payout Account Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your verified bank account or UPI ID to receive consultation disbursements
              </p>
            </div>

            {/* Preferred Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Preferred Transfer Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "BANK_TRANSFER", label: "Bank Wire / NEFT", icon: Building2 },
                  { key: "UPI", label: "Instant UPI ID", icon: Smartphone },
                  { key: "PAYPAL", label: "PayPal Account", icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = settingsForm.preferredMethod === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSettingsForm((prev) => ({ ...prev, preferredMethod: m.key }))}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{m.label}</p>
                        <p className="text-[10px] text-slate-400">Direct deposit</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bank Details Inputs */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" /> Bank Transfer Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Account Holder Full Name</label>
                  <Input
                    placeholder="e.g. Dr. John Doe"
                    value={settingsForm.accountHolderName}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, accountHolderName: e.target.value }))
                    }
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Bank Name</label>
                  <Input
                    placeholder="e.g. HDFC Bank, Chase, State Bank of India"
                    value={settingsForm.bankName}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, bankName: e.target.value }))
                    }
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Account Number / IBAN</label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={settingsForm.accountNumber}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, accountNumber: e.target.value }))
                    }
                    className="h-10 text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">IFSC / Routing / SWIFT Code</label>
                  <Input
                    placeholder="e.g. HDFC0001234 or 021000021"
                    value={settingsForm.routingOrIfsc}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, routingOrIfsc: e.target.value }))
                    }
                    className="h-10 text-xs rounded-xl uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            {/* UPI & PayPal Alternative */}
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" /> Instant UPI & PayPal Alternative
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">UPI ID / VPA</label>
                  <Input
                    placeholder="doctor@okhdfcbank"
                    value={settingsForm.upiId}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, upiId: e.target.value }))
                    }
                    className="h-10 text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">PayPal Email Address</label>
                  <Input
                    type="email"
                    placeholder="doctor@paypal.com"
                    value={settingsForm.paypalEmail}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, paypalEmail: e.target.value }))
                    }
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={savingSettings}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Account...
                </>
              ) : (
                "Save Payout Settings"
              )}
            </Button>
          </form>
        </Card>
      )}

      {/* Request Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-0 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-teal-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Request Withdrawal</h3>
                  <p className="text-xs text-slate-500">
                    Disburse consultation revenue to your registered bank account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Available Balance Reminder */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Available for Withdrawal
                  </span>
                  <p className="text-xl font-black text-emerald-950 mt-0.5">
                    {formatPrice(summary.availableBalance)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPayoutAmount(String(summary.availableBalance))}
                  className="rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold"
                >
                  Withdraw Max
                </Button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Withdrawal Amount *
                </label>
                <Input
                  type="number"
                  min="100"
                  max={summary.availableBalance}
                  placeholder="Enter amount (min 100)"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  required
                  className="h-11 text-sm font-bold rounded-xl"
                />
              </div>

              {/* Target Account Snapshot */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Disbursing To
                </span>
                <p className="font-bold text-slate-900">
                  {data.payoutSettings?.bankName
                    ? `${data.payoutSettings.bankName} (••••${data.payoutSettings.accountNumber?.slice(-4) || ""})`
                    : data.payoutSettings?.upiId || "Configured Account"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Beneficiary: {data.payoutSettings?.accountHolderName || "Doctor"}
                </p>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider block">
                  Reference Note <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  placeholder="e.g. Monthly clinic withdrawal"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPayoutModalOpen(false)}
                  disabled={submittingPayout}
                  className="rounded-xl h-10 px-5 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!payoutAmount || Number(payoutAmount) <= 0 || submittingPayout}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 text-xs font-bold gap-2 shadow-md shadow-emerald-500/20"
                >
                  {submittingPayout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Submit Payout Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
