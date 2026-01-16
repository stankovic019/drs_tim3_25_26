import React from "react";
import LogoutButton from "../components/LogoutButton";
import ProfileButton from "../components/ProfileButton";

const PlayerPage = () => {
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
          <h1 className="text-3xl font-bold text-white">Player Dashboard</h1>
          <div className="flex gap-4">
            <ProfileButton />
            <LogoutButton />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">Welcome to the Player Page</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
