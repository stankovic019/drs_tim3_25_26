import { useEffect, useRef, useState } from "react";
import {
  fetchApprovedQuizzes,
  fetchMyResult,
  fetchLeaderboard,
  fetchQuizDetails,
  startQuizAttempt,
  submitQuizAttempt,
} from "../api/quizApi";
import QuizQuestion from "../components/QuizQuestion";

import { io } from "socket.io-client";

const countBadge = (text) =>
  `px-4 py-2 rounded-full text-lg font-extrabold border-2 border-[#353a7c] shadow-[3px_3px_#353a7c] bg-[linear-gradient(45deg,#353a7c,#2872CB)] text-white`;

const timeBadge = (text) =>
  `px-3 py-1 rounded-full text-xs font-bold border-2 border-[#353a7c] shadow-[3px_3px_#353a7c] bg-white text-[#353a7c]`;

export default function PlayerQuizPlay() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [totalDuration, setTotalDuration] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | in_progress | processing | done
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchApprovedQuizzes();
        setQuizzes(data);
      } catch {
        setError("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const resetSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    timerRef.current = null;
    pollRef.current = null;
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(null);
    setTotalDuration(null);
    setStatus("idle");
    setResult(null);
    setLeaderboard([]);
    setIsSubmitting(false);
  };

  const startTimer = (duration) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(duration);
    setTotalDuration(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startPolling = (quizId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetchMyResult(quizId);
        if (res.status === 200) {
          setResult(res.data);
          setStatus("done");
          clearInterval(pollRef.current);
          pollRef.current = null;
          const lb = await fetchLeaderboard(quizId);
          setLeaderboard(lb);
        }
      } catch {
        // ignore while processing
      }
    }, 2000);
  };

  const handleStartQuiz = async (quizId) => {
    setError("");
    resetSession();
    try {
      await startQuizAttempt(quizId);
      const details = await fetchQuizDetails(quizId);
      setActiveQuiz(details);
      setStatus("in_progress");
      setCurrentQuestionIndex(0);
      startTimer(details.durationSeconds);
      const lb = await fetchLeaderboard(quizId);
      setLeaderboard(lb);
    } catch (err) {
      if (err?.response?.status === 409) {
        try {
          const details = await fetchQuizDetails(quizId);
          setActiveQuiz(details);
          setStatus("done");
          setCurrentQuestionIndex(0);
          const res = await fetchMyResult(quizId);
          if (res.status === 200) {
            setResult(res.data);
          }
          const lb = await fetchLeaderboard(quizId);
          setLeaderboard(lb);
          setError("You already finished this quiz.");
        } catch {
          setError("You already finished this quiz.");
        }
      } else {
        setError("Failed to start quiz");
      }
    }
  };

  const toggleAnswer = (questionId, answerId, checked) => {
    setAnswers((prev) => {
      const current = new Set(prev[questionId] || []);
      if (checked) current.add(answerId);
      else current.delete(answerId);
      return { ...prev, [questionId]: Array.from(current) };
    });
  };

  const buildPayload = () =>
    Object.entries(answers).map(([questionId, answerIds]) => ({
      questionId: Number(questionId),
      answerIds,
    }));

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    setCurrentQuestionIndex((prev) =>
      Math.min(prev + 1, activeQuiz.questions.length - 1)
    );
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setError("");
    try {
      setIsSubmitting(true);
      const remainingSeconds =
        typeof timeLeft === "number" ? timeLeft : undefined;
      const res = await submitQuizAttempt(
        activeQuiz.id,
        buildPayload(),
        remainingSeconds
      );
      if (res.status === 202) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setStatus("processing");
        startPolling(activeQuiz.id);
      }
    } catch {
      setError("Failed to submit quiz");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (status === "in_progress" && timeLeft === 0) {
      handleSubmit();
    }
  }, [status, timeLeft]);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;
    const socket = io("http://localhost:5000", { auth: { token } });
    socket.on("quiz_result_ready", async (payload) => {
      if (activeQuiz && payload.quizId === activeQuiz.id) {
        setResult({
          score: payload.score,
          durationSeconds: payload.durationSeconds,
          finishedAt: payload.finishedAt,
        });
        setStatus("done");
        setIsSubmitting(false);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        const lb = await fetchLeaderboard(activeQuiz.id);
        setLeaderboard(lb);
      }
    });
    socketRef.current = socket;
    return () => socket.disconnect();
  }, [activeQuiz]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
      <div className="bg-[linear-gradient(45deg,#efad21,#ffd60f)] border-2 border-[#353a7c] rounded-xl shadow-[5px_5px_#353a7c] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-[#353a7c]">Available Quizzes</h2>
          <span className={countBadge(quizzes.length)}>{quizzes.length}</span>
        </div>
        {loading ? (
          <p className="text-[#666] font-semibold">Loading...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-[#666] font-semibold">No quizzes available</p>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="border-2 border-[#353a7c] rounded-lg bg-white shadow-[3px_3px_#353a7c] p-3"
              >
                <p className="text-[#353a7c] font-bold">{q.title}</p>
                <p className="text-sm text-[#666] font-semibold">
                  Duration: {q.durationSeconds}s
                </p>
                <button
                  onClick={() => handleStartQuiz(q.id)}
                  className="mt-3 w-full relative overflow-hidden px-5 h-[38px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#353a7c] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#353a7c] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#353a7c] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[linear-gradient(45deg,#efad21,#ffd60f)] border-2 border-[#353a7c] rounded-xl shadow-[5px_5px_#353a7c] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#353a7c]">Quiz Session</h2>
          {timeLeft !== null && totalDuration !== null && (
            <div className="flex flex-col items-end gap-2 min-w-[180px]">
              <span className={timeBadge(`${timeLeft}s left`)}>
                {timeLeft}s left
              </span>
              <div className="w-full h-2 border-2 border-[#353a7c] rounded-full bg-white shadow-[2px_2px_#353a7c] overflow-hidden">
                <div
                  className="h-full bg-[linear-gradient(45deg,#353a7c,#2872CB)] transition-[width] duration-500"
                  style={{
                    width: `${totalDuration > 0
                      ? Math.max(
                        0,
                        Math.min(100, (timeLeft / totalDuration) * 100)
                      )
                      : 0
                      }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-4 text-sm text-[#9b0101] font-semibold">
            {error}
          </div>
        )}

        {!activeQuiz ? (
          <p className="text-[#666] font-semibold">
            Select a quiz from the list to start.
          </p>
        ) : status === "processing" ? (
          <div className="text-[#666] font-semibold">
            Processing your result... You can continue using the platform.
          </div>
        ) : status === "done" && result ? (
          <div className="text-[#353a7c] font-bold space-y-3">
            <div>
              Your score: {result.score} · Time: {result.durationSeconds}s
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#353a7c] mb-2">
                Leaderboard
              </p>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-[#666] font-semibold">
                  No results yet
                </p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((row, idx) => (
                    <div
                      key={`${row.playerId}-${idx}`}
                      className="flex items-center justify-between border-2 border-[#353a7c] rounded-lg bg-white shadow-[3px_3px_#353a7c] px-3 py-2"
                    >
                      <span className="text-sm font-bold text-[#353a7c]">
                        #{idx + 1} {row.name || row.playerId}
                      </span>
                      <span className="text-sm font-bold text-[#353a7c]">
                        {row.score} pts · {row.durationSeconds}s
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-[#353a7c]">
              {activeQuiz.title}
            </h3>
            <div className="space-y-4">
              {activeQuiz.questions.length > 0 && (() => {
                const q = activeQuiz.questions[currentQuestionIndex];

                return (
                  <QuizQuestion
                    key={q.id}
                    question={q}
                    index={currentQuestionIndex}
                    total={activeQuiz.questions.length}
                    selectedAnswers={answers[q.id] || []}
                    onToggle={toggleAnswer}
                    onAutoNext={handleNextQuestion}
                  />
                );
              })()}
            </div>

            <div className="flex justify-end">
              {activeQuiz.questions.length > 0 &&
                currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={(answers[activeQuiz.questions[currentQuestionIndex].id] || []).length === 0}
                  className="group relative outline-0 px-8 h-14 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95] bg-[linear-gradient(45deg,#353a7c,#2872CB)] hover:bg-[linear-gradient(45deg,#2a2d63,#1f54a0)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="text-xl font-extrabold leading-none text-white transition-all duration-300">
                    Next
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    status === "processing" ||
                    (activeQuiz.questions.length > 0 &&
                      (answers[
                        activeQuiz.questions[currentQuestionIndex].id
                      ] || []).length === 0)
                  }
                  className="group relative outline-0 px-8 h-14 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95] bg-[linear-gradient(45deg,#353a7c,#2872CB)] hover:bg-[linear-gradient(45deg,#2a2d63,#1f54a0)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="text-xl font-extrabold leading-none text-white transition-all duration-300">
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
