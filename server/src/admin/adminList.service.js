import Patient from "../patients/patient.model.js";
import Doctor from "../doctors/doctor.model.js";
import Appointment from "../appointments/appointment.model.js";
import { Order } from "../pharmacy/pharmacy.model.js";
import { syncPaidAppointmentsToOrders } from "../pharmacy/pharmacy.service.js";
import { formatAppointmentProfileImages } from "../shared/utils/fileUrl.js";
import escapeRegex from "../shared/utils/escapeRegex.js";
import {
  buildTokenSearch,
  equalsIgnoreCase,
  andFilters,
  NAME_COLLATION,
  countByField,
  pagedBody,
} from "./adminList.js";

const PRIVATE_USER_FIELDS =
  "-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordTokenExpires";

const NAME_SORTS = {
  "name-asc": { firstName: 1, lastName: 1, _id: 1 },
  "name-desc": { firstName: -1, lastName: -1, _id: -1 },
};
const DATE_SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
};

/** Runs the page query with the right sort (and collation for name sorts). */
const findPage = (model, filter, sortKey, extraSorts, paging) => {
  const sort = NAME_SORTS[sortKey] || extraSorts[sortKey] || DATE_SORTS[sortKey] || DATE_SORTS.newest;
  const query = model.find(filter).sort(sort).skip(paging.skip).limit(paging.limit);
  if (NAME_SORTS[sortKey]) query.collation(NAME_COLLATION);
  return query;
};

/** Ids of users whose name (and optional extra fields) match every search word. */
const matchingUserIds = async (model, term, extraFields = []) => {
  const filter = buildTokenSearch(term, ["firstName", "lastName", ...extraFields]);
  if (!filter) return [];
  const users = await model.find(filter).select("_id").limit(1000).lean();
  return users.map((u) => u._id);
};

/* ---------------- Patients ---------------- */

export const listPatientsAdmin = async (paging, { status, gender, sort } = {}) => {
  const base = { deletedAt: null };
  const filter = andFilters(
    base,
    buildTokenSearch(paging.search, ["firstName", "lastName", "email", "phone"]),
    status === "ACTIVE" ? { status: "ACTIVE" } : status === "INACTIVE" ? { status: { $ne: "ACTIVE" } } : null,
    gender && gender !== "ALL" ? { gender: equalsIgnoreCase(gender) } : null
  );

  const [items, total, all, active] = await Promise.all([
    findPage(Patient, filter, sort, {}, paging).select(PRIVATE_USER_FIELDS),
    Patient.countDocuments(filter),
    Patient.countDocuments(base),
    Patient.countDocuments({ ...base, status: "ACTIVE" }),
  ]);

  return pagedBody(items, paging, total, { all, active, inactive: all - active });
};

/* ---------------- Doctors ---------------- */

const DOCTOR_STATUS_FILTERS = {
  ACTIVE: { status: "ACTIVE" },
  INACTIVE: { status: { $ne: "ACTIVE" } },
  PENDING_APPROVAL: { status: "PENDING_APPROVAL" },
};

export const listDoctorsAdmin = async (paging, { status, specialization, sort } = {}) => {
  const base = { deletedAt: null };
  const filter = andFilters(
    base,
    buildTokenSearch(paging.search, ["firstName", "lastName", "email", "specialization", "hospital"]),
    DOCTOR_STATUS_FILTERS[status] || null,
    specialization && specialization !== "ALL" ? { specialization: equalsIgnoreCase(specialization) } : null
  );

  const feeSorts = { "fee-desc": { consultationFee: -1, _id: -1 }, "fee-asc": { consultationFee: 1, _id: 1 } };
  const [items, total, all, byStatus] = await Promise.all([
    findPage(Doctor, filter, sort, feeSorts, paging).select(`${PRIVATE_USER_FIELDS} -payoutSettings`),
    Doctor.countDocuments(filter),
    Doctor.countDocuments(base),
    countByField(Doctor, base, "status"),
  ]);

  const active = byStatus.ACTIVE || 0;
  return pagedBody(items, paging, total, {
    all,
    active,
    inactive: all - active,
    pending: byStatus.PENDING_APPROVAL || 0,
  });
};

/* ---------------- Appointments ---------------- */

export const listAppointmentsAdmin = async (paging, { status, sort } = {}) => {
  let searchFilter = null;
  if (paging.search) {
    const [patientIds, doctorIds] = await Promise.all([
      matchingUserIds(Patient, paging.search),
      matchingUserIds(Doctor, paging.search, ["specialization"]),
    ]);
    const whole = { $regex: escapeRegex(paging.search), $options: "i" };
    searchFilter = {
      $or: [{ patient: { $in: patientIds } }, { doctor: { $in: doctorIds } }, { reason: whole }, { status: whole }],
    };
  }

  const filter = andFilters(searchFilter, status && status !== "ALL" ? { status } : null);
  const extraSorts = {
    "appt-date-asc": { appointmentDate: 1, _id: 1 },
    "appt-date-desc": { appointmentDate: -1, _id: -1 },
    "fee-desc": { consultationFee: -1, _id: -1 },
    "fee-asc": { consultationFee: 1, _id: 1 },
  };

  const [items, total, all, byStatus] = await Promise.all([
    findPage(Appointment, filter, sort, extraSorts, paging)
      .populate("patient", "firstName lastName email profileImage phone")
      .populate("doctor", "firstName lastName email specialization profileImage hospital"),
    Appointment.countDocuments(filter),
    Appointment.countDocuments({}),
    countByField(Appointment, {}, "status"),
  ]);

  return pagedBody(items.map(formatAppointmentProfileImages), paging, total, { all, byStatus });
};

/* ---------------- Orders ---------------- */

export const listOrdersAdmin = async (paging, { status, type } = {}) => {
  await syncPaidAppointmentsToOrders();

  let searchFilter = null;
  if (paging.search) {
    const patientIds = await matchingUserIds(Patient, paging.search, ["email", "phone"]);
    const term = escapeRegex(paging.search);
    searchFilter = {
      $or: [
        { patient: { $in: patientIds } },
        { vrioOrderId: { $regex: term, $options: "i" } },
        { stickyCrmOrderId: { $regex: term, $options: "i" } },
        // Partial order-id search, as the page allowed before.
        { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: term, options: "i" } } },
      ],
    };
  }

  // Orders predating the consultation flow have no orderType: they count as PHARMACY.
  const typeFilter =
    type === "CONSULTATION" ? { orderType: "CONSULTATION" } : type === "PHARMACY" ? { orderType: { $in: ["PHARMACY", null] } } : null;

  const filter = andFilters(searchFilter, status && status !== "ALL" ? { status } : null, typeFilter);

  const [items, total, all, byStatus, consultation, revenueRows] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(paging.skip)
      .limit(paging.limit)
      .populate("patient", "firstName lastName email phone")
      .populate("doctor", "firstName lastName specialization profileImage hospital")
      .populate("appointment", "appointmentDate slot reason roomId status")
      .populate("prescription", "diagnosis medicines doctor"),
    Order.countDocuments(filter),
    Order.countDocuments({}),
    countByField(Order, {}, "status"),
    Order.countDocuments({ orderType: "CONSULTATION" }),
    Order.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  return pagedBody(items, paging, total, {
    all,
    byStatus,
    byType: { ALL: all, CONSULTATION: consultation, PHARMACY: all - consultation },
    // Revenue across all non-cancelled orders (shown in the page header).
    revenue: revenueRows[0]?.total || 0,
  });
};
