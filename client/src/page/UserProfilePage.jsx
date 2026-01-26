import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import UserProfile from "../components/UserProfile.jsx";
import Footer from "../components/Footer";

const UserProfilePage = () => {
  const navigate = useNavigate();

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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-white">User profile</h1>
            <button
              onClick={() => navigate(-1)}
              className="group relative outline-0 px-6 h-12 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95] bg-[#353a7c] hover:bg-[#2a2d63] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset] w-fit"
            >
              <span className="text-lg font-extrabold leading-none text-white transition-all duration-300">
                ← Back
              </span>
            </button>
          </div>
          <LogoutButton />
        </div>
        <UserProfile />
        <Footer />
      </div>
    </div>
  );
};

export default UserProfilePage;
