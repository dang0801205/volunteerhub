/** @format */

import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({
  user,
  loading,
  requiredRole,
  redirectTo = "/",
  children,
}) => {
  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
