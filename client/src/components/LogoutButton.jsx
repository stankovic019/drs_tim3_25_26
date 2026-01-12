import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthHook";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="group relative outline-0 px-8 h-14 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95] bg-[linear-gradient(45deg,#efad21,#ffd60f)] hover:bg-[linear-gradient(45deg,#c98c1a,#e6b80a)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset]"
    >
      <span className="text-xl font-extrabold leading-none text-white transition-all duration-300">
        Logout
      </span>
    </button>
  );
};

export default LogoutButton;
