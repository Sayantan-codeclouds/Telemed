import { jsPDF } from "jspdf";

/**
 * Generate and download a pharmacy invoice PDF for a given order.
 * @param {Object} order  - The order object from the API
 * @param {string} currencySign - e.g. "$"
 */
export const downloadInvoicePdf = (order, currencySign = "$") => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 0;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const hex2rgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  const setFill = (hex) => doc.setFillColor(...hex2rgb(hex));
  const setTextColor = (hex) => doc.setTextColor(...hex2rgb(hex));
  const setDrawColor = (hex) => doc.setDrawColor(...hex2rgb(hex));

  const fmt = (n) => `${currencySign}${Number(n || 0).toFixed(2)}`;
  const label = (txt) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor("#94a3b8");
    doc.text(txt, 14, y);
  };
  const value = (txt, x = 14, align = "left") => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setTextColor("#0f172a");
    doc.text(String(txt), x, y, { align });
  };

  const isConsultation = order.orderType === "CONSULTATION";

  // ─── Header Banner ─────────────────────────────────────────────────────────
  setFill(isConsultation ? "#0f172a" : "#312e81");
  doc.rect(0, 0, W, 38, "F");

  // Subtle gradient strip
  setFill(isConsultation ? "#0284c7" : "#4f46e5");
  doc.rect(0, 30, W, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setTextColor("#ffffff");
  doc.text(isConsultation ? "TeleClinic Healthcare" : "TeleClinic Pharmacy", 14, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setTextColor(isConsultation ? "#7dd3fc" : "#a5b4fc");
  doc.text(
    isConsultation
      ? "Doctor Video Consultation & Healthcare Services — Powered by Vrio CRM"
      : "Certified Medicine Delivery — Powered by Vrio CRM",
    14,
    25
  );

  // INVOICE label top-right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  setTextColor("#ffffff");
  doc.text(isConsultation ? "TAX INVOICE" : "INVOICE", W - 14, 21, { align: "right" });

  y = 50;

  // ─── Order Meta Row ────────────────────────────────────────────────────────
  const ordId = order.vrioOrderId || order.stickyCrmOrderId || order._id?.slice(-8).toUpperCase();
  const ordDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "—";

  // Left column
  label("Order Reference");
  y += 5;
  value(`#${ordId}`);
  y += 2;
  label("Order Date");
  y += 5;
  value(ordDate);

  // Right column
  const rx = W - 14;
  const ryStart = 50;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColor("#94a3b8");
  doc.text("Payment Status", rx, ryStart, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  const pStatus = order.paymentStatus || "PAID";
  setTextColor(pStatus === "PAID" ? "#16a34a" : "#dc2626");
  doc.text(pStatus, rx, ryStart + 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColor("#94a3b8");
  doc.text("Order Status", rx, ryStart + 12, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setTextColor("#4f46e5");
  doc.text(order.status || "PROCESSING", rx, ryStart + 17, { align: "right" });

  y = 78;

  // ─── Divider ───────────────────────────────────────────────────────────────
  setDrawColor("#e2e8f0");
  doc.setLineWidth(0.4);
  doc.line(14, y, W - 14, y);
  y += 8;

  // ─── Bill To / Deliver To ──────────────────────────────────────────────────
  const colW = (W - 28) / 2;

  label("BILL TO");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColor("#94a3b8");
  doc.text("SHIP TO", 14 + colW, y);
  y += 5;

  const bFname = order.billingDetails?.fname || order.patient?.firstName || "";
  const bLname = order.billingDetails?.lname || order.patient?.lastName || "";
  const bEmail = order.billingDetails?.email || order.patient?.email || "";
  const bPhone = order.billingDetails?.phone || order.patient?.phone || "";
  const bFullName = `${bFname} ${bLname}`.trim() || "—";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setTextColor("#0f172a");
  doc.text(bFullName, 14, y);
  doc.text(bFullName, 14 + colW, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColor("#475569");

  if (bEmail) { doc.text(bEmail, 14, y); y += 4; }
  if (bPhone) { doc.text(bPhone, 14, y); y += 4; }
  if (order.billingDetails?.address1) { doc.text(order.billingDetails.address1, 14, y); y += 4; }

  // Ship-to (reset y to after name)
  let sy = y - (bEmail ? 4 : 0) - (bPhone ? 4 : 0) - (order.billingDetails?.address1 ? 4 : 0);
  const addr = order.shippingAddress;
  if (addr) {
    const lines = [
      addr.line1,
      `${addr.city}, ${addr.state} ${addr.pincode}`,
      addr.country,
    ].filter(Boolean);
    lines.forEach((l) => {
      doc.text(l, 14 + colW, sy);
      sy += 4;
    });
  }

  y = Math.max(y, sy) + 6;

  // ─── Items Table Header ────────────────────────────────────────────────────
  setFill(isConsultation ? "#0f172a" : "#1e1b4b");
  doc.rect(14, y, W - 28, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setTextColor(isConsultation ? "#bae6fd" : "#c7d2fe");

  const cols = { item: 14, qty: W - 80, unit: W - 55, total: W - 14 };
  doc.text(isConsultation ? "CONSULTATION / MEDICAL SERVICE" : "MEDICINE / ITEM", cols.item + 3, y + 6);
  doc.text("QTY", cols.qty + 2, y + 6);
  doc.text("UNIT PRICE", cols.unit, y + 6, { align: "right" });
  doc.text("TOTAL", cols.total, y + 6, { align: "right" });
  y += 9;

  // ─── Items Table Rows ──────────────────────────────────────────────────────
  const items = order.items || [];
  items.forEach((it, idx) => {
    const rowH = 10;
    if (idx % 2 === 0) {
      setFill("#f8faff");
      doc.rect(14, y, W - 28, rowH, "F");
    }
    setDrawColor("#e2e8f0");
    doc.setLineWidth(0.2);
    doc.line(14, y + rowH, W - 14, y + rowH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    setTextColor("#0f172a");
    doc.text(String(it.name || (isConsultation ? "Doctor Video Consultation" : "—")), cols.item + 3, y + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor("#475569");
    doc.text(String(it.quantity || 1), cols.qty + 5, y + 6.5, { align: "center" });

    doc.text(fmt(it.price), cols.unit, y + 6.5, { align: "right" });

    doc.setFont("helvetica", "bold");
    setTextColor(isConsultation ? "#0369a1" : "#1e1b4b");
    doc.text(fmt(it.price * (it.quantity || 1)), cols.total, y + 6.5, { align: "right" });
    y += rowH;

    // page overflow guard
    if (y > pageH - 60) {
      doc.addPage();
      y = 20;
    }
  });

  y += 8;

  // ─── Totals Block (right-aligned) ─────────────────────────────────────────
  const totW = 80;
  const totX = W - 14 - totW;

  const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0);
  const discount = Number(order.discountAmount || 0);
  const total = Number(order.totalAmount || subtotal - discount);

  const addTotRow = (lbl, val, bold = false, colorHex = "#475569") => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 9 : 8);
    setTextColor(colorHex);
    doc.text(lbl, totX, y);
    doc.text(val, W - 14, y, { align: "right" });
    y += 6;
  };

  addTotRow("Subtotal", fmt(subtotal));
  if (discount > 0) addTotRow(`Discount (${order.discountCode || order.couponCode || ""})`, `-${fmt(discount)}`, false, "#16a34a");
  addTotRow(isConsultation ? "Delivery Mode" : "Delivery", isConsultation ? "Virtual Video (Included)" : "FREE", false, "#16a34a");

  // Total row with box
  setFill(isConsultation ? "#0f172a" : "#1e1b4b");
  doc.rect(totX - 4, y - 2, totW + 4, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor("#ffffff");
  doc.text("TOTAL PAID", totX, y + 6);
  doc.text(fmt(total), W - 14, y + 6, { align: "right" });
  y += 18;

  // Card used row
  if (order.billingDetails?.cardLast4) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor("#64748b");
    const cardBrand = (order.billingDetails.cardType || "Card").toUpperCase();
    doc.text(`Payment: ${cardBrand} ending ••••${order.billingDetails.cardLast4}`, W - 14, y, { align: "right" });
    y += 6;
  }

  // ─── Divider ───────────────────────────────────────────────────────────────
  y += 4;
  setDrawColor("#e2e8f0");
  doc.setLineWidth(0.4);
  doc.line(14, y, W - 14, y);
  y += 8;

  // ─── Vrio CRM reference ────────────────────────────────────────────────────
  if (order.vrioOrderId || order.stickyCrmOrderId) {
    setFill(isConsultation ? "#f0f9ff" : "#eef2ff");
    doc.rect(14, y - 3, W - 28, 14, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setTextColor(isConsultation ? "#0284c7" : "#4338ca");
    doc.text(isConsultation ? "Vrio CRM Consultation Order ID" : "Vrio CRM Reference", 18, y + 3);
    doc.setFont("helvetica", "bold");
    doc.text(String(order.vrioOrderId || order.stickyCrmOrderId), 18, y + 9);
    y += 18;
  }

  // ─── Footer ────────────────────────────────────────────────────────────────
  const footerY = pageH - 18;
  setFill(isConsultation ? "#0f172a" : "#1e1b4b");
  doc.rect(0, footerY, W, 18, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setTextColor(isConsultation ? "#bae6fd" : "#a5b4fc");
  doc.text(
    isConsultation
      ? "TeleClinic Healthcare — Certified Telemedicine Consultation Services"
      : "TeleClinic Pharmacy — Certified Online Pharmacy",
    14,
    footerY + 7
  );
  doc.text("This is a computer-generated invoice and requires no signature.", 14, footerY + 13);
  setTextColor(isConsultation ? "#38bdf8" : "#6366f1");
  doc.text(new Date().toLocaleDateString(), W - 14, footerY + 10, { align: "right" });

  // ─── Save ─────────────────────────────────────────────────────────────────
  const prefix = isConsultation ? "TeleClinic_Consultation_Invoice" : "TeleClinic_Invoice";
  const filename = `${prefix}_${ordId}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
};
