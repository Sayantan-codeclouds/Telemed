import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PatientProtectedRoute from "../components/auth/PatientProtectedRoute";
import PatientPublicRoute from "../components/auth/PatientPublicRoute";

import Home from "../pages/home/Home";

import Login from "../pages/patient/auth/Login";
import Register from "../pages/patient/auth/Register";
import ForgotPassword from "../pages/patient/auth/ForgotPassword";
import ResetPassword from "../pages/patient/auth/ResetPassword";
import VerifyEmail from "../pages/patient/auth/VerifyEmail";
import DoctorDetails from "../pages/patient/dashboard/DoctorDetails";
import Consultation from "../pages/consultation/Consultation";

import Dashboard from "../pages/patient/dashboard/Dashboard";
import Profile from "../pages/patient/dashboard/Profile";

import DoctorLayout from "../layouts/DoctorLayout";

import DoctorProtectedRoute from "../components/auth/DoctorProtectedRoute";
import DoctorPublicRoute from "../components/auth/DoctorPublicRoute";

import DoctorLogin from "../pages/doctor/auth/Login";
import DoctorRegister from "../pages/doctor/auth/Register";
import DoctorVerifyEmail from "../pages/doctor/auth/VerifyEmail";
import DoctorForgotPassword from "../pages/doctor/auth/ForgotPassword";
import DoctorResetPassword from "../pages/doctor/auth/ResetPassword";

import DoctorDashboard from "../pages/doctor/dashboard/Dashboard";
import DoctorProfile from "../pages/doctor/dashboard/Profile";
import DoctorAppointments from "../pages/doctor/dashboard/Appointments";
import DoctorAvailability from "../pages/doctor/dashboard/Availability";
import DoctorPatients from "../pages/doctor/dashboard/Patients";
import DoctorSettings from "../pages/doctor/dashboard/Settings";
import DoctorPrescriptions from "../pages/doctor/dashboard/Prescriptions";
import DoctorEarnings from "../pages/doctor/dashboard/Earnings";


// Future pages
import Appointments from "../pages/patient/dashboard/Appointments";
import Doctors from "../pages/patient/dashboard/Doctors";
import Pharmacy from "../pages/patient/dashboard/Pharmacy";
import PatientOrders from "../pages/patient/dashboard/Orders";
import Records from "../pages/patient/dashboard/Records";
import Prescriptions from "../pages/patient/dashboard/Prescriptions";
import AIAssistant from "../pages/patient/dashboard/AIAssistant";
import PatientSettings from "../pages/patient/dashboard/Settings";
import PatientHelpSupport from "../pages/patient/dashboard/HelpSupport";
import DoctorHelpSupport from "../pages/doctor/dashboard/HelpSupport";
import AdminSupportTickets from "../pages/admin/SupportTickets";

// Layout
import PatientLayout from "../layouts/PatientLayout";

// Admin
import AdminLayout from "../layouts/AdminLayout";
import AdminProtectedRoute from "../components/auth/AdminProtectedRoute";
import AdminPublicRoute from "../components/auth/AdminPublicRoute";
import AdminLogin from "../pages/admin/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminPatients from "../pages/admin/Patients";
import AdminDoctors from "../pages/admin/Doctors";
import AdminAppointments from "../pages/admin/Appointments";
import AdminPharmacy from "../pages/admin/Pharmacy";
import AdminOrders from "../pages/admin/Orders";
import AdminCrmSettings from "../pages/admin/CrmSettings";
import AdminSpecializations from "../pages/admin/Specializations";
import AdminCoupons from "../pages/admin/Coupons";
import AdminGiftCards from "../pages/admin/GiftCards";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminProfile from "../pages/admin/Profile";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}