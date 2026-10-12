import escapeRegex from "../shared/utils/escapeRegex.js";

/**
 * Shared helpers for the admin list pages (patients, doctors, appointments,
 * orders): server-side paging, search, filters, sorting and chip counts.
 */

export const MAX_PAGE_SIZE = 200;

/** Reads ?page, ?limit and ?search. Returns null when ?page is absent (full list mode). */
export const parseListQuery = (query = {}) => {
  if (query.page === undefined) return null;
  const limit = Math.min(Math.max(Number(query.limit) || 25, 1), MAX_PAGE_SIZE);
  const page = Math.max(Number(query.page) || 1, 1);
  const search = typeof query.search === "string" ? query.search.trim().slice(0, 100) : "";
  return { page, limit, skip: (page - 1) * limit, search };
};

/**
 * Case-insensitive search where every word must match at least one field,
 * so "john smith" finds firstName "John" + lastName "Smith".
 */
export const buildTokenSearch = (term, fields) => {
  const tokens = String(term || "").split(/\s+/).filter(Boolean);
  if (tokens.length === 0 || fields.length === 0) return null;
  return {
    $and: tokens.map((token) => ({
      $or: fields.map((field) => ({ [field]: { $regex: escapeRegex(token), $options: "i" } })),
    })),
  };
};

/** Exact, case-insensitive match for a filter value (e.g. gender, specialization). */
export const equalsIgnoreCase = (value) => ({ $regex: `^${escapeRegex(value)}$`, $options: "i" });

/** Combines filter fragments with $and, skipping empty ones. */
export const andFilters = (...parts) => {
  const present = parts.filter((part) => part && Object.keys(part).length > 0);
  if (present.length === 0) return {};
  if (present.length === 1) return present[0];
  return { $and: present };
};

/** Case-insensitive ordering for name sorts. */
export const NAME_COLLATION = { locale: "en", strength: 2 };

/** { [value]: count } for one field over `filter` (missing values grouped under "null"). */
export const countByField = async (model, filter, field) => {
  const rows = await model.aggregate([{ $match: filter }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((row) => [String(row._id), row.count]));
};

/** Standard paged response body. */
export const pagedBody = (items, { page, limit }, total, counts = undefined) => ({
  success: true,
  data: items,
  pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  ...(counts && { counts }),
});
