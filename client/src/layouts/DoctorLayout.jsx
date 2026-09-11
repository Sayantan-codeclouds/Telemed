import { Outlet } from "react-router-dom";

import DoctorSidebar from "../components/doctor/DoctorSidebar";
import DoctorHeader from "../components/doctor/DoctorHeader";

export default function DoctorLayout() {

  return (

    <div className="min-h-screen flex bg-slate-100">

      <DoctorSidebar />

      <div className="flex-1 flex flex-col">

        <DoctorHeader />

        <main className="flex-1 p-8 overflow-y-auto">

          <Outlet />

        </main>

      </div>

    </div>

  );

}