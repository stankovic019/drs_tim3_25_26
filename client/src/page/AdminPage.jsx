import { useState } from "react";
import ProfileButton from "../components/ProfileButton";
import LogoutButton from "../components/LogoutButton";
import Dashboard from "../components/Dashboard";
import PendingQuizzes from "../components/PendingQuizzes";
import ApprovedQuizzes from "../components/ApprovedQuizzes";
import Footer from "../components/Footer";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const tabClass = (isActive) =>
    [
      "group relative outline-0 px-8 h-14 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95]",
      isActive
        ? "bg-white shadow-[4px_4px_#353a7c,0_0_0_2px_#353a7c] hover:shadow-[6px_6px_#353a7c,0_0_0_2px_#353a7c]"
        : "bg-[linear-gradient(45deg,#353a7c,#2872CB)] hover:bg-[linear-gradient(45deg,#2a2d63,#1f54a0)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset]",
    ].join(" ");

  const tabTextClass = (isActive) =>
    [
      "text-xl font-extrabold leading-none transition-all duration-300",
      isActive ? "text-[#353a7c]" : "text-white",
    ].join(" ");

  return (
    <div
      className="min-h-screen bg-gray-100 p-8 pb-32"
      style={{
        backgroundImage: "url(/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <img
        src="/admin-dashboard.png"
        alt="Admin Dashboard"
        className="fixed -top-6 -left-12 h-64 w-auto object-contain z-40 dashboard-logo-pulse"
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              className={tabClass(activeTab === "users")}
              onClick={() => setActiveTab("users")}
            >
              <span className={tabTextClass(activeTab === "users")}>
                Users
              </span>
            </button>
            <button
              className={tabClass(activeTab === "pending")}
              onClick={() => setActiveTab("pending")}
            >
              <span className={tabTextClass(activeTab === "pending")}>
                Pending Quizzes
              </span>
            </button>
            <button
              className={tabClass(activeTab === "approved")}
              onClick={() => setActiveTab("approved")}
            >
              <span className={tabTextClass(activeTab === "approved")}>
                Approved Quizzes
              </span>
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <ProfileButton />
            <LogoutButton />
          </div>
        </div>
        {activeTab === "pending" ? (
          <PendingQuizzes />
        ) : activeTab === "approved" ? (
          <ApprovedQuizzes />
        ) : (
          <Dashboard />
        )}
        <Footer />
      </div>
    </div>
  );
};

export default AdminPage;
