/**
 * Custom application error class.
 *
 * Provides a consistent way to throw errors with HTTP status codes
 * throughout the application. These are caught by the global
 * error handler middleware.
 */
export default class AppError extends Error {
  /**
   * @param {string} message — User-facing error message
   * @param {number} statusCode — HTTP status code (default 400)
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // --- Factory methods for common errors ---

  static badRequest(message = "Bad request.") {
    return new AppError(message, 400);
  }

  static unauthorized(message = "Unauthorized.") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden.") {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource not found.") {
    return new AppError(message, 404);
  }

  static conflict(message = "Conflict.") {
    return new AppError(message, 409);
  }

  static tooMany(message = "Too many requests.") {
    return new AppError(message, 429);
  }

  static internal(message = "Internal server error.") {
    return new AppError(message, 500);
  }
}
