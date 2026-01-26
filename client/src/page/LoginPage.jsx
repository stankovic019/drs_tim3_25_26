import background from "/background.png";
import LoginComponent from "../components/LoginComponent.jsx";

const LoginPage = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      <LoginComponent />
    </div>
  );
};

export default LoginPage;
