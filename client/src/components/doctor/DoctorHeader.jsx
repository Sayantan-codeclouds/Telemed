import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  CalendarDays,
  Clock,
  Sparkles,
  Stethoscope,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import NotificationBell from "../common/NotificationBell";
import { Badge } from "@/components/ui/badge";

export default function DoctorHeader() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const doctor = (() => {
    try {
      const raw = localStorage.getItem("doctor");
      if (!raw || raw === "undefined") return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  })();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctor");
    navigate("/doctor/login");
  };

  return (
    <header className="bg-white border-b border-slate-200/80 h-20 px-6 sm:px-8 flex justify-between items-center sticky top-0 z-30 shadow-xs">
      {/* Left: Welcome & Context */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome, Dr. {doctor?.firstName || "Doctor"}
            </h2>
            <Badge
              variant="secondary"
              className="hidden md:inline-flex bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Available
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <span>{today}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline font-medium text-emerald-700">
              {doctor?.specialization || "TeleClinic Physician"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Search, Notifications & Doctor Profile Dropdown */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search patients, appointments..."
            className="pl-10 pr-4 py-2 bg-slate-100/80 rounded-xl text-xs w-64 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition"
          />
        </div>

        {/* Notifications */}
        <NotificationBell role="doctor" />

        {/* Doctor Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100/80 transition"
          >
            <img
              src={
                doctor?.profileImage ||
                `https://ui-avatars.com/api/?name=${doctor?.firstName || "Doctor"}+${doctor?.lastName || ""}&background=16a34a&color=ffffff`
              }
              alt="Doctor Avatar"
              className="w-10 h-10 rounded-xl object-cover border border-emerald-100 shadow-xs"
            />
            <div className="text-left hidden lg:block">
              <h4 className="text-xs font-bold text-gray-900 leading-tight">
                Dr. {doctor?.firstName} {doctor?.lastName}
              </h4>
              <p className="text-[10px] text-slate-500">
                {doctor?.specialization || "Doctor Portal"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in-50 zoom-in-95"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                <p className="text-xs font-bold text-gray-900">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </p>
                <p className="text-[10px] text-slate-500">{doctor?.email}</p>
              </div>

              <Link
                to="/doctor/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-slate-50 transition"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/doctor/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-slate-50 transition"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </Link>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}