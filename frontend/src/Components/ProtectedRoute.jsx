import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

const LOGIN_ROUTES = {
  STUDENT: '/student/login',
  TEACHER: '/teacher/login',
  COLLEGE: '/college/login',
};

const DASHBOARD_ROUTES = {
  STUDENT: '/student/assignment',
  TEACHER: '/teacher-dashboard',
  COLLEGE: '/college-dashboard',
};

export default function ProtectedRoute({ role, element }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosClient.get("/auth/check");
        if (response.status === 200 && response.data.user) {
          setIsAuthenticated(true);
          setUserRole(response.data.user.role);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_ROUTES[role] || '/'} replace />;
  }

  if (userRole !== role) {
    return <Navigate to={DASHBOARD_ROUTES[userRole] || '/'} replace />;
  }

  return element;
}
