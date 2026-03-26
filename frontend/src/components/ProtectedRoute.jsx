import { Navigate } from "react-router-dom";
import "./ProtectedRoute.css";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { homeRouteForRole } from "../utils/homeRoute.js";

export default function ProtectedRoute({ children, requiredRole }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return <LoadingSpinner label="Checking session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to={homeRouteForRole(user?.role)} replace />;

  return children;
}
