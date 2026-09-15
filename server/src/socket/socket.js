import { Server } from "socket.io";
import consultationSocket from "./consultation.socket.js";
import chatSocket from "./chat.socket.js";

let io;

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