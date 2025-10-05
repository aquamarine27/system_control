import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { isAuthenticated } from "../services/authService";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth...");
        if (isAuthenticated()) {
          setIsAuthorized(true);
        } else {
          console.log("No token, redirecting...");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error.message);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    console.log("Redirecting to login...");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}