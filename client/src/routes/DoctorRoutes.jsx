import { Routes, Route, Navigate } from "react-router-dom";

import DoctorLayout from "../layouts/DoctorLayout";

import DoctorProtectedRoute from "../components/auth/DoctorProtectedRoute";
import DoctorPublicRoute from "../components/auth/DoctorPublicRoute";

import Login from "../pages/doctor/auth/Login";
import Register from "../pages/doctor/auth/Register";
import VerifyEmail from "../pages/doctor/auth/VerifyEmail";

import Dashboard from "../pages/doctor/dashboard/Dashboard";
import Profile from "../pages/doctor/dashboard/Profile";
import Appointments from "../pages/doctor/dashboard/Appointments";
import Availability from "../pages/doctor/dashboard/Availability";
import Patients from "../pages/doctor/dashboard/Patients";
import Settings from "../pages/doctor/dashboard/Settings";
import Earnings from "../pages/doctor/dashboard/Earnings";

export default function DoctorRoutes() {

  return (
    <Routes>

      {/* Public */}

      <Route
        path="/doctor/login"
        element={
          <DoctorPublicRoute>
            <Login />
          </DoctorPublicRoute>
        }
      />

      <Route
        path="/doctor/register"
        element={
          <DoctorPublicRoute>
            <Register />
          </DoctorPublicRoute>
        }
      />

      <Route
        path="/doctor/verify-email"
        element={<VerifyEmail />}
      />

      {/* Layout */}

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
          path="availability"
          element={<Availability />}
        />

        <Route
          path="earnings"
          element={<Earnings />}
        />

        <Route
          path="patients"
          element={<Patients />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />

      </Route>

    </Routes>
  );

}