/**
 * Appointment status constants.
 *
 * Single source of truth — used in the Appointment model,
 * validation schemas, and service logic.
 */
export const APPOINTMENT_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
};

export const ALL_APPOINTMENT_STATUSES = Object.values(APPOINTMENT_STATUS);

/**
 * Statuses that count as "active" (occupy a slot).
 */
export const ACTIVE_STATUSES = [
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.CONFIRMED,
  APPOINTMENT_STATUS.IN_PROGRESS,
];
