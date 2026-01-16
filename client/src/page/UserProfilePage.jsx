import React from "react";
import LogoutButton from "../components/LogoutButton";
import UserProfile from "../components/UserProfile.jsx";

const UserProfilePage = () => {
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
          <h1 className="text-3xl font-bold text-white">User profile</h1>
          <LogoutButton />
        </div>
        <UserProfile />
      </div>
    </div>
  );
};

export default UserProfilePage;
