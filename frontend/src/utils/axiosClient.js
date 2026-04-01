import axios from "axios";
import { API_BASE } from "../config/apiBase";

const axiosClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
