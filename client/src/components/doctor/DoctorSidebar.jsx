import {
  LayoutDashboard,
  CalendarDays,
  Clock3,
  Users,
  User,
  Settings,
  LogOut,
  Stethoscope,
  FileText,
  LifeBuoy,
  Wallet,
} from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";

export default function DoctorSidebar() {
  const navigate = useNavigate();
  const doctor = (() => {
    try {
      const raw = localStorage.getItem("doctor");
      if (!raw || raw === "undefined") return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctor");
    navigate("/doctor/login");
  };

  const menu = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/doctor/dashboard",
    },
    {
      title: "Appointments",
      icon: CalendarDays,
      path: "/doctor/appointments",
    },
    {
      title: "Earnings & Payouts",
      icon: Wallet,
      path: "/doctor/earnings",
    },
    {
      title: "Availability",
      icon: Clock3,
      path: "/doctor/availability",
    },
    {
      title: "My Patients",
      icon: Users,
      path: "/doctor/patients",
    },
    {
      title: "Doctor Profile",
      icon: User,
      path: "/doctor/profile",
    },
    {
      title: "Prescriptions",
      icon: FileText,
      path: "/doctor/prescriptions",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/doctor/settings",
    },
    {
      title: "Help & Support",
      icon: LifeBuoy,
      path: "/doctor/support",
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">
                TeleClinic
              </h1>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                Doctor Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Doctor Profile Card */}
        <div className="p-6 border-b border-slate-100/80 bg-slate-50/50">
          <img
            src={
              doctor?.profileImage ||
              `https://ui-avatars.com/api/?name=${doctor?.firstName || "Doctor"}+${doctor?.lastName || ""}&background=16a34a&color=ffffff`
            }
            alt="Doctor Profile"
            className="w-16 h-16 rounded-2xl mx-auto object-cover shadow-sm border-2 border-white"
          />
          <h2 className="mt-3 text-center font-bold text-sm text-gray-900">
            Dr. {doctor?.firstName || "Doctor"} {doctor?.lastName || ""}
          </h2>
          <p className="text-center text-emerald-700 text-xs font-medium mt-0.5">
            {doctor?.specialization || "General Physician"}
          </p>
          <p className="text-center text-slate-400 text-[11px] truncate mt-0.5">
            {doctor?.email}
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}