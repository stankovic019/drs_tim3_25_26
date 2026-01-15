import { useEffect, useState } from "react";
import { fetchMyProfile, updateMyProfile } from "../api/userProfileApi.js";

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    // userId uzimamo iz localStorage (kao i svuda kod tebe)
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await fetchMyProfile(userId);
                setUser(data);
            } catch (err) {
                setError("Failed to load profile");
            }
        };

        if (userId) {
            loadProfile();
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

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>My Profile</h2>

            <div>
                <label>First Name:</label>
                <input
                    name="firstName"
                    value={user.firstName || ""}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Last Name:</label>
                <input
                    name="lastName"
                    value={user.lastName || ""}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Birth Date:</label>
                <input
                    name="birthDate"
                    value={user.birthDate || ""}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Gender:</label>
                <input
                    name="gender"
                    value={user.gender || ""}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Country:</label>
                <input
                    name="country"
                    value={user.country || ""}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Street:</label>
                <input
                    name="street"
                    value={user.street || ""}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Street Number:</label>
                <input
                    name="streetNumber"
                    value={user.streetNumber || ""}
                    onChange={handleChange}
                />
            </div>

            <button onClick={handleSave}>Save</button>
        </div>
    );
}
