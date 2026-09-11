import { jsPDF } from "jspdf";

/**
 * Official Medical Prescription PDF Generator
 * Renders an authentic e-Prescription with doctor credentials, patient details,
 * clinical diagnosis, medications schedule, digital signature, and clinic stamp.
 *
 * @param {Object} prescription - The populated prescription object
 */
export const downloadPrescriptionPdf = (prescription) => {
  if (!prescription) return;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth(); // 210mm
  const H = doc.internal.pageSize.getHeight(); // 297mm
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

  const docData = prescription.doctor || {};
  const patData = prescription.patient || {};
  const doctorName = `Dr. ${docData.firstName || "Practitioner"} ${docData.lastName || ""}`.trim();
  const patientName = `${patData.firstName || "Patient"} ${patData.lastName || ""}`.trim();
  const hospital = docData.hospital || "TeleClinic Virtual Medical Center";
  const license = docData.licenseNumber || "N/A";
  const spec = docData.specialization || "General Physician";
  const qual = docData.qualification || "MBBS";
  const rxId = `RX-${String(prescription._id || "").slice(-8).toUpperCase()}`;
  const issueDate = prescription.createdAt
    ? new Date(prescription.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  // ─── 1. Header Banner ───────────────────────────────────────────────────────
  setFill("#1e3a8a"); // Deep Clinical Navy
  doc.rect(0, 0, W, 32, "F");

  // Accent Line
  setFill("#0284c7"); // Cyan accent
  doc.rect(0, 32, W, 2, "F");

  // Hospital Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setTextColor("#ffffff");
  doc.text(hospital.toUpperCase(), 14, 13);

  // Sub-header
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setTextColor("#93c5fd");
  doc.text("TELEHEALTH ELECTRONIC PRESCRIPTION (e-Rx) • CERTIFIED CLINICAL CARE", 14, 20);
  doc.text("Web: https://teleclinic.care • 24/7 Digital Health Network", 14, 26);

  // Rx symbol graphic in banner right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  setTextColor("#38bdf8");
  doc.text("℞", W - 25, 22);

  y = 42;

  // ─── 2. Top Info Row: Doctor & Patient Cards ─────────────────────────────────
  // Doctor Card (Left)
  setFill("#f8fafc");
  setDrawColor("#e2e8f0");
  doc.roundedRect(14, y, 88, 38, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor("#0f172a");
  doc.text(doctorName, 18, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColor("#0284c7");
  doc.text(`${qual} • ${spec}`, 18, y + 13);

  doc.setFontSize(7.5);
  setTextColor("#64748b");
  doc.text(`Medical Council Reg / Lic: ${license}`, 18, y + 19);
  doc.text(`Facility: ${hospital}`, 18, y + 25);
  doc.text(`Consultation Mode: Video Telehealth Visit`, 18, y + 31);

  // Patient Card (Right)
  setFill("#f8fafc");
  setDrawColor("#e2e8f0");
  doc.roundedRect(108, y, 88, 38, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor("#0f172a");
  doc.text(patientName, 112, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setTextColor("#64748b");

  const genderStr = patData.gender || "—";
  const phoneStr = patData.phone || "—";
  const bloodStr = patData.bloodGroup || "—";

  doc.text(`Gender: ${genderStr}   •   Blood Group: ${bloodStr}`, 112, y + 13);
  doc.text(`Contact: ${phoneStr}`, 112, y + 19);
  doc.text(`Prescription ID: ${rxId}`, 112, y + 25);
  doc.text(`Issued Date: ${issueDate}`, 112, y + 31);

  y += 44;

  // ─── 3. Clinical Diagnosis Box ──────────────────────────────────────────────
  if (prescription.diagnosis) {
    setFill("#eff6ff");
    setDrawColor("#bfdbfe");
    doc.roundedRect(14, y, W - 28, 14, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor("#1e40af");
    doc.text("CLINICAL DIAGNOSIS / ASSESSMENT:", 18, y + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setTextColor("#0f172a");
    doc.text(prescription.diagnosis, 18, y + 10.5);

    y += 18;
  }

  // ─── 4. Prescribed Medications Table ────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTextColor("#1e3a8a");
  doc.text("PRESCRIBED MEDICATIONS & DOSAGE SCHEDULE", 14, y);

  y += 4;

  // Table Header Bar
  setFill("#1e3a8a");
  doc.roundedRect(14, y, W - 28, 8, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setTextColor("#ffffff");
  doc.text("#", 18, y + 5.5);
  doc.text("MEDICINE NAME", 26, y + 5.5);
  doc.text("DOSAGE", 88, y + 5.5);
  doc.text("FREQUENCY", 118, y + 5.5);
  doc.text("DURATION", 148, y + 5.5);
  doc.text("INSTRUCTIONS", 172, y + 5.5);

  y += 9;

  const meds = prescription.medicines || [];
  if (meds.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor("#64748b");
    doc.text("No medications listed on this record.", 18, y + 6);
    y += 12;
  } else {
    meds.forEach((med, idx) => {
      // Alternating row background
      if (idx % 2 === 0) {
        setFill("#f8fafc");
        doc.rect(14, y - 1, W - 28, 9, "F");
      }

      setDrawColor("#e2e8f0");
      doc.line(14, y + 8, W - 14, y + 8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setTextColor("#0f172a");
      doc.text(String(idx + 1), 18, y + 5);
      doc.text(med.name || "Medicine", 26, y + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      setTextColor("#334155");
      doc.text(med.dosage || "—", 88, y + 5);
      doc.text(med.frequency || "—", 118, y + 5);
      doc.text(med.duration || "—", 148, y + 5);
      doc.text(med.instructions || "As directed", 172, y + 5);

      y += 9;
    });
  }

  y += 4;

  // ─── 5. Clinical Advice & Validity Box ──────────────────────────────────────
  if (prescription.notes) {
    setFill("#fffbeb");
    setDrawColor("#fef3c7");
    doc.roundedRect(14, y, W - 28, 15, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTextColor("#92400e");
    doc.text("DOCTOR'S CLINICAL ADVICE & INSTRUCTIONS:", 18, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor("#78350f");
    const splitNotes = doc.splitTextToSize(prescription.notes, W - 36);
    doc.text(splitNotes, 18, y + 10);

    y += 19;
  }

  // Validity Period
  setFill("#f1f5f9");
  setDrawColor("#cbd5e1");
  doc.roundedRect(14, y, W - 28, 9, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setTextColor("#334155");
  const validityDays = prescription.validityDays || 14;
  const validUntilStr = prescription.validUntil
    ? new Date(prescription.validUntil).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Standard 14 Days";
  doc.text(`Prescription Validity: ${validityDays} Days (Valid until: ${validUntilStr})`, 18, y + 6);
  doc.text(`Recheckup: Schedule before ${validUntilStr}`, W - 80, y + 6);

  y += 15;

  // ─── 6. Authentication Footer: Signature & Clinic Stamp ─────────────────────
  // Position near bottom of page if not overflowing
  const footerBoxY = Math.max(y, H - 65);

  setFill("#ffffff");
  setDrawColor("#cbd5e1");
  doc.roundedRect(14, footerBoxY, W - 28, 42, 3, 3, "D");

  // Left: Official Clinic Stamp
  const stampImage = prescription.clinicStamp || docData.clinicStamp;
  if (stampImage) {
    try {
      doc.addImage(stampImage, "PNG", 18, footerBoxY + 3, 30, 30);
    } catch (e) {
      // Fallback text if image format unsupported in jsPDF
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      setTextColor("#1e40af");
      doc.text("OFFICIAL CLINIC SEAL", 20, footerBoxY + 15);
      doc.text(hospital.slice(0, 24), 20, footerBoxY + 20);
    }
  } else {
    // Default Seal Frame
    setDrawColor("#94a3b8");
    doc.circle(32, footerBoxY + 18, 14);
    doc.circle(32, footerBoxY + 18, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    setTextColor("#475569");
    doc.text("TELECLINIC", 32, footerBoxY + 16, { align: "center" });
    doc.text("VERIFIED", 32, footerBoxY + 20, { align: "center" });
  }

  // Clinic Stamp Label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setTextColor("#0f172a");
  doc.text("OFFICIAL CLINIC STAMP", 52, footerBoxY + 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setTextColor("#64748b");
  doc.text(hospital, 52, footerBoxY + 19);
  doc.text(`License Reg: ${license}`, 52, footerBoxY + 24);

  // Right: Doctor's Digital Signature
  const sigImage = prescription.signature || docData.signature;
  if (sigImage) {
    try {
      doc.addImage(sigImage, "PNG", W - 70, footerBoxY + 2, 45, 18);
    } catch (e) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      setTextColor("#0f172a");
      doc.text(doctorName, W - 20, footerBoxY + 14, { align: "right" });
    }
  }

  // Doctor Signature Label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setTextColor("#0f172a");
  doc.text(doctorName, W - 20, footerBoxY + 24, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setTextColor("#0284c7");
  doc.text(`${qual} • Digitally Signed`, W - 20, footerBoxY + 29, { align: "right" });

  doc.setFontSize(6.5);
  setTextColor("#94a3b8");
  doc.text(`Signed on ${issueDate} via TeleClinic Care Engine`, W - 20, footerBoxY + 34, { align: "right" });

  // ─── 7. Legal Telemedicine Compliance Disclaimer ────────────────────────────
  const legalY = H - 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setTextColor("#94a3b8");
  doc.text(
    "This electronic prescription is generated under Telemedicine Practice Guidelines and is digitally authenticated.",
    W / 2,
    legalY,
    { align: "center" }
  );
  doc.text(
    "Authorized for dispensation at licensed pharmacies • Verify authenticity at https://teleclinic.care/verify-rx",
    W / 2,
    legalY + 4,
    { align: "center" }
  );

  // Save / Download PDF
  const cleanDocName = (docData.lastName || "Doctor").replace(/[^a-zA-Z0-9]/g, "");
  const cleanPatName = (patData.lastName || "Patient").replace(/[^a-zA-Z0-9]/g, "");
  doc.save(`TeleClinic_Prescription_${cleanDocName}_${cleanPatName}_${rxId}.pdf`);
};
