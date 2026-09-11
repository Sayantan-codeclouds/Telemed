import { getMessages } from "./chat.service.js";

export const getChatMessages = async (req, res) => {

  try {

    const { appointmentId } = req.params;

    const messages = await getMessages(
      appointmentId
    );

    res.status(200).json({

      success: true,

      data: messages,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Unable to load chat.",

    });

  }

};