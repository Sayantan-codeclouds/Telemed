import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { canAccessAdminPath } from "../lib/adminAccess";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import PageLoader from "../components/common/PageLoader";

export default function AdminLayout() {
  const { pathname } = useLocation();

  // Pages outside the admin's role (e.g. typed into the address bar) go back
  // to the dashboard; the API would reject their requests anyway.
  if (!canAccessAdminPath(pathname)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

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
