import React from "react";
import LogoutButton from "../components/LogoutButton";
import ProfileButton from "../components/ProfileButton";

const ModeratorPage = () => {
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
          <h1 className="text-3xl font-bold text-white">Moderator Dashboard</h1>
          <div className="flex gap-4">
            <button className="group relative outline-0 px-8 h-14 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95] bg-[linear-gradient(45deg,#353a7c,#2872CB)] hover:bg-[linear-gradient(45deg,#2a2d63,#1f54a0)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset]">
              <span className="text-xl font-extrabold leading-none text-white transition-all duration-300">
                + Add Quiz
              </span>
            </button>
            <ProfileButton />
            <LogoutButton />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">Welcome to the Moderator Page</p>
        </div>
      </div>
    </div>
  );
};

export default ModeratorPage;
