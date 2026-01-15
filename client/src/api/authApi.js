import axiosInstance from "./axiosInstance";

// ---------------- REGISTER ----------------
export async function registerUser(data) {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
}

// ---------------- LOGIN ----------------
export async function loginUser(data) {
  const response = await axiosInstance.post("/auth/login", data);

  localStorage.setItem("access", response.data.access_token);
  localStorage.setItem("refresh", response.data.refresh_token);
  localStorage.setItem("userId", response.data.id);
  return response.data;
}

// ---------------- REFRESH TOKEN ----------------
export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");

  const response = await axiosInstance.post(
    "/auth/refresh",
    {},
    {
      headers: {
        Authorization: `Bearer ${refresh}`,
      },
    }
  );

  localStorage.setItem("access", response.data.access_token);
  return response.data.access_token;
}

// ---------------- LOGOUT ----------------
export async function logoutUser() {
  await axiosInstance.post("/auth/logout");
  localStorage.clear();
}
