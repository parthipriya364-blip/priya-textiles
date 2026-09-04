import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../../services/authService";

export default function ProtectedRoute() {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const userIsAdmin = isAdmin();

  if (!isAuth) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!userIsAdmin) {
    // Redirect to home if not admin
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
