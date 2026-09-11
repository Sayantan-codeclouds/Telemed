import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../common/NotificationBell";
import { getProfileImageUrl } from "@/utils/imageUrl";

export default function AdminHeader() {
  const [admin, setAdmin] = useState(() =>
    JSON.parse(localStorage.getItem("admin") || "{}")
  );

  useEffect(() => {
    const handleStorage = () => {
      setAdmin(JSON.parse(localStorage.getItem("admin") || "{}"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Left — Mobile Context */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          🏥
        </div>
        <div>
          <span className="font-bold text-slate-900 text-sm">TeleClinic</span>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Admin</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        TeleClinic Global Network • Live
      </div>

      {/* Right — Admin info */}
      <div className="flex items-center gap-4">
        <NotificationBell role="admin" />

        <Link
          to="/admin/profile"
          className="flex items-center gap-3 hover:opacity-90 transition group cursor-pointer"
          title="Account & Security Profile"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {admin.firstName} {admin.lastName || "Admin"}
            </p>
            <div className="mt-0.5">
              {admin.role === "CustomerSupport" ? (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block">
                  Customer Support
                </span>
              ) : admin.role === "SuperAdmin" ? (
                <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block">
                  Super Admin
                </span>
              ) : (
                <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block">
                  Admin
                </span>
              )}
            </div>
          </div>

          <div
            className={`w-10 h-10 rounded-2xl overflow-hidden shadow-xs border border-slate-200 flex items-center justify-center text-white font-bold text-xs bg-gradient-to-tr ${
              admin.role === "CustomerSupport"
                ? "from-emerald-700 to-teal-900"
                : admin.role === "SuperAdmin"
                ? "from-slate-900 to-purple-900"
                : "from-slate-900 to-indigo-900"
            }`}
          >
            {admin.profileImage ? (
              <img
                src={getProfileImageUrl(admin.profileImage, `${admin.firstName} ${admin.lastName}`)}
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                {admin.firstName?.[0] || "A"}
                {admin.lastName?.[0] || "D"}
              </>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
