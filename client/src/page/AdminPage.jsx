import React from "react";
import ProfileButton from "../components/ProfileButton";
import LogoutButton from "../components/LogoutButton";
import Dashboard from "../components/Dashboard";

const AdminPage = () => {
  return (
    <div
      className="min-h-screen bg-gray-100 p-8"
      style={{
        backgroundImage: "url(/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>

          <div className="flex gap-4">
            <ProfileButton />
            <LogoutButton />
          </div>
        </div>
        <Dashboard />
      </div>
    </div>
  );
};

export default AdminPage;
