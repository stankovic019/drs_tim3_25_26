import { useEffect, useState } from "react";
import { fetchMyProfile, updateMyProfile } from "../api/userProfileApi.js";
import SaveButton from "./SaveButton";

export default function UserProfile() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    country: "",
    street: "",
    streetNumber: "",
    profileImage: "",
  });
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // userId uzimamo iz localStorage (kao i svuda kod tebe)
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchMyProfile(userId);
        setUser(data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        gender: user.gender,
        country: user.country,
        street: user.street,
        streetNumber: user.streetNumber,
        profileImage: user.profileImage,
      };

      await updateMyProfile(userId, payload);
      alert("Profile updated");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-[#2872CB] p-8 rounded-2xl shadow-2xl">
        <div className="text-white text-center text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-[#2872CB] p-8 rounded-2xl shadow-2xl">
      <h2 className="text-white text-3xl font-bold mb-6">My Profile</h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Left column: Profile Image */}
        <div className="flex justify-center">
          <div
            onClick={() => setIsModalOpen(true)}
            className="relative w-40 h-40 cursor-pointer group"
          >
            {user.profileImage ? (
              <>
                <img
                  src={user.profileImage}
                  alt="Profile Preview"
                  className="w-full h-full rounded-[5px] border-2 border-[#353a7c] object-cover group-hover:opacity-80 transition-opacity shadow-[4px_4px_#353a7c]"
                />
                <div className="absolute inset-0 rounded-lg bg-black opacity-0 group-hover:opacity-30 transition-opacity flex items-center justify-center">
                  <span className="text-white text-2xl">✎</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full border-2 border-[#353a7c] rounded-[5px] bg-white flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-[4px_4px_#353a7c]">
                <div className="text-center">
                  <div className="text-5xl mb-2">👤</div>
                  <div className="text-[#666] font-semibold text-sm">
                    Click to upload
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Form fields */}
        <div className="col-span-2 grid grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-semibold mb-2">
              First Name:
            </label>
            <input
              name="firstName"
              value={user.firstName || ""}
              onChange={handleChange}
              className="w-full h-[40px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[4px_4px_#efad21]"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Last Name:
            </label>
            <input
              name="lastName"
              value={user.lastName || ""}
              onChange={handleChange}
              className="w-full h-[40px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[4px_4px_#efad21]"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Birth Date:
            </label>
            <input
              type="date"
              name="birthDate"
              value={user.birthDate || ""}
              onChange={handleChange}
              className="w-full h-[40px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[4px_4px_#efad21]"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Gender:
            </label>
            <select
              name="gender"
              value={user.gender || ""}
              onChange={handleChange}
              className="w-full h-[40px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[4px_4px_#efad21] cursor-pointer"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Country:
            </label>
            <input
              name="country"
              value={user.country || ""}
              onChange={handleChange}
              className="w-full h-[40px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[4px_4px_#efad21]"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Street:
            </label>
            <input
              name="street"
              value={user.street || ""}
              onChange={handleChange}
              className="w-full h-[40px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[4px_4px_#efad21]"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Street Number:
            </label>
            <input
              name="streetNumber"
              value={user.streetNumber || ""}
              onChange={handleChange}
              className="w-full h-[40px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[4px_4px_#efad21]"
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2872CB] rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-2xl font-bold">Upload Image</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white text-2xl hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <div className="bg-white rounded-lg p-8 flex flex-col items-center justify-center min-h-64 border-2 border-dashed border-[#353a7c]">
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                <div className="text-4xl mb-4">📸</div>
                <div className="text-center">
                  <p className="text-[#666] font-semibold mb-2">
                    Choose an image
                  </p>
                  <p className="text-[#999] text-sm">or drag and drop</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setUser((prev) => ({
                          ...prev,
                          profileImage: event.target.result,
                        }));
                        setIsModalOpen(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <SaveButton onClick={handleSave} />
      </div>
    </div>
  );
}
