import { Navigate, useLocation } from "react-router-dom";
import authService from "../services/authService";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
