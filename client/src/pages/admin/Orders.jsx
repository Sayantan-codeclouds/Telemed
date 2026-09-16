import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Mail,
  ChevronRight,
  Receipt,
  Plus,
  Trash2,
  CreditCard,
  Pill,
  X,
  Video,
  Stethoscope,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";

const STATUS_FILTERS = ["ALL", "PROCESSING", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED"];

const statusConfig = {
  PENDING: {
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    label: "Pending",
  },
  PROCESSING: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Package,
    label: "Processing",
  },
  CONFIRMED: {
    color: "bg-sky-50 text-sky-700 border-sky-200",
    icon: Video,
    label: "Confirmed",
  },
  SHIPPED: {
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Truck,
    label: "Shipped",
  },
  DELIVERED: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    label: "Delivered",
  },
  COMPLETED: {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    label: "Completed",
  },
  CANCELLED: {
    color: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
    label: "Cancelled",
  },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await adminApi.get("/admin/pharmacy/orders");
      setOrders(data.data || []);
    } catch (error) {
      console.error("Failed to load pharmacy orders:", error);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvoice = async (order) => {
    if (!order?._id) return;
    const orderId = order._id;
    const recipient = order.patient?.email || order.billingDetails?.email || "patient";

    try {
      setResendingId(orderId);
      const { data } = await adminApi.post(`/admin/pharmacy/orders/${orderId}/resend-invoice`);
      toast.success(data.message || `Invoice sent to ${recipient}!`, {
        description: `Order #${order.vrioOrderId || order.stickyCrmOrderId || orderId.slice(-8).toUpperCase()}`,
      });
    } catch (error) {
      console.error("Failed to resend order invoice:", error);
      toast.error(error.response?.data?.message || `Failed to resend invoice to ${recipient}.`);
    } finally {
      setResendingId(null);
    }
  };

  // Create Order for Customer state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const [patientSearch, setPatientSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); // [{ medicineId, name, price, quantity }]
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "US",
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "4111222233334444",
    cardExpiry: "12/28",
    cardCvv: "123",
  });
  const [orderNotes, setOrderNotes] = useState("");

  const openCreateModal = async () => {
    setIsCreateModalOpen(true);
    if (patients.length === 0 || medicines.length === 0) {
      setLoadingFormData(true);
      try {
        const [patientsRes, medicinesRes] = await Promise.all([
          adminApi.get("/admin/patients"),
          adminApi.get("/admin/pharmacy/medicines"),
        ]);
        setPatients(patientsRes.data?.data || []);
        setMedicines(medicinesRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load customer/medicine catalog:", err);
        toast.error("Failed to load customer or medicine catalog.");
      } finally {
        setLoadingFormData(false);
      }
    }
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    const pat = patients.find((p) => p._id === patientId);
    setSelectedPatient(pat || null);
    if (pat) {
      setShippingAddress({
        address: pat.address || "",
        city: pat.city || "",
        state: pat.state || "",
        pincode: pat.pincode || pat.zipCode || "",
        country: pat.country === "USA" ? "US" : (pat.country || "US"),
      });
    }
  };

  const handleAddItem = (med) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.medicineId === med._id);
      if (existing) {
        return prev.map((i) =>
          i.medicineId === med._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          medicineId: med._id,
          name: med.name,
          price: med.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (medicineId, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.medicineId === medicineId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (medicineId) => {
    setSelectedItems((prev) => prev.filter((i) => i.medicineId !== medicineId));
  };

  const orderSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const filteredPatients = patients.filter((p) => {
    if (!patientSearch.trim()) return true;
    const term = patientSearch.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return (
      fullName.includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phone?.includes(term)
    );
  });

  const filteredMedicines = medicines.filter((m) => {
    if (!medicineSearch.trim()) return true;
    const term = medicineSearch.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.genericName?.toLowerCase().includes(term) ||
      m.category?.toLowerCase().includes(term)
    );
  });

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error("Please select a customer.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one medicine.");
      return;
    }
    if (
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      toast.error("Please fill in complete shipping address details.");
      return;
    }

    setSubmittingCreate(true);
    try {
      const payload = {
        patientId: selectedPatientId,
        items: selectedItems.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
        })),
        shippingAddress,
        billingDetails: {
          fname: selectedPatient?.firstName || "Customer",
          lname: selectedPatient?.lastName || "",
          email: selectedPatient?.email,
          phone: selectedPatient?.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country === "USA" ? "US" : (shippingAddress.country || "US"),
        },
        paymentDetails,
        orderNotes,
      };

      const res = await adminApi.post("/admin/pharmacy/orders", payload);
      toast.success(res.data?.message || "Order created successfully!");
      setIsCreateModalOpen(false);
      // Reset form
      setSelectedItems([]);
      setSelectedPatientId("");
      setSelectedPatient(null);
      setOrderNotes("");
      // Refresh list
      fetchOrders();
    } catch (error) {
      console.error("Failed to place order for customer:", error);
      toast.error(
        error.response?.data?.message || "Failed to create order for customer."
      );
    } finally {
      setSubmittingCreate(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
    if (viewOrder && viewOrder._id === orderId) {
      setViewOrder((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      await adminApi.patch(`/admin/pharmacy/orders/${orderId}/status`, {
        status: newStatus,
      });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      fetchOrders();
      toast.error(error.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const term = search.toLowerCase();
    const crmId = order.vrioOrderId || order.stickyCrmOrderId || "";
    const matchesSearch =
      order._id?.toLowerCase().includes(term) ||
      crmId.toLowerCase().includes(term) ||
      `${order.patient?.firstName} ${order.patient?.lastName}`
        .toLowerCase()
        .includes(term) ||
      order.patient?.email?.toLowerCase().includes(term) ||
      order.patient?.phone?.includes(term);

    const matchesStatus =
      selectedStatus === "ALL" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: orders.length,
    processing: orders.filter((o) => o.status === "PROCESSING").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  };

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" /> Pharmacy Orders & Fulfillment
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Monitor customer prescription fulfillments, shipping statuses, and dispatch pipelines
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span className="text-xs text-slate-600 font-medium">Total Fulfillment Volume:</span>
            <strong className="text-sm font-black text-indigo-700">${totalRevenue.toLocaleString()}</strong>
          </div>

          <Button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl h-10 px-4 text-xs gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Order for Customer
          </Button>
        </div>
      </div>

      {/* KPI Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Processing</span>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{counts.processing}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">In Transit (Shipped)</span>
              <p className="text-2xl font-black text-purple-600 mt-0.5">{counts.shipped}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Delivered</span>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">{counts.delivered}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-3xl bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Cancelled</span>
              <p className="text-2xl font-black text-rose-600 mt-0.5">{counts.cancelled}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
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
              placeholder="Search by patient name, order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedStatus === status
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="border border-slate-200/80 shadow-xs rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="text-left p-4">Order Ref / CRM</th>
                  <th className="text-left p-4">Patient Customer</th>
                  <th className="text-left p-4">Items Summary</th>
                  <th className="text-left p-4">Total Amount</th>
                  <th className="text-left p-4">Destination</th>
                  <th className="text-center p-4">Fulfillment Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const isUpdating = updatingId === order._id;
                  const cfg = statusConfig[order.status] || statusConfig.PROCESSING;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-slate-900 block">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        {(order.vrioOrderId || order.stickyCrmOrderId) && (
                          <span className="text-[10px] text-slate-500 font-mono font-bold block">
                            Vrio #{order.vrioOrderId || order.stickyCrmOrderId}
                          </span>
                        )}
                        {order.orderType === "CONSULTATION" ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 mt-1">
                            <Stethoscope className="w-2.5 h-2.5 text-sky-600" />
                            Consultation (Item #3366)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 mt-1">
                            <Package className="w-2.5 h-2.5 text-purple-600" />
                            Pharmacy Order
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {order.patient?.firstName} {order.patient?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{order.patient?.email}</div>
                        {order.patient?.phone && (
                          <div className="text-[11px] text-slate-400">{order.patient.phone}</div>
                        )}
                      </td>

                      <td className="p-4">
                        {order.orderType === "CONSULTATION" ? (
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5 text-sky-600" />
                              <span>
                                {order.doctor
                                  ? `Dr. ${order.doctor.firstName || ""} ${order.doctor.lastName || ""}`
                                  : "Doctor Consultation"}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {order.doctor?.specialization || "TeleClinic Physician"} • {order.items?.[0]?.name || "Online Visit"}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs text-slate-700 font-medium line-clamp-2 max-w-xs">
                              {order.items?.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                              {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </td>

                      <td className="p-4 font-black text-slate-900 text-sm">
                        ${order.totalAmount?.toLocaleString()}
                      </td>

                      <td className="p-4 text-xs text-slate-600 max-w-xs">
                        {order.orderType === "CONSULTATION" ? (
                          <span className="inline-flex items-center gap-1 text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                            <Video className="w-3 h-3 text-sky-600" /> Virtual Video Room
                          </span>
                        ) : (
                          <span className="truncate block">
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                          </span>
                        )}
                      </td>

                      {/* Interactive Status Changer */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`text-xs font-bold border rounded-xl px-2.5 py-1 outline-none cursor-pointer ${cfg.color}`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resendingId === order._id}
                            onClick={() => handleResendInvoice(order)}
                            title="Resend email invoice to customer"
                            className="h-8 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 rounded-xl font-bold gap-1.5 shadow-2xs"
                          >
                            {resendingId === order._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Mail className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                            <span className="hidden sm:inline">Resend Invoice</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewOrder(order)}
                            className="h-8 px-2.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold gap-1"
                          >
                            View <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-16 text-center text-slate-400 text-xs">
                      No pharmacy orders match the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Drawer Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-0 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  {viewOrder.orderType === "CONSULTATION" ? "Doctor Consultation Details" : "Pharmacy Order Details"}
                </span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Order #{viewOrder._id.slice(-8).toUpperCase()}</span>
                  {viewOrder.orderType === "CONSULTATION" && (
                    <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[10px]">
                      Consultation (Item #3366)
                    </Badge>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setViewOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer, Shipping & Payment Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Recipient</span>
                  <p className="font-bold text-slate-900">
                    {viewOrder.patient?.firstName} {viewOrder.patient?.lastName}
                  </p>
                  <p className="text-slate-600">{viewOrder.patient?.email}</p>
                  <p className="text-slate-600">{viewOrder.patient?.phone || "—"}</p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">
                    {viewOrder.orderType === "CONSULTATION" ? "Consultation Room" : "Shipping Address"}
                  </span>
                  {viewOrder.orderType === "CONSULTATION" ? (
                    <div className="space-y-0.5">
                      <p className="text-sky-800 font-bold flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-sky-600" /> WebRTC Virtual Room
                      </p>
                      <p className="text-slate-600">
                        {viewOrder.doctor
                          ? `Dr. ${viewOrder.doctor.firstName} ${viewOrder.doctor.lastName}`
                          : "Doctor Assigned"}
                      </p>
                      <p className="text-slate-500 text-[11px]">{viewOrder.doctor?.specialization || "Physician"}</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-800 font-medium">{viewOrder.shippingAddress?.line1}</p>
                      <p className="text-slate-600">
                        {viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.state} - {viewOrder.shippingAddress?.pincode}
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Payment & CRM</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {viewOrder.billingDetails?.cardType?.toLowerCase() === "mastercard" ? (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        MasterCard (•••• {viewOrder.billingDetails?.cardLast4 || "4444"})
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        Visa (•••• {viewOrder.billingDetails?.cardLast4 || "4444"})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    Vrio Ref: {viewOrder.vrioOrderId || viewOrder.stickyCrmOrderId || "Processed"}
                  </p>
                </div>
              </div>

              {/* Items List with Campaign, Item, and Offer IDs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {viewOrder.orderType === "CONSULTATION"
                    ? "Consultation Services & Vrio CRM Product"
                    : "Prescribed & Ordered Medicines"}
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {viewOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-white">
                      <div>
                        <p className="font-bold text-slate-900">
                          {item.name || (viewOrder.orderType === "CONSULTATION" ? "Doctor Consultation Booking" : "Item")}
                        </p>
                        <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                          <span>Qty: {item.quantity} × ${item.price}</span>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            Camp #{item.campaignId || 1} • Item #{item.itemId || item.vrioProductId || (viewOrder.orderType === "CONSULTATION" ? 3366 : 1)} • Offer #{item.offerId || item.vrioOfferId || (viewOrder.orderType === "CONSULTATION" ? 29 : 1)}
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 text-sm">
                        ${(item.quantity * item.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Status Controls */}
              <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Order Total Amount</span>
                  <p className="text-xl font-black text-indigo-900">
                    ${viewOrder.totalAmount?.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <select
                    value={viewOrder.status}
                    onChange={(e) => handleStatusChange(viewOrder._id, e.target.value)}
                    className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-1.5 bg-white text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                type="button"
                onClick={() => handleResendInvoice(viewOrder)}
                disabled={resendingId === viewOrder._id}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-2 shadow-sm"
              >
                {resendingId === viewOrder._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Resend Invoice to Patient
              </Button>
              <Button
                onClick={() => setViewOrder(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-10 px-5 text-xs"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Create Order for Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Order for Customer</h3>
                  <p className="text-xs text-slate-500">MOTO & Support Assisted Pharmacy Checkout</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingFormData ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-slate-500">Loading patients and pharmacy catalog...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateOrderSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[calc(92vh-140px)]">
                  {/* Two Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Customer & Medicine Selection (7 cols) */}
                    <div className="lg:col-span-7 space-y-5">
                      {/* Step 1: Select Customer */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-600" /> 1. Select Customer *
                        </Label>
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input
                              placeholder="Filter customer by name, email, phone..."
                              value={patientSearch}
                              onChange={(e) => setPatientSearch(e.target.value)}
                              className="pl-9 text-xs rounded-xl h-9"
                            />
                          </div>
                          <select
                            value={selectedPatientId}
                            onChange={(e) => handleSelectPatient(e.target.value)}
                            className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            required
                          >
                            <option value="">-- Choose Customer ({filteredPatients.length} available) --</option>
                            {filteredPatients.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.firstName} {p.lastName} — {p.email} {p.phone ? `(${p.phone})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedPatient && (
                          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs mt-2">
                            <div className="space-y-0.5">
                              <p className="font-bold text-indigo-950">
                                {selectedPatient.firstName} {selectedPatient.lastName}
                              </p>
                              <p className="text-slate-500 text-[11px]">{selectedPatient.email}</p>
                              {selectedPatient.phone && (
                                <p className="text-slate-500 text-[11px]">{selectedPatient.phone}</p>
                              )}
                            </div>
                            <Badge className="bg-indigo-100 text-indigo-700 border-none font-semibold text-[10px]">
                              Active Patient
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Step 2: Add Medicines */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-indigo-600" /> 2. Add Prescribed Medicines *
                        </Label>

                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input
                            placeholder="Search medicine catalog..."
                            value={medicineSearch}
                            onChange={(e) => setMedicineSearch(e.target.value)}
                            className="pl-9 text-xs rounded-xl h-9"
                          />
                        </div>

                        {/* Catalog list */}
                        <div className="border border-slate-200 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1.5 bg-slate-50/40">
                          {filteredMedicines.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 py-4">No matching medicines found.</p>
                          ) : (
                            filteredMedicines.map((med) => {
                              const alreadyAdded = selectedItems.some((i) => i.medicineId === med._id);
                              return (
                                <div
                                  key={med._id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 shadow-xs hover:border-indigo-200 transition-all text-xs"
                                >
                                  <div className="min-w-0 pr-2">
                                    <p className="font-bold text-slate-900 truncate">{med.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">
                                      {med.dosageForm} • {med.strength || med.category} • ${med.price}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleAddItem(med)}
                                    className={`h-7 px-2.5 text-[11px] font-bold rounded-lg ${
                                      alreadyAdded
                                        ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    }`}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    {alreadyAdded ? "Add More" : "Add"}
                                  </Button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Selected Items / Cart */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Selected Items ({selectedItems.length})
                          </Label>
                          {selectedItems.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedItems([])}
                              className="text-[11px] text-rose-500 hover:underline font-semibold"
                            >
                              Clear all
                            </button>
                          )}
                        </div>

                        {selectedItems.length === 0 ? (
                          <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs">
                            <ShoppingBag className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                            No medicines added to this order yet.
                          </div>
                        ) : (
                          <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-white">
                            {selectedItems.map((item) => (
                              <div key={item.medicineId} className="p-2.5 flex items-center justify-between text-xs">
                                <div className="min-w-0 pr-2">
                                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                                  <p className="text-[10px] text-slate-500">${item.price} each</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateQuantity(item.medicineId, -1)}
                                      className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900 bg-white">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateQuantity(item.medicineId, 1)}
                                      className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span className="font-bold text-slate-900 min-w-[50px] text-right">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.medicineId)}
                                    className="text-slate-400 hover:text-rose-500 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Delivery & Payment (5 cols) */}
                    <div className="lg:col-span-5 space-y-5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                      {/* Delivery Address */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" /> 3. Shipping Address *
                        </Label>
                        <div className="space-y-2 text-xs">
                          <div>
                            <Input
                              placeholder="Street Address *"
                              value={shippingAddress.address}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, address: e.target.value })
                              }
                              required
                              className="rounded-xl h-8 text-xs bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="City *"
                              value={shippingAddress.city}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, city: e.target.value })
                              }
                              required
                              className="rounded-xl h-8 text-xs bg-white"
                            />
                            <Input
                              placeholder="State *"
                              value={shippingAddress.state}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, state: e.target.value })
                              }
                              required
                              className="rounded-xl h-8 text-xs bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="ZIP / Pincode *"
                              value={shippingAddress.pincode}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, pincode: e.target.value })
                              }
                              required
                              className="rounded-xl h-8 text-xs bg-white"
                            />
                            <Input
                              placeholder="Country"
                              value={shippingAddress.country}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, country: e.target.value })
                              }
                              className="rounded-xl h-8 text-xs bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payment Card Details */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> 4. MOTO Payment Card
                        </Label>
                        <div className="space-y-2 text-xs">
                          <Input
                            placeholder="Credit Card Number"
                            value={paymentDetails.cardNumber}
                            onChange={(e) =>
                              setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })
                            }
                            required
                            className="rounded-xl h-8 text-xs bg-white font-mono"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="MM/YY"
                              value={paymentDetails.cardExpiry}
                              onChange={(e) =>
                                setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })
                              }
                              required
                              className="rounded-xl h-8 text-xs bg-white font-mono"
                            />
                            <Input
                              placeholder="CVV"
                              value={paymentDetails.cardCvv}
                              onChange={(e) =>
                                setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })
                              }
                              required
                              className="rounded-xl h-8 text-xs bg-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Internal Notes */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Internal Notes (Optional)
                        </Label>
                        <Input
                          placeholder="e.g. Patient placed assisted order via telephone support"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className="rounded-xl h-8 text-xs bg-white"
                        />
                      </div>

                      {/* Financial Breakdown */}
                      <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Subtotal:</span>
                          <span>${orderSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Shipping:</span>
                          <span className="text-emerald-600 font-semibold">Free Delivery</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-200">
                          <span>Total to Bill:</span>
                          <span className="text-indigo-600">${orderSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Subtotal:</span>
                    <span className="text-lg font-black text-slate-900">${orderSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                      disabled={submittingCreate}
                      className="rounded-xl h-10 px-4 text-xs font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingCreate || selectedItems.length === 0 || !selectedPatientId}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-5 text-xs gap-2 shadow-sm cursor-pointer"
                    >
                      {submittingCreate ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Place Customer Order
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
