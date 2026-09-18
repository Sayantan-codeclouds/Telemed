import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PatientProtectedRoute from "../components/auth/PatientProtectedRoute";
import PatientPublicRoute from "../components/auth/PatientPublicRoute";
import PageLoader from "../components/common/PageLoader";

const Home = lazy(() => import("../pages/home/Home"));

const Login = lazy(() => import("../pages/patient/auth/Login"));
const Register = lazy(() => import("../pages/patient/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/patient/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/patient/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("../pages/patient/auth/VerifyEmail"));
const DoctorDetails = lazy(() => import("../pages/patient/dashboard/DoctorDetails"));
const Consultation = lazy(() => import("../pages/consultation/Consultation"));

const Dashboard = lazy(() => import("../pages/patient/dashboard/Dashboard"));
const Profile = lazy(() => import("../pages/patient/dashboard/Profile"));

import DoctorLayout from "../layouts/DoctorLayout";

import DoctorProtectedRoute from "../components/auth/DoctorProtectedRoute";
import DoctorPublicRoute from "../components/auth/DoctorPublicRoute";

const DoctorLogin = lazy(() => import("../pages/doctor/auth/Login"));
const DoctorRegister = lazy(() => import("../pages/doctor/auth/Register"));
const DoctorVerifyEmail = lazy(() => import("../pages/doctor/auth/VerifyEmail"));
const DoctorForgotPassword = lazy(() => import("../pages/doctor/auth/ForgotPassword"));
const DoctorResetPassword = lazy(() => import("../pages/doctor/auth/ResetPassword"));

const DoctorDashboard = lazy(() => import("../pages/doctor/dashboard/Dashboard"));
const DoctorProfile = lazy(() => import("../pages/doctor/dashboard/Profile"));
const DoctorAppointments = lazy(() => import("../pages/doctor/dashboard/Appointments"));
const DoctorAvailability = lazy(() => import("../pages/doctor/dashboard/Availability"));
const DoctorPatients = lazy(() => import("../pages/doctor/dashboard/Patients"));
const DoctorSettings = lazy(() => import("../pages/doctor/dashboard/Settings"));
const DoctorPrescriptions = lazy(() => import("../pages/doctor/dashboard/Prescriptions"));
const DoctorEarnings = lazy(() => import("../pages/doctor/dashboard/Earnings"));

// Future pages
const Appointments = lazy(() => import("../pages/patient/dashboard/Appointments"));
const Doctors = lazy(() => import("../pages/patient/dashboard/Doctors"));
const Pharmacy = lazy(() => import("../pages/patient/dashboard/Pharmacy"));
const PatientOrders = lazy(() => import("../pages/patient/dashboard/Orders"));
const Records = lazy(() => import("../pages/patient/dashboard/Records"));
const Prescriptions = lazy(() => import("../pages/patient/dashboard/Prescriptions"));
const AIAssistant = lazy(() => import("../pages/patient/dashboard/AIAssistant"));
const PatientSettings = lazy(() => import("../pages/patient/dashboard/Settings"));
const PatientHelpSupport = lazy(() => import("../pages/patient/dashboard/HelpSupport"));
const DoctorHelpSupport = lazy(() => import("../pages/doctor/dashboard/HelpSupport"));
const AdminSupportTickets = lazy(() => import("../pages/admin/SupportTickets"));

// Layout
import PatientLayout from "../layouts/PatientLayout";

// Admin
import AdminLayout from "../layouts/AdminLayout";
import AdminProtectedRoute from "../components/auth/AdminProtectedRoute";
import AdminPublicRoute from "../components/auth/AdminPublicRoute";
const AdminLogin = lazy(() => import("../pages/admin/Login"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const AdminPatients = lazy(() => import("../pages/admin/Patients"));
const AdminDoctors = lazy(() => import("../pages/admin/Doctors"));
const AdminAppointments = lazy(() => import("../pages/admin/Appointments"));
const AdminPharmacy = lazy(() => import("../pages/admin/Pharmacy"));
const AdminOrders = lazy(() => import("../pages/admin/Orders"));
const AdminCrmSettings = lazy(() => import("../pages/admin/CrmSettings"));
const AdminSpecializations = lazy(() => import("../pages/admin/Specializations"));
const AdminCoupons = lazy(() => import("../pages/admin/Coupons"));
const AdminGiftCards = lazy(() => import("../pages/admin/GiftCards"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminProfile = lazy(() => import("../pages/admin/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* Public */}

        <Route path="/" element={<Home />} />

        <Route
  path="/patient/login"
  element={
    <PatientPublicRoute>
      <Login />
    </PatientPublicRoute>
  }
/>

<Route
  path="/patient/register"
  element={
    <PatientPublicRoute>
      <Register />
    </PatientPublicRoute>
  }
/>


       <Route
  path="/patient/forgot-password"
  element={
    <PatientPublicRoute>
      <ForgotPassword />
    </PatientPublicRoute>
  }
/>
        <Route
  path="/patient/reset-password"
  element={
    <PatientPublicRoute>
      <ResetPassword />
    </PatientPublicRoute>
  }
/>
        <Route
          path="/patient/verify-email"
          element={<VerifyEmail />}
        />

        {/* Patient Layout */}

       <Route
  path="/patient"
  element={
    <PatientProtectedRoute>
      <PatientLayout />
    </PatientProtectedRoute>
  }
>

  

  <Route
    index
    element={<Navigate to="dashboard" replace />}
  />

  <Route
    path="dashboard"
    element={<Dashboard />}
  />

  <Route
    path="profile"
    element={<Profile />}
  />

  

  <Route
    path="appointments"
    element={<Appointments />}
  />

  <Route
    path="doctors"
    element={<Doctors />}
  />

  <Route
  path="doctors/:id"
  element={<DoctorDetails />}
/>

<Route
  path="consultation/:appointmentId"
  element={<Consultation />}
/>
  <Route
    path="pharmacy"
    element={<Pharmacy />}
  />

  <Route
    path="orders"
    element={<PatientOrders />}
  />

  <Route
    path="prescriptions"
    element={<Prescriptions />}
  />

  <Route
    path="records"
    element={<Records />}
  />


  <Route
    path="ai"
    element={<AIAssistant />}
  />

  <Route
    path="settings"
    element={<PatientSettings />}
  />

  <Route
    path="support"
    element={<PatientHelpSupport />}
  />

  <Route
    path="*"
    element={<NotFound />}
  />

</Route>

{/* Doctor */}

<Route
  path="/doctor/login"
  element={
    <DoctorPublicRoute>
      <DoctorLogin />
    </DoctorPublicRoute>
  }
/>

<Route
  path="/doctor/forgot-password"
  element={
    <DoctorPublicRoute>
      <DoctorForgotPassword />
    </DoctorPublicRoute>
  }
/>

<Route
  path="/doctor/reset-password"
  element={
    <DoctorPublicRoute>
      <DoctorResetPassword />
    </DoctorPublicRoute>
  }
/>

<Route
  path="/doctor/register"
  element={
    <DoctorPublicRoute>
      <DoctorRegister />
    </DoctorPublicRoute>
  }
/>

<Route
  path="/doctor/verify-email"
  element={<DoctorVerifyEmail />}
/>

<Route
  path="/doctor"
  element={
    <DoctorProtectedRoute>
      <DoctorLayout />
    </DoctorProtectedRoute>
  }
>
  <Route
    index
    element={<Navigate to="dashboard" replace />}
  />

  <Route
    path="dashboard"
    element={<DoctorDashboard />}
  />

  <Route
    path="profile"
    element={<DoctorProfile />}
  />

  <Route
    path="appointments"
    element={<DoctorAppointments />}
  />
<Route
  path="consultation/:appointmentId"
  element={<Consultation />}
/>
  <Route
    path="availability"
    element={<DoctorAvailability />}
  />

  <Route
    path="earnings"
    element={<DoctorEarnings />}
  />

  <Route
    path="patients"
    element={<DoctorPatients />}
  />

  <Route
    path="settings"
    element={<DoctorSettings />}
  />

  <Route
    path="prescriptions"
    element={<DoctorPrescriptions />}
  />

  <Route
    path="support"
    element={<DoctorHelpSupport />}
  />

  <Route
    path="*"
    element={<NotFound />}
  />
</Route>

        {/* Admin */}
        <Route
          path="/admin/login"
          element={
            <AdminPublicRoute>
              <AdminLogin />
            </AdminPublicRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="pharmacy" element={<AdminPharmacy />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="specializations" element={<AdminSpecializations />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="gift-cards" element={<AdminGiftCards />} />
          <Route path="settings" element={<AdminCrmSettings />} />
          <Route path="crm-settings" element={<Navigate to="/admin/settings" replace />} />
          <Route path="support" element={<AdminSupportTickets />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Global Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}