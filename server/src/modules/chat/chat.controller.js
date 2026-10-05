import { getMessages } from "./chat.service.js";
import Appointment from "../../appointments/appointment.model.js";
import { assertAppointmentParticipant } from "../../shared/middleware/authenticateDoctorOrPatient.js";

export const getChatMessages = async (req, res) => {

  try {

    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId).select("doctor patient");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    assertAppointmentParticipant(appointment, req);

    const messages = await getMessages(
      appointmentId
    );

    res.status(200).json({

      success: true,

      data: messages,

    });

  } catch (error) {

    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Unable to load chat.",

    });

  }

};