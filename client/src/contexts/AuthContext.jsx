import React, { createContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔁 Init auth state on app load
  useEffect(() => {
    const accessToken = localStorage.getItem("access");

    if (accessToken) {
      try {
        // JWT payload decode (bez biblioteke)
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        setUser({ id: payload.sub, role: payload.role });
        setIsAuthenticated(true);
      } catch {
        logout();
      }
    }

    setIsLoading(false);
  }, []);

  // 🔐 Login
  const login = (accessToken, refreshToken) => {
    localStorage.setItem("access", accessToken);
    localStorage.setItem("refresh", refreshToken);

    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    setUser({ id: payload.sub, role: payload.role });
    setIsAuthenticated(true);
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore
    }

    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
