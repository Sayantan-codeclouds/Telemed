import { jsPDF } from "jspdf";
import { makePdfTextSafe, imageFormatOf } from "./pdfText.js";

/**
 * Medical Prescription PDF Generator
 * Renders an e-Prescription with the doctor's credentials, patient details,
 * diagnosis, medication schedule, signature and clinic stamp.
 *
 * Only details the doctor actually provided are printed (missing ones show
 * "—"); long content wraps and continues on new pages, and the signature
 * block is always kept together on the last page.
 *
 * @param {Object} prescription - The populated prescription object
 */
export const downloadPrescriptionPdf = (prescription) => {
  if (!prescription) return;

  const doc = makePdfTextSafe(new jsPDF({ unit: "mm", format: "a4" }));
  const W = doc.internal.pageSize.getWidth(); // 210mm
  const H = doc.internal.pageSize.getHeight(); // 297mm
  const MARGIN = 14;
  const CONTENT_BOTTOM = H - 22; // keep clear of the page footer text
  let y = 0;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const hex2rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const setFill = (hex) => doc.setFillColor(...hex2rgb(hex));
  const setTextColor = (hex) => doc.setTextColor(...hex2rgb(hex));
  const setDrawColor = (hex) => doc.setDrawColor(...hex2rgb(hex));
  const font = (style, size, color) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    if (color) setTextColor(color);
  };
  // Height in mm of `lines` lines at the current font size.
  const linesHeight = (lines) => lines.length * doc.getLineHeight() / doc.internal.scaleFactor;
  // Single line clipped to `width` (adds "..." when cut).
  const fitLine = (text, width) => {
    const lines = doc.splitTextToSize(String(text || ""), width);
    return lines.length > 1 ? `${lines[0].replace(/\s+$/, "")}...` : lines[0] || "";
  };

  const docData = prescription.doctor || {};
  const patData = prescription.patient || {};
  const doctorName = `Dr. ${docData.firstName || ""} ${docData.lastName || ""}`.replace(/\s+/g, " ").trim();
  const patientName = `${patData.firstName || ""} ${patData.lastName || ""}`.trim() || "—";
  // Credentials are printed exactly as the doctor entered them, never invented.
  const hospital = docData.hospital || "";
  const license = docData.licenseNumber || "—";
  const credentialLine = [docData.qualification, docData.specialization].filter(Boolean).join(" • ") || "—";
  const rxId = `RX-${String(prescription._id || "").slice(-8).toUpperCase()}`;
  const dateOptions = { month: "short", day: "numeric", year: "numeric" };
  const issueDate = new Date(prescription.createdAt || Date.now()).toLocaleDateString("en-US", dateOptions);

  // Header strip repeated on continuation pages.
  const continuationHeader = () => {
    setFill("#1e3a8a");
    doc.rect(0, 0, W, 12, "F");
    font("bold", 9, "#ffffff");
    doc.text(fitLine(`Prescription ${rxId} — ${patientName} (continued)`, W - 2 * MARGIN), MARGIN, 8);
    y = 20;
  };
  // Starts a new page when `height` more mm won't fit.
  const ensureSpace = (height) => {
    if (y + height > CONTENT_BOTTOM) {
      doc.addPage();
      continuationHeader();
      return true;
    }
    return false;
  };

  // ─── 1. Header Banner ───────────────────────────────────────────────────────
  setFill("#1e3a8a");
  doc.rect(0, 0, W, 32, "F");
  setFill("#0284c7");
  doc.rect(0, 32, W, 2, "F");

  font("bold", 16, "#ffffff");
  doc.text(fitLine((hospital || "TeleClinic").toUpperCase(), W - 50), MARGIN, 13);

  font("normal", 8.5, "#93c5fd");
  doc.text("TELEHEALTH ELECTRONIC PRESCRIPTION (e-Rx)", MARGIN, 20);
  doc.text("Issued via the TeleClinic telehealth platform", MARGIN, 26);

  font("bold", 22, "#38bdf8");
  doc.text("Rx", W - 28, 22);

  y = 42;

  // ─── 2. Doctor & Patient Cards ──────────────────────────────────────────────
  const cardWidth = 88;
  const cardText = cardWidth - 8;
  setFill("#f8fafc");
  setDrawColor("#e2e8f0");
  doc.roundedRect(MARGIN, y, cardWidth, 38, 3, 3, "FD");

  font("bold", 10, "#0f172a");
  doc.text(fitLine(doctorName || "—", cardText), 18, y + 7);
  font("normal", 8, "#0284c7");
  doc.text(fitLine(credentialLine, cardText), 18, y + 13);
  font("normal", 7.5, "#64748b");
  doc.text(fitLine(`Medical Council Reg / Lic: ${license}`, cardText), 18, y + 19);
  doc.text(fitLine(`Facility: ${hospital || "—"}`, cardText), 18, y + 25);
  doc.text("Consultation Mode: Video Telehealth Visit", 18, y + 31);

  setFill("#f8fafc");
  setDrawColor("#e2e8f0");
  doc.roundedRect(108, y, cardWidth, 38, 3, 3, "FD");

  font("bold", 10, "#0f172a");
  doc.text(fitLine(patientName, cardText), 112, y + 7);
  font("normal", 7.5, "#64748b");
  doc.text(fitLine(`Gender: ${patData.gender || "—"}   •   Blood Group: ${patData.bloodGroup || "—"}`, cardText), 112, y + 13);
  doc.text(fitLine(`Contact: ${patData.phone || "—"}`, cardText), 112, y + 19);
  doc.text(`Prescription ID: ${rxId}`, 112, y + 25);
  doc.text(`Issued Date: ${issueDate}`, 112, y + 31);

  y += 44;

  // ─── 3. Clinical Diagnosis ──────────────────────────────────────────────────
  if (prescription.diagnosis) {
    font("bold", 9.5);
    const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, W - 2 * MARGIN - 8);
    const boxHeight = 9 + linesHeight(diagnosisLines);
    ensureSpace(boxHeight + 4);

    setFill("#eff6ff");
    setDrawColor("#bfdbfe");
    doc.roundedRect(MARGIN, y, W - 2 * MARGIN, boxHeight, 2.5, 2.5, "FD");
    font("bold", 8, "#1e40af");
    doc.text("CLINICAL DIAGNOSIS / ASSESSMENT:", 18, y + 5.5);
    font("bold", 9.5, "#0f172a");
    doc.text(diagnosisLines, 18, y + 10.5);
    y += boxHeight + 4;
  }

  // ─── 4. Prescribed Medications Table ────────────────────────────────────────
  // Column x positions and wrap widths (mm).
  const COLUMNS = [
    { key: "index", label: "#", x: 16, width: 6 },
    { key: "name", label: "MEDICINE NAME", x: 23, width: 55 },
    { key: "dosage", label: "DOSAGE", x: 80, width: 26 },
    { key: "frequency", label: "FREQUENCY", x: 108, width: 28 },
    { key: "duration", label: "DURATION", x: 138, width: 20 },
    { key: "instructions", label: "INSTRUCTIONS", x: 160, width: W - MARGIN - 160 - 1 },
  ];

  const tableHeader = () => {
    setFill("#1e3a8a");
    doc.roundedRect(MARGIN, y, W - 2 * MARGIN, 8, 1.5, 1.5, "F");
    font("bold", 7.5, "#ffffff");
    for (const col of COLUMNS) doc.text(col.label, col.x, y + 5.5);
    y += 9;
  };

  ensureSpace(30);
  font("bold", 10, "#1e3a8a");
  doc.text("PRESCRIBED MEDICATIONS & DOSAGE SCHEDULE", MARGIN, y);
  y += 4;
  tableHeader();

  const meds = prescription.medicines || [];
  if (meds.length === 0) {
    font("normal", 8, "#64748b");
    doc.text("No medications listed on this record.", 18, y + 6);
    y += 12;
  } else {
    meds.forEach((med, idx) => {
      const values = {
        index: String(idx + 1),
        name: med.name || "—",
        dosage: med.dosage || "—",
        frequency: med.frequency || "—",
        duration: med.duration || "—",
        instructions: med.instructions || "As directed",
      };
      // Wrap every cell; the row is as tall as its tallest cell.
      const cells = COLUMNS.map((col) => {
        font(col.key === "name" || col.key === "index" ? "bold" : "normal", col.key === "name" || col.key === "index" ? 8 : 7.5);
        return doc.splitTextToSize(values[col.key], col.width);
      });
      font("normal", 8);
      const rowHeight = Math.max(9, 4 + Math.max(...cells.map((lines) => linesHeight(lines))));

      if (ensureSpace(rowHeight)) tableHeader();

      if (idx % 2 === 0) {
        setFill("#f8fafc");
        doc.rect(MARGIN, y - 1, W - 2 * MARGIN, rowHeight, "F");
      }
      setDrawColor("#e2e8f0");
      doc.line(MARGIN, y + rowHeight - 1, W - MARGIN, y + rowHeight - 1);

      COLUMNS.forEach((col, i) => {
        const strong = col.key === "name" || col.key === "index";
        font(strong ? "bold" : "normal", strong ? 8 : 7.5, strong ? "#0f172a" : "#334155");
        doc.text(cells[i], col.x, y + 4);
      });
      y += rowHeight;
    });
  }

  y += 4;

  // ─── 5. Doctor's Advice & Validity ──────────────────────────────────────────
  if (prescription.notes) {
    font("normal", 8);
    const noteLines = doc.splitTextToSize(prescription.notes, W - 2 * MARGIN - 8);
    // Long notes may span pages: draw them in chunks that fit.
    let first = true;
    let remaining = noteLines;
    while (remaining.length > 0) {
      ensureSpace(16);
      const lineHeight = linesHeight([""]);
      const titleSpace = first ? 9 : 4;
      const fit = Math.max(1, Math.floor((CONTENT_BOTTOM - y - titleSpace - 3) / lineHeight));
      const chunk = remaining.slice(0, fit);
      remaining = remaining.slice(fit);
      const boxHeight = titleSpace + linesHeight(chunk) + 2;

      setFill("#fffbeb");
      setDrawColor("#fef3c7");
      doc.roundedRect(MARGIN, y, W - 2 * MARGIN, boxHeight, 2, 2, "FD");
      if (first) {
        font("bold", 8, "#92400e");
        doc.text("DOCTOR'S CLINICAL ADVICE & INSTRUCTIONS:", 18, y + 5);
      }
      font("normal", 8, "#78350f");
      doc.text(chunk, 18, y + titleSpace + 1.5);
      y += boxHeight + 4;
      first = false;
      if (remaining.length > 0) {
        doc.addPage();
        continuationHeader();
      }
    }
  }

  ensureSpace(13);
  setFill("#f1f5f9");
  setDrawColor("#cbd5e1");
  doc.roundedRect(MARGIN, y, W - 2 * MARGIN, 9, 2, 2, "FD");
  font("bold", 7.5, "#334155");
  const validityDays = prescription.validityDays || 14;
  const validUntilStr = prescription.validUntil
    ? new Date(prescription.validUntil).toLocaleDateString("en-US", dateOptions)
    : `${validityDays} days from issue`;
  doc.text(`Prescription Validity: ${validityDays} Days (Valid until: ${validUntilStr})`, 18, y + 6);
  doc.text(`Recheckup: Schedule before ${validUntilStr}`, W - 80, y + 6);
  y += 15;

  // ─── 6. Signature & Clinic Stamp (kept together on the last page) ───────────
  const FOOTER_HEIGHT = 42;
  if (y + FOOTER_HEIGHT > CONTENT_BOTTOM) {
    doc.addPage();
    continuationHeader();
  }
  const footerBoxY = Math.max(y, CONTENT_BOTTOM - FOOTER_HEIGHT);

  setFill("#ffffff");
  setDrawColor("#cbd5e1");
  doc.roundedRect(MARGIN, footerBoxY, W - 2 * MARGIN, FOOTER_HEIGHT, 3, 3, "D");

  const drawImage = (dataUrl, x, imgY, w, h) => {
    const format = imageFormatOf(dataUrl);
    if (!format) return false;
    try {
      doc.addImage(dataUrl, format, x, imgY, w, h);
      return true;
    } catch {
      return false;
    }
  };

  // Left: clinic stamp (only the doctor's own; nothing is drawn in its place)
  const stampImage = prescription.clinicStamp || docData.clinicStamp;
  if (!stampImage || !drawImage(stampImage, 18, footerBoxY + 3, 30, 30)) {
    setDrawColor("#cbd5e1");
    doc.setLineDashPattern([1, 1], 0);
    doc.rect(18, footerBoxY + 5, 28, 28);
    doc.setLineDashPattern([], 0);
    font("normal", 6, "#94a3b8");
    doc.text("No stamp", 32, footerBoxY + 20, { align: "center" });
  }

  font("bold", 7.5, "#0f172a");
  doc.text("CLINIC STAMP", 52, footerBoxY + 14);
  font("normal", 7, "#64748b");
  doc.text(fitLine(hospital || "—", 70), 52, footerBoxY + 19);
  doc.text(fitLine(`License Reg: ${license}`, 70), 52, footerBoxY + 24);

  // Right: doctor's signature
  const sigImage = prescription.signature || docData.signature;
  if (sigImage) drawImage(sigImage, W - 70, footerBoxY + 2, 45, 18);

  font("bold", 9, "#0f172a");
  doc.text(fitLine(doctorName || "—", 75), W - 20, footerBoxY + 24, { align: "right" });
  font("normal", 7.5, "#0284c7");
  doc.text(fitLine(docData.qualification || "", 75), W - 20, footerBoxY + 29, { align: "right" });
  font("normal", 6.5, "#94a3b8");
  doc.text(`Issued on ${issueDate} via TeleClinic`, W - 20, footerBoxY + 34, { align: "right" });

  // ─── 7. Page footer on every page ───────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    font("normal", 6.5, "#94a3b8");
    doc.text(
      "Electronic prescription issued after a telemedicine consultation. Dispense only at licensed pharmacies.",
      W / 2,
      H - 12,
      { align: "center" }
    );
    doc.text(`Prescription ${rxId} • Page ${page} of ${pageCount}`, W / 2, H - 8, { align: "center" });
  }

  const cleanDocName = (docData.lastName || "Doctor").replace(/[^a-zA-Z0-9]/g, "");
  const cleanPatName = (patData.lastName || "Patient").replace(/[^a-zA-Z0-9]/g, "");
  doc.save(`TeleClinic_Prescription_${cleanDocName}_${cleanPatName}_${rxId}.pdf`);
};
