import axiosInstance from "./axiosInstance";

// ---------------- FETCH MY PROFILE ----------------
export async function fetchMyProfile(userId) {
    // token ide automatski preko axiosInstance interceptora
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
}

// ---------------- UPDATE MY PROFILE ----------------
export async function updateMyProfile(userId, updatedData) {
    // updatedData može sadržati jedno ili više polja
    // npr: { firstName, lastName, birthDate, country }
    const response = await axiosInstance.patch(
        `/users/${userId}`,
        updatedData
    );
    return response.data;
}

export async function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
        "/upload/profile-image",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
}