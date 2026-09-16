import { useEffect, useState, useMemo } from "react";
import {
  Gift,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Calendar,
  Copy,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function AdminGiftCards() {
  const { formatPrice, currencySign } = useCurrency();
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    gift_card_total: "100.00",
    date_expire: "",
    gift_card_active: true,
    gift_card_notes: "",
  });

  const [crmProvider, setCrmProvider] = useState("vrio");

  const fetchGiftCards = async () => {
    try {
      setLoading(true);
      const [res, crmRes] = await Promise.allSettled([
        adminApi.get("/gift-cards"),
        adminApi.get("/admin/crm-settings"),
      ]);
      if (res.status === "fulfilled") {
        setGiftCards(res.value.data?.data || []);
      }
      if (crmRes.status === "fulfilled") {
        setCrmProvider(crmRes.value.data?.data?.crmProvider || "vrio");
      }
    } catch (error) {
      console.error("Failed to load gift cards:", error);
      toast.error("Failed to load gift cards from Vrio CRM.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const handleSyncVrio = async () => {
    setSyncing(true);
    toast.info("Syncing live gift cards with Vrio CRM...");
    await fetchGiftCards();
    toast.success("Gift cards synced successfully!");
  };

  const handleOpenAddModal = () => {
    setFormData({
      gift_card_total: "100.00",
      date_expire: "",
      gift_card_active: true,
      gift_card_notes: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (card) => {
    setSelectedCard(card);
    setFormData({
      gift_card_total: String(card.totalAmount || card.balanceAmount || ""),
      date_expire: card.dateExpire ? new Date(card.dateExpire).toISOString().split("T")[0] : "",
      gift_card_active: card.isActive ?? true,
      gift_card_notes: card.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (card) => {
    setSelectedCard(card);
    setIsDeleteModalOpen(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Submit Add Gift Card (POST /api/gift-cards)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gift_card_total || Number(formData.gift_card_total) <= 0) {
      toast.error("Please enter a valid gift card amount.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        gift_card_total: Number(formData.gift_card_total).toFixed(2),
        date_expire: formData.date_expire ? `${formData.date_expire} 00:00:00` : null,
        gift_card_notes: formData.gift_card_notes.trim(),
      };

      const res = await adminApi.post("/gift-cards", payload);
      toast.success(res.data?.message || "Gift card created successfully!");
      setIsAddModalOpen(false);
      fetchGiftCards();
    } catch (error) {
      console.error("Create gift card error:", error);
      toast.error(error.response?.data?.message || "Failed to create gift card.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Gift Card (PATCH /api/gift-cards/:id)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;

    try {
      setSubmitting(true);
      const payload = {
        gift_card_total: Number(formData.gift_card_total).toFixed(2),
        date_expire: formData.date_expire ? `${formData.date_expire} 00:00:00` : null,
        gift_card_active: formData.gift_card_active,
        gift_card_notes: formData.gift_card_notes.trim(),
      };

      const res = await adminApi.patch(`/gift-cards/${selectedCard._id}`, payload);
      toast.success(res.data?.message || "Gift card updated successfully!");
      setIsEditModalOpen(false);
      fetchGiftCards();
    } catch (error) {
      console.error("Update gift card error:", error);
      toast.error(error.response?.data?.message || "Failed to update gift card.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete Gift Card (DELETE /api/gift-cards/:id)
  const handleDeleteSubmit = async () => {
    if (!selectedCard) return;

    try {
      setSubmitting(true);
      const res = await adminApi.delete(`/gift-cards/${selectedCard._id}`);
      toast.success(res.data?.message || "Gift card deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchGiftCards();
    } catch (error) {
      console.error("Delete gift card error:", error);
      toast.error(error.response?.data?.message || "Failed to delete gift card.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered & Sorted Gift Cards
  const processedGiftCards = useMemo(() => {
    let list = giftCards.filter((card) => {
      const term = search.toLowerCase().trim();
      const code = (card.giftCardCode || "").toLowerCase();
      const vrioId = String(card.vrioGiftCardId || "").toLowerCase();
      const notes = (card.notes || "").toLowerCase();

      const matchesSearch = !term || code.includes(term) || vrioId.includes(term) || notes.includes(term);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && card.isActive) ||
        (statusFilter === "INACTIVE" && !card.isActive);

      return matchesSearch && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === "amount-desc") return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      if (sortBy === "balance-desc") return Number(b.balanceAmount || 0) - Number(a.balanceAmount || 0);
      return 0;
    });

    return list;
  }, [giftCards, search, statusFilter, sortBy]);

  const activeCount = giftCards.filter((c) => c.isActive).length;
  const totalIssued = giftCards.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">
              <Gift className="w-3.5 h-3.5" /> Digital Gift Cards & Vouchers
            </div>
            {crmProvider === "vrio" ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                ● Live Vrio CRM Sync
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200" title="Active order gateway is set to another provider; gift cards operate with Vrio / internal vouchers">
                ● Primary Gateway: {crmProvider} (Vrio Vouchers)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create & Manage Gift Cards</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Create, edit, and manage digital gift cards synchronized with Vrio CRM <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">/gift_cards</code> and checkout vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleSyncVrio}
            disabled={syncing}
            className="rounded-xl h-10 px-3.5 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Vrio"}
          </Button>

          <Button
            onClick={handleOpenAddModal}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-sm shadow-amber-200 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Gift Card
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-0 shadow-sm bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Gift Cards</p>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">{giftCards.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Cards</p>
              <h3 className="text-xl font-bold text-emerald-600 mt-0.5">{activeCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Issued Value</p>
              <h3 className="text-xl font-bold text-indigo-700 mt-0.5">{formatPrice(totalIssued)}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Search, Filter & Sort Bar */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search gift card code, ID, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses (Active & Inactive)</option>
              <option value="ACTIVE">🟢 Active Only</option>
              <option value="INACTIVE">⚪ Inactive Only</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none cursor-pointer font-semibold"
            >
              <option value="newest">📅 Created: Newest First</option>
              <option value="oldest">📅 Created: Oldest First</option>
              <option value="amount-desc">💰 Total Amount: High to Low</option>
              <option value="balance-desc">💳 Balance: High to Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Gift Cards Table */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="text-left p-4">Gift Card Code</th>
                  <th className="text-left p-4">Vrio ID</th>
                  <th className="text-left p-4">Total Amount</th>
                  <th className="text-left p-4">Remaining Balance</th>
                  <th className="text-left p-4">Expiration Date</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-left p-4">Notes</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">Loading Gift Cards from Vrio CRM...</p>
                    </td>
                  </tr>
                ) : processedGiftCards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <Gift className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No Gift Cards Found</p>
                      <p className="text-[11px] mt-0.5">Click "+ Add Gift Card" to issue a new digital gift voucher</p>
                    </td>
                  </tr>
                ) : (
                  processedGiftCards.map((card) => {
                    const isCardActive = card.isActive;

                    return (
                      <tr key={card._id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Code Badge */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                              {card.giftCardCode}
                            </span>
                            <button
                              onClick={() => handleCopyCode(card.giftCardCode)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Copy code"
                            >
                              {copiedCode === card.giftCardCode ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Vrio ID */}
                        <td className="p-4">
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-bold">
                            {card.vrioGiftCardId ? `#${card.vrioGiftCardId}` : "—"}
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="p-4 font-bold text-slate-900">
                          {formatPrice(card.totalAmount)}
                        </td>

                        {/* Balance */}
                        <td className="p-4">
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {formatPrice(card.balanceAmount ?? card.totalAmount)}
                          </span>
                        </td>

                        {/* Expiration Date */}
                        <td className="p-4 text-slate-600">
                          {card.dateExpire ? (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(card.dateExpire).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          ) : (
                            <span className="text-slate-400">Never Expires</span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isCardActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {isCardActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {isCardActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Notes */}
                        <td className="p-4 text-slate-500 max-w-xs truncate">
                          {card.notes || "—"}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(card)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                              title="Edit Gift Card"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDeleteModal(card)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete Gift Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
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

      {/* 1. ADD GIFT CARD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-md w-full border-0 shadow-2xl rounded-3xl bg-white overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Add Gift Card
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    POST <code className="font-mono text-amber-700">https://api.vrio.app/gift_cards</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gift_card_total" className="text-xs font-bold text-slate-800">
                  Gift Card Total Amount ({currencySign}) *
                </Label>
                <Input
                  id="gift_card_total"
                  type="number"
                  step="any"
                  min="1"
                  placeholder="e.g. 100.00"
                  value={formData.gift_card_total}
                  onChange={(e) => setFormData({ ...formData, gift_card_total: e.target.value })}
                  required
                  className="rounded-xl font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block">
                  Amount for the new gift card. Vrio generates the redemption code.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date_expire" className="text-xs font-semibold text-slate-700">
                  Expiration Date (`date_expire`) (Optional)
                </Label>
                <Input
                  id="date_expire"
                  type="date"
                  value={formData.date_expire}
                  onChange={(e) => setFormData({ ...formData, date_expire: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gift_card_notes" className="text-xs font-semibold text-slate-700">
                  History Notes (`gift_card_notes`) (Optional)
                </Label>
                <Input
                  id="gift_card_notes"
                  placeholder="e.g. Customer appreciation voucher"
                  value={formData.gift_card_notes}
                  onChange={(e) => setFormData({ ...formData, gift_card_notes: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl h-10 px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-10 px-5 text-xs shadow-md shadow-amber-200"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {submitting ? "Issuing with Vrio..." : "Create Gift Card"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 2. EDIT GIFT CARD MODAL */}
      {isEditModalOpen && selectedCard && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-md w-full border-0 shadow-2xl rounded-3xl bg-white overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Edit Gift Card
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    PATCH <code className="font-mono text-amber-700">/gift_cards/{selectedCard.vrioGiftCardId || selectedCard._id}</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-800 font-semibold uppercase block">Code</span>
                  <span className="font-mono font-black text-sm text-amber-950">{selectedCard.giftCardCode}</span>
                </div>
                {selectedCard.vrioGiftCardId && (
                  <Badge className="bg-amber-200 text-amber-900 text-xs font-mono font-bold">
                    Vrio #{selectedCard.vrioGiftCardId}
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_total" className="text-xs font-bold text-slate-800">
                  Gift Card Total Amount ({currencySign})
                </Label>
                <Input
                  id="edit_total"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.gift_card_total}
                  onChange={(e) => setFormData({ ...formData, gift_card_total: e.target.value })}
                  required
                  className="rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_expire" className="text-xs font-semibold text-slate-700">
                  Expiration Date (`date_expire`)
                </Label>
                <Input
                  id="edit_expire"
                  type="date"
                  value={formData.date_expire}
                  onChange={(e) => setFormData({ ...formData, date_expire: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <Label htmlFor="edit_active" className="text-xs font-bold text-slate-900 block cursor-pointer">
                    Gift Card Status (`gift_card_active`)
                  </Label>
                  <span className="text-[10px] text-slate-500">Enable or disable this gift card from redemptions</span>
                </div>
                <input
                  id="edit_active"
                  type="checkbox"
                  checked={formData.gift_card_active}
                  onChange={(e) => setFormData({ ...formData, gift_card_active: e.target.checked })}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_notes" className="text-xs font-semibold text-slate-700">
                  History Notes (`gift_card_notes`)
                </Label>
                <Input
                  id="edit_notes"
                  value={formData.gift_card_notes}
                  onChange={(e) => setFormData({ ...formData, gift_card_notes: e.target.value })}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl h-10 px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-10 px-5 text-xs shadow-md shadow-amber-200"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 3. DELETE GIFT CARD CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedCard && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-md w-full border-0 shadow-2xl rounded-3xl bg-white overflow-hidden animate-in fade-in zoom-in-95 my-auto p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Delete Gift Card?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete gift card <strong className="text-slate-800 font-mono">{selectedCard.giftCardCode}</strong>? This will dispatch a DELETE request to Vrio CRM.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl h-10 px-4 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-10 px-5 text-xs shadow-md shadow-rose-200 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {submitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
