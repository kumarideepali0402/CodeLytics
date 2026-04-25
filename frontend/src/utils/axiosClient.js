import axios from "axios";
import { API_BASE } from "../config/apiBase";

const axiosClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];
let navigateFn = null;



export const setNavigate = (fn) => {
  navigateFn = fn;
}

function processQueue(error){
  failedQueue.forEach((prom)=>{
    if (error) {
      prom.reject(error);
     
    }
    else prom.resolve();

  })
   failedQueue = [];
}

axiosClient.interceptors.response.use(
  response=> ( response),
  async (error) => {

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if(isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({resolve, reject})
          })
          return await axiosClient(originalRequest);
          
        } catch (err) {
          throw err
          
        }
      }

      isRefreshing  = true;
      originalRequest._retry = true;

      try {
        await axiosClient.post('/auth/refresh');
        processQueue(null);
        return await axiosClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError);
        if (navigateFn) navigateFn('/');
        else window.location.href = '/';
        throw refreshError;
      }
      finally{
        isRefreshing = false;
      }

    }

    return Promise.reject(error);
  }

)


export default axiosClient;
