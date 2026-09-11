import { Navigate } from "react-router-dom";

export default function DoctorProtectedRoute({ children }) {

  const token = localStorage.getItem("doctorToken");

  if (!token) {
    return <Navigate to="/doctor/login" replace />;
  }

  return children;

}