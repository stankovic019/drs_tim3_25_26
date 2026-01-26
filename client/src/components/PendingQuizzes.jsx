import { useEffect, useMemo, useState } from "react";
import { approveQuiz, fetchPendingQuizzes, rejectQuiz } from "../api/quizApi";
import { io } from "socket.io-client";
import ConfirmationDialog from "./ConfirmationDialog";

const statusBadge = () =>
  "px-4 py-2 rounded-full text-lg font-extrabold border-2 border-[#353a7c] shadow-[3px_3px_#353a7c] bg-[linear-gradient(45deg,#353a7c,#2872CB)] text-white";

export default function PendingQuizzes() {
  const [pending, setPending] = useState([]);
  const [error, setError] = useState("");
  const [reasonById, setReasonById] = useState({});
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("access"), []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPendingQuizzes();
        setPending(data);
      } catch {
        setError("Failed to load pending quizzes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!token) return;
    const socket = io("http://localhost:5000", { auth: { token } });
    socket.on("quiz_created", (payload) => {
      setPending((prev) => [payload, ...prev]);
    });
    return () => {
      socket.disconnect();
    };
  }, [token]);

  const handleApprove = async (quizId) => {
    try {
      await approveQuiz(quizId);
      setPending((prev) => prev.filter((q) => q.id !== quizId));
    } catch {
      setError("Failed to approve quiz");
    }
  };

  const handleReject = async (quizId) => {
    const reason = (reasonById[quizId] || "").trim();
    if (!reason) {
      setError("Rejection reason is required");
      return;
    }
    try {
      await rejectQuiz(quizId, reason);
      setPending((prev) => prev.filter((q) => q.id !== quizId));
      setReasonById((prev) => {
        const copy = { ...prev };
        delete copy[quizId];
        return copy;
      });
    } catch {
      setError("Failed to reject quiz");
    }
  };


  return (
    <div className="mb-8">
      <div className="border-3 bg-[linear-gradient(45deg,#efad21,#ffd60f)] border-[#353a7c] rounded-xl shadow-[5px_5px_#353a7c] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#353a7c]">Pending Quizzes</h2>
          <span className={statusBadge()}>{pending.length}</span>
        </div>

        {error && (
          <div className="mb-4 border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-4 text-sm text-[#9b0101] font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-6 text-[#666] font-semibold">
            Loading...
          </div>
        ) : pending.length === 0 ? (
          <div className="border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-6 text-[#666] font-semibold">
            No pending quizzes
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white border-2 border-[#353a7c] rounded-xl shadow-[4px_4px_#353a7c] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-[#353a7c]">
                      {quiz.title}
                    </p>
                    <p className="text-sm text-[#666] font-semibold">
                      Duration: {quiz.durationSeconds}s · Author:{" "}
                      {quiz.authorName || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(quiz.id)}
                      className="relative overflow-hidden px-5 h-[38px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#2a6c3b] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#1a7f37] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#1a7f37] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(quiz.id)}
                      className="relative overflow-hidden px-5 h-[38px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#9b0101] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#9b0101] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#c80404] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-[#353a7c] mb-2">
                    Rejection reason (required to reject)
                  </label>
                  <textarea
                    value={reasonById[quiz.id] || ""}
                    onChange={(e) =>
                      setReasonById((prev) => ({
                        ...prev,
                        [quiz.id]: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full border-2 border-[#353a7c] rounded-[6px] bg-[#fff] shadow-[3px_3px_#353a7c] font-semibold text-[#666] px-3 py-2 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[3px_3px_#efad21]"
                    placeholder="Reason for rejection..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
