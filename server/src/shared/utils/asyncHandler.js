/**
 * Async handler wrapper for Express route handlers.
 *
 * Eliminates repetitive try/catch blocks in controllers.
 * Any thrown error is automatically forwarded to the
 * global error handler middleware.
 *
 * Usage:
 *   import asyncHandler from "../shared/utils/asyncHandler.js";
 *
 *   export const getProfile = asyncHandler(async (req, res) => {
 *     const user = await findUser(req.user.id);
 *     res.json({ success: true, data: user });
 *   });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
