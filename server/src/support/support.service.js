import SupportTicket from "./support.model.js";
import Doctor from "../doctors/doctor.model.js";
import Patient from "../patients/patient.model.js";
import AppError from "../shared/errors/AppError.js";
import {
  sendSupportTicketCreatedEmail,
  sendAdminSupportTicketAlertEmail,
  sendSupportTicketResolvedEmail,
} from "../mail/mail.service.js";
import { getCrmSettingsService } from "../pharmacy/vrio.service.js";
import { createNotificationService } from "../notifications/notification.service.js";

/**
 * Generate human-readable ticket ID e.g. TIC-849201
 */
const generateTicketId = () => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `TIC-${num}`;
};

/**
 * Submit a new Support Ticket (via form / email)
 */
export const createSupportTicketService = async (data, user, userType = "Guest") => {
  const {
    name,
    email,
    phone,
    category = "General Inquiry",
    priority = "MEDIUM",
    subject,
    message,
  } = data;

  if (!subject?.trim()) throw AppError.badRequest("Subject is required.");
  if (!message?.trim()) throw AppError.badRequest("Message description is required.");

  let senderName = name?.trim();
  let senderEmail = email?.trim()?.toLowerCase();
  let senderPhone = phone?.trim() || "";
  let senderType = userType;
  let patientId = null;
  let doctorId = null;

  if (user) {
    if (userType === "Patient" || user.role === "patient") {
      senderType = "Patient";
      patientId = user._id;
      senderName = senderName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name;
      senderEmail = senderEmail || user.email;
      senderPhone = senderPhone || user.phone || "";
    } else if (userType === "Doctor" || user.role === "doctor") {
      senderType = "Doctor";
      doctorId = user._id;
      senderName = senderName || `Dr. ${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name;
      senderEmail = senderEmail || user.email;
      senderPhone = senderPhone || user.phone || "";
    } else if (userType === "Admin" || user.role === "admin") {
      senderType = "Admin";
      senderName = senderName || "Admin Support";
      senderEmail = senderEmail || user.email;
    }
  } else if (senderEmail) {
    // Auto-link to existing Doctor or Patient by email if unauthenticated
    try {
      const existingDoctor = await Doctor.findOne({ email: senderEmail });
      if (existingDoctor) {
        senderType = "Doctor";
        doctorId = existingDoctor._id;
        if (!senderName || senderName === "Support Requester") {
          senderName = `Dr. ${existingDoctor.firstName || ""} ${existingDoctor.lastName || ""}`.trim();
        }
      } else {
        const existingPatient = await Patient.findOne({ email: senderEmail });
        if (existingPatient) {
          senderType = "Patient";
          patientId = existingPatient._id;
        }
      }
    } catch {
      // Ignore lookup failure
    }
  }

  if (!senderEmail) throw AppError.badRequest("Valid email address is required.");
  if (!senderName) senderName = "Support Requester";

  // Create unique ticket ID
  let ticketId = generateTicketId();
  while (await SupportTicket.findOne({ ticketId })) {
    ticketId = generateTicketId();
  }

  const ticket = await SupportTicket.create({
    ticketId,
    senderType,
    patient: patientId,
    doctor: doctorId,
    name: senderName,
    email: senderEmail,
    phone: senderPhone,
    category: category?.trim() || "General Inquiry",
    priority: ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority) ? priority : "MEDIUM",
    subject: subject.trim(),
    message: message.trim(),
    status: "OPEN",
  });

  // Fetch admin configured support email
  let adminSupportEmail = "sayantan.das@codeclouds.com";
  try {
    const settings = await getCrmSettingsService();
    if (senderType === "Doctor" && settings?.doctorSupportEmail) {
      adminSupportEmail = settings.doctorSupportEmail;
    } else if (settings?.supportEmail) {
      adminSupportEmail = settings.supportEmail;
    }
  } catch {
    adminSupportEmail = "sayantan.das@codeclouds.com";
  }

  // 1. Non-blocking confirmation email to User/Submitter
  sendSupportTicketCreatedEmail({
    email: senderEmail,
    name: senderName,
    ticketId,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    message: ticket.message,
  }).catch((err) => {
    console.error("[Support Service] Failed to send user confirmation email:", err?.message || err);
  });

  // 2. Non-blocking alert email to Admin Support Inbox
  sendAdminSupportTicketAlertEmail({
    adminEmail: adminSupportEmail,
    ticketId,
    name: senderName,
    senderEmail,
    senderPhone,
    senderType,
    category: ticket.category,
    priority: ticket.priority,
    subject: ticket.subject,
    message: ticket.message,
  }).catch((err) => {
    console.error("[Support Service] Failed to send admin alert email:", err?.message || err);
  });

  // 3. Non-blocking in-app notification if patient or doctor
  if (patientId) {
    createNotificationService({
      recipient: patientId,
      recipientModel: "Patient",
      title: `🎫 Support Ticket Received #${ticketId}`,
      message: `Your request regarding "${ticket.subject}" has been received. Ticket ID: ${ticketId}.`,
      type: "SUPPORT",
      link: "/patient/support",
    }).catch(() => {});
  } else if (doctorId) {
    createNotificationService({
      recipient: doctorId,
      recipientModel: "Doctor",
      title: `🎫 Support Ticket Received #${ticketId}`,
      message: `Your clinical support request #${ticketId} has been logged.`,
      type: "SUPPORT",
      link: "/doctor/support",
    }).catch(() => {});
  }

  return ticket;
};

/**
 * Get tickets submitted by current user
 */
export const getMySupportTicketsService = async (user, userType = "Patient") => {
  const filter = {};

  if (userType === "Doctor" || user?.role === "doctor") {
    filter.$or = [{ doctor: user._id }, { email: user.email?.toLowerCase() }];
  } else {
    filter.$or = [{ patient: user._id }, { email: user.email?.toLowerCase() }];
  }

  return SupportTicket.find(filter).sort({ createdAt: -1 });
};

/**
 * Admin: Get all support tickets with filters
 */
export const getAllSupportTicketsAdminService = async (query = {}) => {
  const filter = {};

  if (query.status && query.status !== "ALL") {
    filter.status = query.status;
  }
  if (query.senderType && query.senderType !== "ALL") {
    filter.senderType = query.senderType;
  }
  if (query.priority && query.priority !== "ALL") {
    filter.priority = query.priority;
  }
  if (query.category && query.category !== "ALL") {
    filter.category = query.category;
  }

  if (query.search) {
    const q = String(query.search).trim();
    filter.$or = [
      { ticketId: { $regex: q, $options: "i" } },
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { subject: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }

  const tickets = await SupportTicket.find(filter)
    .populate("patient", "firstName lastName email phone")
    .populate("doctor", "firstName lastName email phone specialization")
    .populate("resolvedBy", "name email")
    .sort({ createdAt: -1 });

  const total = await SupportTicket.countDocuments();
  const openCount = await SupportTicket.countDocuments({ status: "OPEN" });
  const inProgressCount = await SupportTicket.countDocuments({ status: "IN_PROGRESS" });
  const solvedCount = await SupportTicket.countDocuments({ status: "SOLVED" });

  return {
    tickets,
    counts: {
      total,
      open: openCount,
      inProgress: inProgressCount,
      solved: solvedCount,
    },
  };
};

/**
 * Admin: Update ticket status (e.g. mark as SOLVED), notes & response
 */
export const updateSupportTicketAdminService = async (ticketId, updateData, adminUser) => {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw AppError.notFound("Support ticket not found.");

  const prevStatus = ticket.status;

  if (updateData.status !== undefined) {
    ticket.status = updateData.status;
    if (updateData.status === "SOLVED" && prevStatus !== "SOLVED") {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = adminUser?._id || null;
    }
  }

  if (updateData.priority !== undefined) {
    ticket.priority = updateData.priority;
  }
  if (updateData.adminResponse !== undefined) {
    ticket.adminResponse = String(updateData.adminResponse).trim();
  }
  if (updateData.adminNotes !== undefined) {
    ticket.adminNotes = String(updateData.adminNotes).trim();
  }

  await ticket.save();

  // If newly marked as SOLVED, send resolution email!
  if (ticket.status === "SOLVED" && prevStatus !== "SOLVED") {
    sendSupportTicketResolvedEmail({
      email: ticket.email,
      name: ticket.name,
      ticketId: ticket.ticketId,
      subject: ticket.subject,
      adminResponse: ticket.adminResponse,
      resolvedAt: ticket.resolvedAt,
    }).catch(() => {});

    // In-app notification
    if (ticket.patient) {
      createNotificationService({
        recipient: ticket.patient,
        recipientModel: "Patient",
        title: `✅ Support Ticket #${ticket.ticketId} Solved`,
        message: `Your issue regarding "${ticket.subject}" has been marked as solved.`,
        type: "SUPPORT",
        link: "/patient/support",
      }).catch(() => {});
    } else if (ticket.doctor) {
      createNotificationService({
        recipient: ticket.doctor,
        recipientModel: "Doctor",
        title: `✅ Support Ticket #${ticket.ticketId} Solved`,
        message: `Your clinical support ticket #${ticket.ticketId} has been resolved.`,
        type: "SUPPORT",
        link: "/doctor/support",
      }).catch(() => {});
    }
  }

  return ticket.populate([
    { path: "patient", select: "firstName lastName email phone" },
    { path: "doctor", select: "firstName lastName email phone specialization" },
    { path: "resolvedBy", select: "name email" },
  ]);
};

/**
 * Admin: Delete a support ticket
 */
export const deleteSupportTicketAdminService = async (ticketId) => {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw AppError.notFound("Support ticket not found.");

  await SupportTicket.findByIdAndDelete(ticketId);
  return { success: true, message: "Support ticket deleted successfully." };
};
