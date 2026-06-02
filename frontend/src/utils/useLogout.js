import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axiosClient from "./axiosClient";

export function useLogout() {
  const navigate = useNavigate();
  return async function logout() {
    try {
      await axiosClient.post("/auth/logout");
    } catch {}
    Cookies.remove("role");
    Cookies.remove("loggedInUser");
    navigate("/");
  };
}
