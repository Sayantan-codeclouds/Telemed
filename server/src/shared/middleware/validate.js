/**
 * Reusable Zod validation middleware.
 *
 * Usage:
 *   import validate from "../shared/middleware/validate.js";
 *   router.post("/", validate(createSchema), controller);
 *
 * Validates req.body against the provided Zod schema.
 * On success, replaces req.body with the parsed (cleaned) data.
 * On failure, passes the ZodError to the global error handler.
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export default validate;
