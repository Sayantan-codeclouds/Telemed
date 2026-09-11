import jwt from "jsonwebtoken";
import Admin from "./admin.model.js";

export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.adminId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    const admin = await Admin.findById(decoded.adminId);

    if (!admin || admin.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Admin not found or inactive.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

/**
 * Role-based access control guard
 * @param  {...string} allowedRoles - Permitted roles (e.g. "SuperAdmin", "Admin", "CustomerSupport")
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(", ")}]. Your current role is '${req.admin.role}'.`,
      });
    }

    next();
  };
};

