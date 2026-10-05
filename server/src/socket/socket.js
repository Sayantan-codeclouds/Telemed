import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import consultationSocket from "./consultation.socket.js";
import chatSocket from "./chat.socket.js";
import Doctor from "../doctors/doctor.model.js";
import Patient from "../patients/patient.model.js";
import Admin from "../admin/admin.model.js";

let io;

/** Private room every authenticated socket joins for its own notifications. */
export const userRoom = (userId) => `user:${userId}`;

/**
 * Resolves the socket's user from the JWT sent in the handshake
 * (`io(url, { auth: { token } })`). Connections without a valid,
 * active account are refused.
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string" || !token) {
      return next(new Error("Authentication required."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.doctorId) {
      const doctor = await Doctor.findById(decoded.doctorId).select("firstName lastName status");
      if (doctor && doctor.status === "ACTIVE") {
        socket.data.user = { id: String(doctor._id), type: "Doctor" };
        return next();
      }
    }

    if (decoded.patientId) {
      const patient = await Patient.findById(decoded.patientId).select("firstName lastName status");
      if (patient && patient.status !== "INACTIVE" && patient.status !== "BLOCKED") {
        socket.data.user = { id: String(patient._id), type: "Patient" };
        return next();
      }
    }

    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId).select("status tokenVersion");
      if (admin && admin.status === "ACTIVE" && (decoded.tv || 0) === (admin.tokenVersion || 0)) {
        socket.data.user = { id: String(admin._id), type: "Admin" };
        return next();
      }
    }

    return next(new Error("Authentication required."));
  } catch (error) {
    return next(new Error("Authentication required."));
  }
};

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow all frontend origins (Render, Netlify, Vercel, Localhost, Mobile)
        callback(null, true);
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    socket.join(userRoom(socket.data.user.id));

    // Register consultation events
    consultationSocket(io, socket);

    chatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket Disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;
