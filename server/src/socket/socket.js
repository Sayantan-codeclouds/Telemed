import { Server } from "socket.io";
import consultationSocket from "./consultation.socket.js";
import chatSocket from "./chat.socket.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    console.log("Socket Connected:", socket.id);

    // Register consultation events
    consultationSocket(io, socket);

    chatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket Disconnected:", socket.id); 
    });

  });

};

export const getIO = () => io;