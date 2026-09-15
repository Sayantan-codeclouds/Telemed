import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";
import Navbar from "../components/patient/Navbar";

export default function PatientLayout() {
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
    <div className="h-screen flex bg-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}