import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {

  const token = localStorage.getItem("patientToken");

  if (token) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
}