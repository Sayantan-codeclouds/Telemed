import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import connectDB from "./shared/db/connection.js";
import { initializeSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    // Initialize Socket.IO
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`
========================================
🚀 TeleClinic API Started
🌍 Environment : ${process.env.NODE_ENV || "development"}
📡 Port        : ${PORT}
========================================
`);
    });

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();