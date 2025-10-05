import axios from "axios";

const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000/api/v1/auth" : "http://backend:3000/api/v1/auth";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await api.post("/refresh");
        localStorage.setItem("access_token", response.data.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError.response?.data?.error || refreshError.message);
        return Promise.reject(refreshError);
      }
    }
    console.error("API request failed:", error.response?.data?.error || error.message);
    return Promise.reject(error);
  }
);

export const register = async (login, password, role = 1) => {
  try {
    const response = await api.post("/register", { login, password, confirm_password: password, role });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Registration failed");
  }
};

export const login = async (login, password) => {
  try {
    const response = await api.post("/login", { login, password });
    localStorage.setItem("access_token", response.data.access_token);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

export const getUserInfo = async () => {
  try {
    const response = await api.get("/user-info");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to get user info");
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("access_token");
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// export api for other
export { api };