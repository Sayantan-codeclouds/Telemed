import AppError from "./AppError.js";

/**
 * Global Express error-handling middleware.
 *
 * Catches:
 *  - AppError (operational errors with status codes)
 *  - Zod validation errors
 *  - Mongoose validation / cast / duplicate-key errors
 *  - Unknown / unexpected errors
 *
 * Always returns a consistent JSON shape:
 *   { success: false, message, errors? }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {

  // ---- AppError (our own) ----
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // ---- Zod validation errors ----
  if (err.name === "ZodError" || err?.issues) {
    const messages = (err.issues || err.errors || [])
      .map((issue) => issue.message)
      .join(", ");

    return res.status(400).json({
      success: false,
      message: messages || "Validation failed.",
      errors: err.issues || err.errors,
    });
  }

  // ---- Mongoose validation error ----
  if (err.name === "ValidationError" && err.errors) {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");

    return res.status(400).json({
      success: false,
      message: messages,
    });
  }

  // ---- Mongoose CastError (invalid ObjectId etc.) ----
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // ---- Mongoose duplicate key (code 11000) ----
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      message: field
        ? `${field} already exists.`
        : "Duplicate entry.",
    });
  }

  // ---- Multer errors ----
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // ---- JWT errors ----
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired.",
    });
  }

  // ---- Unknown error ----
  console.error("Unhandled Error:", err);

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : err.message || "Something went wrong.",
  });
};

export default errorHandler;
