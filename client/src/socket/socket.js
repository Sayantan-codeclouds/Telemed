import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// The server rejects unauthenticated sockets. Pick the token for the area of
// the app we're in; this runs on every (re)connect so it stays current.
const getSocketToken = () => {
  const path = window.location.pathname;
  if (path.startsWith("/doctor")) return localStorage.getItem("doctorToken");
  if (path.startsWith("/admin")) return localStorage.getItem("adminToken");
  return localStorage.getItem("patientToken");
};

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: (cb) => cb({ token: getSocketToken() }),
});

export default socket;
