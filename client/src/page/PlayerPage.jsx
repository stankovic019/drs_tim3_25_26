import LogoutButton from "../components/LogoutButton";
import ProfileButton from "../components/ProfileButton";
import PlayerQuizPlay from "../components/PlayerQuizPlay";
import Footer from "../components/Footer";

const PlayerPage = () => {
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
        src="/player-dashboard.png"
        alt="Player Dashboard"
        className="fixed -top-6 -left-12 h-64 w-auto object-contain z-40 dashboard-logo-pulse"
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div />
          <div className="flex gap-4">
            <ProfileButton />
            <LogoutButton />
          </div>
        </div>
        <PlayerQuizPlay />
        <Footer />
      </div>
    </div>
  );
};

export default PlayerPage;
