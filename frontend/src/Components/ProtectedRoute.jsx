import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

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
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }
  if(isAuthenticated && role==="COLLEGE"){
    return <Navigate to="/college-dashboard" />
  }

  if (!isAuthenticated && role=='STUDENT') {
    return <Navigate to="/student/login" />;
  }

  if (!isAuthenticated && role=='TEACHER') {
    return <Navigate to="/teacher/login" />;
  }
  if (!isAuthenticated && role=='COLLEGE') {
    return <Navigate to="/college/login" />;
  }

  

  return element;
}
