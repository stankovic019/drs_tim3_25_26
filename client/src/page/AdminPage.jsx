import React from "react";
import LogoutButton from "../components/LogoutButton";
import Dashboard from "../components/Dashboard";

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <LogoutButton />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Dashboard />

        </div>
      </div>
    </div>
  );
};

export default AdminPage;
