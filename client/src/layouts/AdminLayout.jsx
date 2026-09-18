import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import PageLoader from "../components/common/PageLoader";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 p-8 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
