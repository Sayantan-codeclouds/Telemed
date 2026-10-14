/**
 * Which admin roles may open each admin page. Used by the sidebar (to show
 * links) and by AdminLayout (to block direct URL access). The server enforces
 * the same rules on its API routes; this only keeps the UI consistent.
 */
const ALL = ["SuperAdmin", "Admin", "CustomerSupport"];
const MANAGERS = ["SuperAdmin", "Admin"];

export const ADMIN_PAGE_ROLES = {
  "/admin/dashboard": ALL,
  "/admin/support": ALL,
  "/admin/orders": ALL,
  "/admin/patients": ALL,
  "/admin/appointments": ALL,
  "/admin/profile": ALL,
  "/admin/doctors": MANAGERS,
  "/admin/payouts": MANAGERS,
  "/admin/pharmacy": MANAGERS,
  "/admin/specializations": MANAGERS,
  "/admin/coupons": MANAGERS,
  "/admin/gift-cards": MANAGERS,
  "/admin/users": MANAGERS,
  "/admin/settings": ["SuperAdmin"],
  "/admin/audit-log": ["SuperAdmin"],
};

/** Current admin's role; an unknown or missing role gets the least privilege. */
export const getCurrentAdminRole = () => {
  try {
    const role = JSON.parse(localStorage.getItem("admin") || "{}").role;
    return ALL.includes(role) ? role : "CustomerSupport";
  } catch {
    return "CustomerSupport";
  }
};

/** Whether the role may open the page at `pathname` (unlisted paths are allowed). */
export const canAccessAdminPath = (pathname, role = getCurrentAdminRole()) => {
  const normalized = pathname.replace(/\/+$/, "");
  const roles = ADMIN_PAGE_ROLES[normalized];
  return !roles || roles.includes(role);
};
