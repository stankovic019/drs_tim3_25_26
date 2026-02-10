import { useEffect, useState } from "react";
import { deleteQuiz, fetchAllQuizzes } from "../api/quizApi";
import ConfirmationDialog from "./ConfirmationDialog";
import SendQuizReportButton from "./SendQuizReportButton";

const statusBadge = () =>
  "px-4 py-2 rounded-full text-lg font-extrabold border-2 border-[#353a7c] shadow-[3px_3px_#353a7c] bg-[linear-gradient(45deg,#353a7c,#2872CB)] text-white";

export default function ApprovedQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const load = async () => {
    try {
      const data = await fetchAllQuizzes();
      setQuizzes(data.filter((q) => q.status === "APPROVED"));
    } catch {
      setError("Failed to load approved quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="mb-8">
      <div className="border-3 bg-[linear-gradient(45deg,#efad21,#ffd60f)] border-[#353a7c] rounded-xl shadow-[5px_5px_#353a7c] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#353a7c]">
            Approved Quizzes
          </h2>
          <span className={statusBadge()}>{quizzes.length}</span>
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
        ) : quizzes.length === 0 ? (
          <div className="border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-6 text-[#666] font-semibold">
            No approved quizzes
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
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
                    <SendQuizReportButton quizId={quiz.id} />
                    <button
                      onClick={() => requestDelete(quiz.id)}
                      className="relative overflow-hidden px-5 h-[38px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#9b0101] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#9b0101] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#c80404] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
