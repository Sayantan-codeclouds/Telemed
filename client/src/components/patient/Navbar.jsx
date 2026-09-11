import {
  Bell,
  Search,
} from "lucide-react";
import NotificationBell from "../common/NotificationBell";

export default function Navbar() {

  const patient =
    JSON.parse(localStorage.getItem("patient"));

  return (
    <header className="bg-white border-b h-20 flex items-center justify-between px-8">

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-4 text-slate-400"
        />

        <input
          placeholder="Search doctors, medicines..."
          className="w-96 bg-slate-100 rounded-xl pl-12 pr-5 py-3 outline-none"
        />

      </div>

      <div className="flex items-center gap-6">

        <NotificationBell role="patient" />

        <div className="flex items-center gap-4">

          <img
            src={`https://ui-avatars.com/api/?name=${patient?.firstName}+${patient?.lastName}&background=2563eb&color=fff`}
            alt=""
            className="w-12 h-12 rounded-full"
          />

          <div>

            <h4 className="font-semibold">

              {patient?.firstName}

            </h4>

            <p className="text-sm text-slate-500">

              Patient

            </p>

          </div>

        </div>

      </div>

    </header>
  );
}