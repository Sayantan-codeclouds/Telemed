import { Outlet } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";
import Navbar from "../components/patient/Navbar";

export default function PatientLayout() {
  return (
    <div className="h-screen flex bg-slate-100">

      {/* Sidebar */}

      <Sidebar />

      {/* Main */}

      <div className="flex flex-col flex-1 overflow-hidden">

        <Navbar />

        <main className="flex-1 overflow-y-auto p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
}