import { Outlet, useLocation } from "react-router-dom";

import DoctorSidebar from "../components/doctor/DoctorSidebar";
import DoctorHeader from "../components/doctor/DoctorHeader";

export default function DoctorLayout() {
  const location = useLocation();
  const isConsultation = location.pathname.includes("/consultation/");

  if (isConsultation) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-slate-950 flex flex-col">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <DoctorSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}