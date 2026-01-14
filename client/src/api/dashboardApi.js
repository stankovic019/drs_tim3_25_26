import axiosInstance from "./axiosInstance";

// ---------------- FETCH ALL USERS (ADMIN DASHBOARD) ----------------
export async function fetchAllUsers() {
    // Uzmi token iz localStorage
    const token = localStorage.getItem("access");

    // Poziv backend rute sa Authorization header-om
    const response = await axiosInstance.get("/auth/admin/all_users", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data; // vraća JSON niz svih korisnika
}

// ---------------- UPDATE USER ROLE ----------------
export async function updateUserRole(userId, newRole) {
    const response = await axiosInstance.patch(`/auth/users/${userId}/role`, {
        role: newRole,
    });
    return response.data;
}