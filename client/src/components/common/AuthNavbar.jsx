import { Link, useLocation } from "react-router-dom";
import { Stethoscope, ArrowLeft, Users, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AuthNavbar() {
  const location = useLocation();
  const path = location.pathname;

  const isDoctor = path.startsWith("/doctor");
  const isAdmin = path.startsWith("/admin");
  const isPatient = !isDoctor && !isAdmin;

  const getPortalInfo = () => {
    if (isAdmin) {
      return {
        name: "Admin Portal",
        badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Shield,
      };
    }
    if (isDoctor) {
      return {
        name: "Doctor Portal",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: Stethoscope,
      };
    }
    return {
      name: "Patient Portal",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: User,
    };
  };

  const portal = getPortalInfo();
  const Icon = portal.icon;

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: Logo & Active Portal Badge */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              TeleClinic
            </span>
          </Link>

          <Badge
            variant="outline"
            className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg border ${portal.badgeColor}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {portal.name}
          </Badge>
        </div>

        {/* Center: Portal Switchers */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 text-xs font-medium">
          <Link
            to="/patient/login"
            className={`px-3 py-1.5 rounded-lg transition-all ${
              isPatient
                ? "bg-white text-blue-700 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Patient
          </Link>
          <Link
            to="/doctor/login"
            className={`px-3 py-1.5 rounded-lg transition-all ${
              isDoctor
                ? "bg-white text-emerald-700 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Doctor
          </Link>
          <Link
            to="/admin/login"
            className={`px-3 py-1.5 rounded-lg transition-all ${
              isAdmin
                ? "bg-white text-purple-700 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Right: Return Home Action */}
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
