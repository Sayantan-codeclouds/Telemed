import {
  createAppointment,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  endConsultationService,
  cancelPatientAppointment,
  reschedulePatientAppointment,
  updateDoctorNotes,
  updatePrescription,
  updateAISummary,
} from "./appointment.service.js";

import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  updateDoctorNotesSchema,
  updatePrescriptionSchema,
  updateAISummarySchema,
} from "./appointment.validation.js";

// ========================================
// Patient - Book Appointment
// ========================================

export const bookAppointment = async (req, res) => {
  try {
    const data = createAppointmentSchema.parse(req.body);

    const appointment = await createAppointment(
      req.patient._id,
      data
    );

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully.",
      data: appointment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Get Single Appointment
// ========================================

export const getAppointment = async (req, res) => {
  try {
    const appointment = await getAppointmentById(
      req.params.id
    );

    return res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Patient Appointments
// ========================================

export const getMyAppointments = async (
  req,
  res
) => {
  try {
    const appointments =
      await getPatientAppointments(
        req.patient._id
      );

    return res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelMyAppointment = async (req, res) => {
  try {
    const appointment = await cancelPatientAppointment(
      req.params.id,
      req.patient._id
    );

    return res.json({
      success: true,
      message: "Appointment cancelled successfully.",
      data: appointment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const rescheduleMyAppointment = async (req, res) => {
  try {
    const { newDate, newSlot, reason } = req.body;
    const appointment = await reschedulePatientAppointment(
      req.params.id,
      req.patient._id,
      { newDate, newSlot, reason }
    );

    return res.json({
      success: true,
      message: "Appointment rescheduled successfully.",
      data: appointment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Doctor Appointments
// ========================================

export const getDoctorAppointmentList =
  async (req, res) => {
    try {
      const appointments =
        await getDoctorAppointments(
          req.doctor._id
        );

      return res.json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// ========================================
// Update Status
// ========================================

export const changeAppointmentStatus =
  async (req, res) => {
    try {
      const { status } =
        updateAppointmentStatusSchema.parse(
          req.body
        );

      const appointment =
        await updateAppointmentStatus(
          req.params.id,
          status
        );

      return res.json({
        success: true,
        message: "Appointment updated.",
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// ========================================
// End Consultation (Doctor or Patient)
// ========================================

export const endConsultation = async (req, res) => {
  try {
    const userId = req.doctor?._id || req.patient?._id || req.consultationUser?.id;
    const userType = req.doctor ? "DOCTOR" : (req.patient ? "PATIENT" : req.consultationUser?.type);

    if (!userId || !userType) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to end consultation.",
      });
    }

    const appointment = await endConsultationService(
      req.params.id,
      userId,
      userType
    );

    return res.json({
      success: true,
      message: "Consultation marked as COMPLETED successfully.",
      data: appointment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Doctor Notes
// ========================================

export const saveDoctorNotes = async (
  req,
  res
) => {
  try {
    const { doctorNotes } =
      updateDoctorNotesSchema.parse(
        req.body
      );

    const appointment =
      await updateDoctorNotes(
        req.params.id,
        doctorNotes
      );

    return res.json({
      success: true,
      message: "Notes updated.",
      data: appointment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Prescription
// ========================================

export const savePrescription =
  async (req, res) => {
    try {
      const { prescription } =
        updatePrescriptionSchema.parse(
          req.body
        );

      const appointment =
        await updatePrescription(
          req.params.id,
          prescription
        );

      return res.json({
        success: true,
        message: "Prescription updated.",
        data: appointment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// ========================================
// AI Summary
// ========================================

export const saveAISummary = async (
  req,
  res
) => {
  try {
    const { aiSummary } =
      updateAISummarySchema.parse(
        req.body
      );

    const appointment =
      await updateAISummary(
        req.params.id,
        aiSummary
      );

    return res.json({
      success: true,
      message: "AI Summary updated.",
      data: appointment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};