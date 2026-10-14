// Security smoke tests that need no database: endpoints that must reject
// anonymous callers, NoSQL-operator tokens, the login rate limit, and
// unauthenticated sockets.
import http from "http";
import { io as connectSocket } from "socket.io-client";
import { load, createChecks } from "./helpers/harness.js";

const { check, report } = createChecks();

process.env.JWT_SECRET = "smoke-secret";
const { default: app } = await load("app.js");
const { initializeSocket, getIO } = await load("socket/socket.js");

const server = http.createServer(app);
initializeSocket(server);
await new Promise((resolve) => server.listen(0, resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const base = `${origin}/api`;
const id = "6650f0f0f0f0f0f0f0f0f0f0";

const status = async (method, path, body) =>
  (await fetch(base + path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined })).status;

const expectations = [
  ["GET", `/appointments/${id}`, null, 401],
  ["GET", `/chat/${id}`, null, 401],
  ["GET", `/prescriptions/appointment/${id}`, null, 401],
  ["POST", "/prescriptions/check-reminders", null, 401],
  ["POST", "/ai/consultation-summary", { appointmentId: id }, 401],
  ["POST", "/ai/health-advice", { message: "hi" }, 401],
  ["POST", "/ai/receptionist-intake", {}, 401],
  ["POST", "/coupons/vrio-validate", {}, 401],
  ["PATCH", `/admin/payouts/${id}/status`, { status: "PAID" }, 401],
  ["POST", "/patients/reset-password", { token: { $ne: null }, password: "x".repeat(10) }, 400],
  ["POST", "/doctors/reset-password", { token: { $ne: null }, password: "x".repeat(10) }, 400],
  ["POST", "/patients/verify-email", { token: { $ne: null } }, 400],
  ["POST", "/doctors/verify-email", { token: { $gt: "" } }, 400],
];
for (const [method, path, body, expected] of expectations) {
  const got = await status(method, path, body);
  check(`${method} ${path} -> ${expected}`, got === expected, `got ${got}`);
}

// Admin login allows 20 attempts per 15 minutes; the 21st is rate limited.
let last;
for (let i = 0; i < 21; i++) last = await status("POST", "/admin/login", {});
check("21st admin login attempt is rate limited (429)", last === 429, `got ${last}`);

const trySocket = (auth) =>
  new Promise((resolve) => {
    const socket = connectSocket(origin, { transports: ["websocket"], reconnection: false, ...(auth && { auth }) });
    socket.on("connect", () => {
      socket.close();
      resolve("connected");
    });
    socket.on("connect_error", (err) => {
      socket.close();
      resolve(`refused: ${err.message}`);
    });
  });
check("socket without a token is refused", (await trySocket(null)).startsWith("refused"));
check("socket with an invalid token is refused", (await trySocket({ token: "garbage" })).startsWith("refused"));

await new Promise((resolve) => getIO().close(() => resolve()));
server.close();
report();
