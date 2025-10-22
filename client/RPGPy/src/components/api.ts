// api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true 
});

api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized — redirecting to login page.");
    
      localStorage.removeItem("token");



     window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
