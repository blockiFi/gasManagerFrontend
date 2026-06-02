import Axios from "axios";
import { toast } from "react-toastify";

const rawBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";
const baseURL = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

const axios = Axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
    }
    if (error.response?.status === 402 && !window.location.pathname.includes("/dashboard/subscribe")) {
      window.location.href = "/dashboard/subscribe";
    }
    if (error.response?.status === 403) {
      const message =
        error.response?.data?.errors?.[0] ??
        error.response?.data?.message ??
        "You don't have permission to perform this action.";
      toast.warn(message);
    }
    return Promise.reject(error);
  }
);

export default axios;
