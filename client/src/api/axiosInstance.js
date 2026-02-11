import axios from "axios";

//Render trigger rebuild v2

const axiosInstance = axios.create({
  baseURL: "https://flask-backend-drs.onrender.com/api",
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("access");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosInstance;
