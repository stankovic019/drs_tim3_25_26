import { useState } from "react";

const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

const normalizeToken = (value) => {
  if (typeof value !== "string") return "";
  const v = value.trim();
  if (!v) return "";
  if (v.toLowerCase().startsWith("bearer ")) return v.slice(7).trim();
  return v;
};

const isJwtLike = (value) => JWT_REGEX.test(value);

const findTokenDeep = (input) => {
  if (input == null) return "";

  if (typeof input === "string") {
    const normalized = normalizeToken(input);
    if (isJwtLike(normalized)) return normalized;

    try {
      const parsed = JSON.parse(input);
      return findTokenDeep(parsed);
    } catch {
      return "";
    }
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = findTokenDeep(item);
      if (found) return found;
    }
    return "";
  }

  if (typeof input === "object") {
    for (const [key, value] of Object.entries(input)) {
      if (/token|jwt|access/i.test(key)) {
        const found = findTokenDeep(value);
        if (found) return found;
      }
    }

    for (const value of Object.values(input)) {
      const found = findTokenDeep(value);
      if (found) return found;
    }
  }

  return "";
};

const getStoredToken = () => {
  const directKeys = [
    "access_token",
    "accessToken",
    "token",
    "jwt",
    "jwtToken",
    "authToken",
  ];

  const storages = [localStorage, sessionStorage];

  for (const storage of storages) {
    for (const key of directKeys) {
      const raw = storage.getItem(key);
      const t = findTokenDeep(raw);
      if (t) return t;
    }

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;
      const raw = storage.getItem(key);
      const t = findTokenDeep(raw);
      if (t) return t;
    }
  }

  return "";
};

const SendQuizReportButton = ({ quizId }) => {
  const [loading, setLoading] = useState(false);

  const handleSendReport = async () => {
    if (loading) return;

    const id = Number(quizId);
    if (!Number.isInteger(id) || id <= 0) {
      alert("Invalid quiz id.");
      return;
    }

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const token = getStoredToken();

    if (!token) {
      alert("Missing token. Please log in again as admin.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/quizzes/${id}/report/email`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          data?.message ||
          (response.status === 401
            ? "Unauthorized. Token nije pronađen ili nije validan."
            : response.status === 403
            ? "Forbidden. Nalog nema ADMIN rolu."
            : "Failed to send report.");
        throw new Error(msg);
      }

      alert("Report generation started. The PDF will be sent to your email.");
    } catch (error) {
      alert(error?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSendReport}
      className="relative overflow-hidden px-5 h-[38px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#353a7c] cursor-pointer transition-all duration-300 hover:shadow-[6px_6px_#353a7c] hover:-translate-y-0.5"
      title="Send quiz PDF report to admin email"
    >
      {loading ? "Sending..." : "Send Report"}
    </button>
  );
};

export default SendQuizReportButton;
