import { useState } from "react";
import LogoutButton from "../components/LogoutButton";
import ProfileButton from "../components/ProfileButton";
import ModeratorQuizzes from "../components/ModeratorQuizzes";
import CreateQuizForm from "../components/CreateQuizForm";
import Footer from "../components/Footer";

const ModeratorPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleCreated = () => {
    setRefreshToken((prev) => prev + 1);
  };

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
      {/* <img
        src="/moderator-dashboard.png"
        alt="Moderator Dashboard"
        className="fixed -top-6 -left-12 h-64 w-auto object-contain z-40 dashboard-logo-pulse"
      /> */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className={[
              "group relative outline-0 px-8 h-14 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95]",
              showForm
                ? "bg-white shadow-[4px_4px_#353a7c,0_0_0_2px_#353a7c] hover:shadow-[6px_6px_#353a7c,0_0_0_2px_#353a7c]"
                : "bg-[linear-gradient(45deg,#353a7c,#2872CB)] hover:bg-[linear-gradient(45deg,#2a2d63,#1f54a0)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset]",
            ].join(" ")}
          >
            <span
              className={[
                "text-xl font-extrabold leading-none transition-all duration-300",
                showForm ? "text-[#353a7c]" : "text-white",
              ].join(" ")}
            >
              {showForm ? "Close Form" : "+ Add Quiz"}
            </span>
          </button>
          <div className="flex gap-4">
            <ProfileButton />
            <LogoutButton />
          </div>
        </div>
        {showForm && <CreateQuizForm onCreated={handleCreated} />}
        {!showForm && <ModeratorQuizzes refreshToken={refreshToken} />}
        <Footer />
      </div>
    </div>
  );
};

export default ModeratorPage;
