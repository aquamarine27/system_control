import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/auth";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  console.log("Request:", config.method, config.url, config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const register = async (login, password, role = 1) => {
  try {
    const response = await api.post("/register", { login, password, confirm_password: password, role });
    localStorage.setItem("login", login); 
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Registration failed");
  }
};

export const login = async (login, password) => {
  try {
    const response = await api.post("/login", { login, password });
    const { access_token, refresh_token, role } = response.data;
    if (access_token && refresh_token) {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("login", login); 
      if (role) localStorage.setItem("role", role); 
      console.log("Tokens and user data saved to localStorage:", { access_token, refresh_token, login, role });
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  try {
    const response = await api.post("/refresh", {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const { access_token } = response.data;
    localStorage.setItem("access_token", access_token);
    console.log("New access token saved:", access_token);
    return access_token;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Refresh failed");
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("access_token");
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export { api };