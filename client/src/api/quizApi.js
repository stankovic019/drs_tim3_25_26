import axiosInstance from "./axiosInstance";

// ---------------- PENDING QUIZZES (ADMIN) ----------------
export async function fetchPendingQuizzes() {
  const response = await axiosInstance.get("/quizzes/pending");
  return response.data;
}

// ---------------- APPROVE QUIZ (ADMIN) ----------------
export async function approveQuiz(quizId) {
  const response = await axiosInstance.patch(`/quizzes/${quizId}/approve`);
  return response.data;
}

// ---------------- REJECT QUIZ (ADMIN) ----------------
export async function rejectQuiz(quizId, reason) {
  const response = await axiosInstance.patch(`/quizzes/${quizId}/reject`, {
    reason,
  });
  return response.data;
}

// ---------------- MY QUIZZES (MODERATOR) ----------------
export async function fetchMyQuizzes() {
  const response = await axiosInstance.get("/quizzes/mine");
  return response.data;
}

// ---------------- CREATE QUIZ (MODERATOR) ----------------
export async function createQuiz(payload) {
  const response = await axiosInstance.post("/quizzes", payload);
  return response.data;
}

// ---------------- DELETE QUIZ (MODERATOR/ADMIN) ----------------
export async function deleteQuiz(quizId) {
  const response = await axiosInstance.delete(`/quizzes/${quizId}`);
  return response.data;
}

// ---------------- APPROVED QUIZZES (PLAYER) ----------------
export async function fetchApprovedQuizzes() {
  const response = await axiosInstance.get("/quizzes");
  return response.data;
}

// ---------------- ALL QUIZZES (ADMIN) ----------------
export async function fetchAllQuizzes() {
  const response = await axiosInstance.get("/quizzes/admin/all");
  return response.data;
}


// ---------------- QUIZ DETAILS (PLAYER/MODERATOR) ----------------
export async function fetchQuizDetails(quizId) {
  const response = await axiosInstance.get(`/quizzes/${quizId}`);
  return response.data;
}

// ---------------- START QUIZ (PLAYER) ----------------
export async function startQuizAttempt(quizId) {
  const response = await axiosInstance.post(`/quizzes/${quizId}/start`);
  return response.data;
}

// ---------------- SUBMIT QUIZ (PLAYER) ----------------
export async function submitQuizAttempt(quizId, answers, remainingSeconds) {
  const response = await axiosInstance.post(`/quizzes/${quizId}/submit`, {
    answers,
    remainingSeconds,
  });
  return response;
}

// ---------------- MY RESULT (PLAYER) ----------------
export async function fetchMyResult(quizId) {
  const response = await axiosInstance.get(`/quizzes/${quizId}/result/me`);
  return response;
}

// ---------------- LEADERBOARD (PLAYER) ----------------
export async function fetchLeaderboard(quizId) {
  const response = await axiosInstance.get(`/quizzes/${quizId}/leaderboard`);
  return response.data;
}
