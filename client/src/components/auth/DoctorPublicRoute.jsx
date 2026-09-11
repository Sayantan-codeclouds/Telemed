import { Navigate } from "react-router-dom";

export default function DoctorPublicRoute({ children }) {

  const token = localStorage.getItem("doctorToken");

  if (token) {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  return children;

}