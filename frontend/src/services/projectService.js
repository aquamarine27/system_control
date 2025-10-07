import axios from "axios";

const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000/api/v1" : "http://backend:3000/api/v1";

const projectApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

projectApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getProjects = async (page = 1, limit = 4, search = "") => {
  try {
    const response = await projectApi.get("/projects", {
      params: { page, limit, search },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch projects");
  }
};

export const getProject = async (projectId) => {
  try {
    const response = await projectApi.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch project");
  }
};