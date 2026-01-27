import { useState } from "react";
import LogoutButton from "../components/LogoutButton";
import ProfileButton from "../components/ProfileButton";
import PlayerQuizPlay from "../components/PlayerQuizPlay";
import Footer from "../components/Footer";
import { GiHamburgerMenu } from "react-icons/gi";

const PlayerPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
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
            src="/player-dashboard.png"
            alt="Player Dashboard"
            className="absolute left-0 top-1/2 h-24 sm:h-32 md:h-40 w-auto object-contain dashboard-logo-pulse -translate-y-1/2 translate-x-0 sm:-translate-x-[6vw] md:-translate-x-[18vw]"
          />
          <div className="flex-1" />
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
            <div className="flex gap-3 items-center">
              <ProfileButton />
              <LogoutButton />
            </div>
          </div>
        )}
        <PlayerQuizPlay />
        <div className="mt-auto">
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PlayerPage;
