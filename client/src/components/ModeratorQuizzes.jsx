import { useEffect, useMemo, useState } from "react";
import { deleteQuiz, fetchMyQuizzes } from "../api/quizApi";
import ConfirmationDialog from "./ConfirmationDialog";
import { io } from "socket.io-client";

const statusPill = (status) => {
  const base =
    "px-3 py-1 rounded-full text-xs font-bold border-2 border-[#353a7c] shadow-[3px_3px_#353a7c]";
  if (status === "PENDING") return `${base} bg-[#f7f0c5] text-[#6a5a00]`;
  if (status === "APPROVED") return `${base} bg-[#c7f7d0] text-[#156c2f]`;
  if (status === "REJECTED") return `${base} bg-[#ffd0d0] text-[#8b1d1d]`;
  return `${base} bg-white text-[#353a7c]`;
};

export default function ModeratorQuizzes({ refreshToken }) {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const token = useMemo(() => localStorage.getItem("access"), []);

  const load = async () => {
    try {
      const data = await fetchMyQuizzes();
      setQuizzes(data);
    } catch {
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (quizId) => {
    setQuizToDelete(quizId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;
    try {
      await deleteQuiz(quizToDelete);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizToDelete));
      setShowConfirm(false);
      setQuizToDelete(null);
    } catch {
      setError("Failed to delete quiz");
      setShowConfirm(false);
      setQuizToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setQuizToDelete(null);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (refreshToken !== undefined) {
      load();
    }
  }, [refreshToken]);

  useEffect(() => {
    if (!token) return;
    const socket = io("http://localhost:5000", { auth: { token } });
    socket.on("quiz_reviewed", (payload) => {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === payload.id
            ? {
                ...q,
                status: payload.status,
                rejectionReason: payload.reason,
              }
            : q
        )
      );
    });
    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <div className="bg-[linear-gradient(45deg,#efad21,#ffd60f)] rounded-lg shadow-lg p-6 border-2 border-[#353a7c] shadow-[5px_5px_#353a7c]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#353a7c]">My Quizzes</h2>
        <button
          onClick={load}
          className="relative overflow-hidden px-5 h-[38px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#353a7c] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#353a7c] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#353a7c] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-4 text-sm text-[#9b0101] font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-[#666] font-semibold">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-[#666] font-semibold">No quizzes yet</div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div
              key={q.id}
              className="border-2 border-[#353a7c] rounded-lg bg-white shadow-[3px_3px_#353a7c] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-[#353a7c]">{q.title}</p>
                  <p className="text-sm text-[#666] font-semibold">
                    Duration: {q.durationSeconds}s
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusPill(q.status)}>{q.status}</span>
                  <button
                    onClick={() => requestDelete(q.id)}
                    className="relative overflow-hidden px-4 h-[34px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#9b0101] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#9b0101] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#c80404] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {q.status === "REJECTED" && q.rejectionReason ? (
                <p className="mt-2 text-sm text-[#9b0101] font-semibold">
                  Reason: {q.rejectionReason}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
