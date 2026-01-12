import React from "react";
import background from "/background.png";
import RegisterComponent from "../components/RegisterComponent.jsx";

const RegisterPage = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      <RegisterComponent />
    </div>
  );
};

export default RegisterPage;
