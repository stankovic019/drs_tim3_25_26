import { useState } from "react";
import ProfileButton from "../components/ProfileButton";
import LogoutButton from "../components/LogoutButton";
import Dashboard from "../components/Dashboard";
import PendingQuizzes from "../components/PendingQuizzes";
import ApprovedQuizzes from "../components/ApprovedQuizzes";
import Footer from "../components/Footer";
import { GiHamburgerMenu } from "react-icons/gi";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [menuOpen, setMenuOpen] = useState(false);

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
      className="min-h-screen bg-gray-100 pt-8 flex flex-col"
      style={{
        backgroundImage: "url(/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex-1">
        <div className="relative flex justify-between items-center mt=[-5px]">
          <img
            src="/admin-dashboard.png"
            alt="Admin Dashboard"
            className="absolute left-0 top-1/2 h-24 sm:h-32 md:h-40 w-auto object-contain dashboard-logo-pulse -translate-y-1/2 translate-x-0 sm:-translate-x-[6vw] md:-translate-x-[18vw]"
          />
          <div className="flex-1 flex justify-start">
            <div className="hidden md:flex flex-wrap gap-4 items-center justify-start">
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
          </div>
          <div className="hidden md:flex gap-4 items-center">
            <ProfileButton />
            <LogoutButton />
          </div>
          <div className="md:hidden flex items-center">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="h-12 w-12 rounded-xl border-2 border-[#353a7c] bg-white shadow-[3px_3px_#353a7c] flex items-center justify-center"
            >
              <GiHamburgerMenu />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-4 border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-4">
            <div className="flex flex-col gap-3">
              <button
                className={tabClass(activeTab === "users")}
                onClick={() => {
                  setActiveTab("users");
                  setMenuOpen(false);
                }}
              >
                <span className={tabTextClass(activeTab === "users")}>
                  Users
                </span>
              </button>
              <button
                className={tabClass(activeTab === "pending")}
                onClick={() => {
                  setActiveTab("pending");
                  setMenuOpen(false);
                }}
              >
                <span className={tabTextClass(activeTab === "pending")}>
                  Pending Quizzes
                </span>
              </button>
              <button
                className={tabClass(activeTab === "approved")}
                onClick={() => {
                  setActiveTab("approved");
                  setMenuOpen(false);
                }}
              >
                <span className={tabTextClass(activeTab === "approved")}>
                  Approved Quizzes
                </span>
              </button>
              <div className="flex gap-3 items-center pt-2">
                <ProfileButton />
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
        <div className="mt-8">
          {activeTab === "pending" ? (
            <PendingQuizzes />
          ) : activeTab === "approved" ? (
            <ApprovedQuizzes />
          ) : (
            <Dashboard />
          )}
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default AdminPage;
