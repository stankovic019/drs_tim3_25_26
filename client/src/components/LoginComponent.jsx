import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../hooks/useAuthHook";
import logo from "/logo-large.png";
import StyledInput from "./StyledInput";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser({ email, password });
      login(res.access_token, res.refresh_token);
      navigate("/adminpage");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="p-10 bg-[#2872CB] rounded-2xl shadow-2xl">
        <img src={logo} alt="Logo" className="mx-auto  object-contain" />
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Login
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <StyledInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <StyledInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="group relative outline-0 w-full h-14 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95] bg-[linear-gradient(45deg,#efad21,#ffd60f)] hover:bg-[linear-gradient(45deg,#c98c1a,#e6b80a)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset]"
          >
            <span className="text-xl font-extrabold leading-none text-white transition-all duration-300">
              Login
            </span>
          </button>

          <p className="text-center text-white text-sm mt-6">
            If you don't have an account{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-yellow-300 hover:text-yellow-100 font-semibold transition-colors cursor-pointer"
            >
              Register
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
