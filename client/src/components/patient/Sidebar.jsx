import {
  LayoutDashboard,
  UserRound,
  CalendarDays,
  Stethoscope,
  Pill,
  ShoppingBag,
  FileText,
  Bot,
  Settings,
  LogOut,
  LifeBuoy,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/patient/dashboard",
  },
  {
    title: "My Profile",
    icon: UserRound,
    path: "/patient/profile",
  },
  {
    title: "Appointments",
    icon: CalendarDays,
    path: "/patient/appointments",
  },
  {
    title: "Doctors",
    icon: Stethoscope,
    path: "/patient/doctors",
  },
  {
    title: "Prescriptions",
    icon: FileText,
    path: "/patient/prescriptions",
  },
  {
    title: "Pharmacy",
    icon: Pill,
    path: "/patient/pharmacy",
  },
  {
    title: "Orders & Payments",
    icon: ShoppingBag,
    path: "/patient/orders",
  },
  {
    title: "Medical Records",
    icon: FileText,
    path: "/patient/records",
  },
  {
    title: "AI Assistant",
    icon: Bot,
    path: "/patient/ai",
  },
  {
    title: "Help & Support",
    icon: LifeBuoy,
    path: "/patient/support",
  },
];

const handleLogout = () => {
  localStorage.removeItem("patientToken");
  localStorage.removeItem("patient");

  window.location.href = "/patient/login";
};

export default function Sidebar() {

  return (

    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">

      {/* Logo */}

      <div className="h-24 flex items-center px-8">

        <div>

          <h1 className="text-3xl font-bold text-blue-600">

            🏥 TeleClinic

          </h1>

          <p className="text-slate-500 text-sm">

            Patient Portal

          </p>

        </div>

      </div>

      {/* Menu */}

      <div className="flex-1 px-4">

        {menus.map((menu) => {

          const Icon = menu.icon;

          return (

            <NavLink
              key={menu.title}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center gap-4
                 px-5
                 py-4
                 rounded-2xl
                 mb-2
                 transition-all

                 ${
                   isActive
                     ? "bg-blue-600 text-white shadow-lg"
                     : "text-slate-600 hover:bg-slate-100"
                 }`
              }
            >

              <Icon size={21} />

              <span className="font-medium">

                {menu.title}

              </span>

            </NavLink>

          );

        })}

      </div>

      {/* Bottom */}

      <div className="border-t p-4 space-y-2">

        <NavLink
          to="/patient/settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-4 p-4 rounded-2xl transition ${
              isActive ? "bg-slate-100 font-semibold text-blue-600" : "hover:bg-slate-100 text-slate-700"
            }`
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>

       <button
  onClick={handleLogout}
  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-red-500"
>
  <LogOut size={20} />
  Logout
</button>

      </div>

    </aside>

  );

}