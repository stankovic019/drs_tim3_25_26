import React from "react";
import LogoutButton from "../components/LogoutButton";

const PlayerPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Player Dashboard</h1>
          <LogoutButton />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">Welcome to the Player Page</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
