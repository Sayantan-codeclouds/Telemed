/**
 * User role constants.
 *
 * Single source of truth for all role identifiers
 * used in JWT payloads, middleware, and authorization checks.
 */
export const ROLES = {
  PATIENT: "Patient",
  DOCTOR: "Doctor",
  ADMIN: "Admin",
  RECEPTIONIST: "Receptionist",
  PHARMACY_MANAGER: "PharmacyManager",
  CUSTOMER_SERVICE: "CustomerService",
};

export const ALL_ROLES = Object.values(ROLES);
