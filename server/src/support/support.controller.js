import {
  createSupportTicketService,
  getMySupportTicketsService,
  getAllSupportTicketsAdminService,
  updateSupportTicketAdminService,
  deleteSupportTicketAdminService,
} from "./support.service.js";

export const submitSupportTicket = async (req, res, next) => {
  try {
    const userType = req.patient ? "Patient" : req.doctor ? "Doctor" : req.admin ? "Admin" : "Guest";
    const user = req.patient || req.doctor || req.admin || null;

    const ticket = await createSupportTicketService(req.body, user, userType);

    return res.status(201).json({
      success: true,
      message: `Support ticket #${ticket.ticketId} submitted successfully. Confirmation email sent to ${ticket.email}.`,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getMySupportTickets = async (req, res, next) => {
  try {
    const userType = req.doctor ? "Doctor" : "Patient";
    const user = req.doctor || req.patient;

    const tickets = await getMySupportTicketsService(user, userType);

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSupportTicketsAdmin = async (req, res, next) => {
  try {
    const result = await getAllSupportTicketsAdminService(req.query);

    return res.status(200).json({
      success: true,
      data: result.tickets,
      counts: result.counts,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupportTicketAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await updateSupportTicketAdminService(id, req.body, req.admin);

    return res.status(200).json({
      success: true,
      message: `Ticket #${ticket.ticketId} updated successfully.`,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupportTicketAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteSupportTicketAdminService(id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
