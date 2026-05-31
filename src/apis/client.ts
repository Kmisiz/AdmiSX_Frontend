import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("candidate_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      localStorage.removeItem("candidate_token");
      localStorage.removeItem("candidate_user");
      window.location.href =
        import.meta.env.VITE_API_URL?.replace("/api", "")?.replace(
          ":5000",
          ":5173",
        ) + "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
