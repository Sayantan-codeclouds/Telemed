import axios from "axios";

const doctorApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

doctorApi.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("doctorToken");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  },
  (error) => Promise.reject(error)
);

doctorApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("doctorToken");
      localStorage.removeItem("doctor");
      if (window.location.pathname.startsWith("/doctor") && !window.location.pathname.includes("/login")) {
        window.location.href = "/doctor/login";
      }
    }
    return Promise.reject(error);
  }
);

export default doctorApi;