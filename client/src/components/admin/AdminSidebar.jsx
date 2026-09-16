import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Pill,
  ShoppingBag,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  Tag,
  Gift,
  LifeBuoy,
  ShieldCheck,
  User,
  Settings,
} from "lucide-react";

const allNavItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["SuperAdmin", "Admin", "CustomerSupport"],
  },
  {
    label: "Support Desk",
    path: "/admin/support",
    icon: LifeBuoy,
    roles: ["SuperAdmin", "Admin", "CustomerSupport"],
  },
  {
    label: "Pharmacy Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
    roles: ["SuperAdmin", "Admin", "CustomerSupport"],
  },
  {
    label: "Patients",
    path: "/admin/patients",
    icon: Users,
    roles: ["SuperAdmin", "Admin", "CustomerSupport"],
  },
  {
    label: "Consultations",
    path: "/admin/appointments",
    icon: Calendar,
    roles: ["SuperAdmin", "Admin", "CustomerSupport"],
  },
  {
    label: "Doctors",
    path: "/admin/doctors",
    icon: Stethoscope,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    label: "Pharmacy Stock",
    path: "/admin/pharmacy",
    icon: Pill,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    label: "Specializations",
    path: "/admin/specializations",
    icon: Activity,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    label: "Coupons",
    path: "/admin/coupons",
    icon: Tag,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    label: "Gift Cards",
    path: "/admin/gift-cards",
    icon: Gift,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    label: "Admin Team",
    path: "/admin/users",
    icon: ShieldCheck,
    roles: ["SuperAdmin", "Admin"],
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
    roles: ["SuperAdmin"],
  },
  {
    label: "My Profile",
    path: "/admin/profile",
    icon: User,
    roles: ["SuperAdmin", "Admin", "CustomerSupport"],
  },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
  const userRole = currentAdmin.role || "SuperAdmin";

  const visibleNavItems = allNavItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 sticky top-0 h-screen shrink-0 z-40 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 shrink-0 flex items-center justify-between px-5 border-b border-slate-100">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>🏥</span> TeleClinic
            </h1>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider block ${
                userRole === "CustomerSupport"
                  ? "text-emerald-600"
                  : "text-indigo-600"
              }`}
            >
              {userRole === "CustomerSupport" ? "Customer Support" : "Admin Portal"}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button (Always pinned at bottom of screen) */}
      <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
