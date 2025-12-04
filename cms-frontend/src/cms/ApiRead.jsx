import axios from "axios";

const API_URL = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = import.meta.env.VITE_SUPER_ADMIN_TOKEN;
  if (!token) {
    console.warn("Geen API token gevonden in localStorage");
  }
  console.log("Using token:", token);
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getPages = () => {
  return axios.get(`${API_URL}/pages`, { headers: getAuthHeaders() });
};

export const getUser = () => {
  return axios.get(`${API_URL}/user`, {
    headers: getAuthHeaders(),
  });
};
