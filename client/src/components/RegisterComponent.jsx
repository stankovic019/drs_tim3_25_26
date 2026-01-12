import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import logo from "/logo-large.png";
import StyledInput from "./StyledInput";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    country: "",
    street: "",
    number: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="p-10 bg-[#2872CB] rounded-2xl shadow-2xl">
        <img src={logo} alt="Logo" className="mx-auto object-contain" />
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Register
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <StyledInput
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <StyledInput
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <StyledInput
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <StyledInput
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <StyledInput
                type="date"
                name="dateOfBirth"
                placeholder="Date of Birth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
                className="w-full h-[50px] rounded-lg border-2 border-[#353a7c] bg-white shadow-[4px_4px_#353a7c] text-[15px] font-semibold text-[#353a7c] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[6px_6px_#efad21]"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <StyledInput
                name="country"
                placeholder="Country"
                value={form.country}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <StyledInput
                name="street"
                placeholder="Street"
                value={form.street}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-span-2">
              <StyledInput
                name="number"
                placeholder="Number"
                value={form.number}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="group relative outline-0 w-full h-14 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95] bg-[linear-gradient(45deg,#efad21,#ffd60f)] hover:bg-[linear-gradient(45deg,#c98c1a,#e6b80a)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset]"
          >
            <span className="text-xl font-extrabold leading-none text-white transition-all duration-300">
              Register
            </span>
          </button>

          <p className="text-center text-white text-sm mt-6">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-yellow-300 hover:text-yellow-100 font-semibold transition-colors cursor-pointer"
            >
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
