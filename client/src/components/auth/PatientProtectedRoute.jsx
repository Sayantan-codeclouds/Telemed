import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  const token = localStorage.getItem("patientToken");

  if (!token) {
    return <Navigate to="/patient/login" replace />;
  }

  return children;
}