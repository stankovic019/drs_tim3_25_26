import { useState } from "react";
import { createQuiz } from "../api/quizApi";

const emptyAnswer = () => ({ text: "", isCorrect: false });
export default function CreateQuizForm({ onCreated }) {
  const buildQuestion = (id, order) => ({
    id: `q-${id}`,
    order,
    text: "",
    points: 1,
    answers: [emptyAnswer(), emptyAnswer()],
  });
  const [nextQuestionId, setNextQuestionId] = useState(1);
  const [nextQuestionOrder, setNextQuestionOrder] = useState(1);
  const [title, setTitle] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [questions, setQuestions] = useState(() => [buildQuestion(0, 0)]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateQuestion = (index, key, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [key]: value } : q))
    );
  };

  const updateAnswer = (qIndex, aIndex, key, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const answers = q.answers.map((a, j) =>
          j === aIndex ? { ...a, [key]: value } : a
        );
        return { ...q, answers };
      })
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      buildQuestion(nextQuestionId, nextQuestionOrder),
      ...prev,
    ]);
    setNextQuestionId((prev) => prev + 1);
    setNextQuestionOrder((prev) => prev + 1);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addAnswer = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, answers: [...q.answers, emptyAnswer()] } : q
      )
    );
  };

  const removeAnswer = (qIndex, aIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        return {
          ...q,
          answers: q.answers.filter((_, j) => j !== aIndex),
        };
      })
    );
  };

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!Number.isInteger(Number(durationSeconds)) || durationSeconds <= 0) {
      return "Duration must be a positive integer";
    }
    if (!questions.length) return "At least one question is required";

    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      if (!q.text.trim()) return `Question ${q.order + 1} text is required`;
      if (!Number.isInteger(Number(q.points)) || q.points <= 0) {
        return `Question ${q.order + 1} points must be a positive integer`;
      }
      if (!q.answers || q.answers.length < 2) {
        return `Question ${q.order + 1} must have at least 2 answers`;
      }
      const hasCorrect = q.answers.some((a) => a.isCorrect);
      if (!hasCorrect) {
        return `Question ${q.order + 1} must have at least 1 correct answer`;
      }
      for (let j = 0; j < q.answers.length; j += 1) {
        if (!q.answers[j].text.trim()) {
          return `Answer ${j + 1} for question ${q.order + 1} is required`;
        }
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      title: title.trim(),
      durationSeconds: Number(durationSeconds),
      questions: [...questions]
        .sort((a, b) => a.order - b.order)
        .map((q) => ({
          text: q.text.trim(),
          points: Number(q.points),
          answers: q.answers.map((a) => ({
            text: a.text.trim(),
            isCorrect: Boolean(a.isCorrect),
          })),
        })),
    };

    try {
      setIsSubmitting(true);
      await createQuiz(payload);
      setSuccess("Quiz created and sent for approval");
      setTitle("");
      setDurationSeconds(30);
      setNextQuestionId(1);
      setNextQuestionOrder(1);
      setQuestions([buildQuestion(0, 0)]);
      if (onCreated) onCreated();
    } catch {
      setError("Failed to create quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Create Quiz</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addQuestion}
            className="group relative outline-0 px-6 h-12 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95] bg-[linear-gradient(45deg,#353a7c,#2872CB)] hover:bg-[linear-gradient(45deg,#2a2d63,#1f54a0)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset]"
          >
            <span className="text-lg font-extrabold leading-none text-white transition-all duration-300">
              + Add Question
            </span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative outline-0 px-6 h-12 border border-solid border-transparent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out active:scale-[0.95] bg-[linear-gradient(45deg,#353a7c,#2872CB)] hover:bg-[linear-gradient(45deg,#2a2d63,#1f54a0)] hover:shadow-2xl hover:-translate-y-0.5 [box-shadow:#3c40434d_0_1px_2px_0,#3c404326_0_2px_6px_2px,#0000004d_0_30px_60px_-30px,#34343459_0_-2px_6px_0_inset] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="text-lg font-extrabold leading-none text-white transition-all duration-300">
              {isSubmitting ? "Creating..." : "Create Quiz"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-4 text-sm text-[#9b0101] font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-4 text-sm text-[#1a7f37] font-semibold">
          {success}
        </div>
      )}

      <div className="bg-[linear-gradient(45deg,#efad21,#ffd60f)] border-2 border-[#353a7c] rounded-xl shadow-[5px_5px_#353a7c] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
          <label className="block text-base font-bold text-[#353a7c] mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-[48px] border-2 border-[#353a7c] rounded-[6px] bg-[#fff] shadow-[3px_3px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[3px_3px_#efad21]"
              placeholder="e.g. General Knowledge"
            />
          </div>
          <div>
          <label className="block text-base font-bold text-[#353a7c] mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              min="1"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              className="w-full h-[48px] border-2 border-[#353a7c] rounded-[6px] bg-[#fff] shadow-[3px_3px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[3px_3px_#efad21]"
            />
          </div>
        </div>

        <div className="space-y-5">
          {questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="border-2 border-[#353a7c] rounded-xl bg-white shadow-[4px_4px_#353a7c] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-[#353a7c]">
                Question {q.order + 1}
              </h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="relative overflow-hidden px-4 h-[36px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#9b0101] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#9b0101] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#c80404] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-base font-bold text-[#353a7c] mb-2">
                  Question text
                </label>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) =>
                    updateQuestion(qIndex, "text", e.target.value)
                  }
                  className="w-full h-[46px] border-2 border-[#353a7c] rounded-[6px] bg-[#fff] shadow-[3px_3px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[3px_3px_#efad21]"
                  placeholder="Enter question..."
                />
              </div>
              <div>
                <label className="block text-base font-bold text-[#353a7c] mb-2">
                  Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={q.points}
                  onChange={(e) =>
                    updateQuestion(qIndex, "points", e.target.value)
                  }
                  className="w-full h-[46px] border-2 border-[#353a7c] rounded-[6px] bg-[#fff] shadow-[3px_3px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[3px_3px_#efad21]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-[#353a7c]">
                Answers (mark correct)
              </p>
              <button
                type="button"
                onClick={() => addAnswer(qIndex)}
                className="relative overflow-hidden px-4 h-[34px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#353a7c] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#353a7c] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#353a7c] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
              >
                + Add Answer
              </button>
            </div>

            <div className="space-y-3">
              {q.answers.map((a, aIndex) => (
                <div
                  key={`q-${qIndex}-a-${aIndex}`}
                  className="flex flex-wrap items-center gap-3"
                >
                  <input
                    type="text"
                    value={a.text}
                    onChange={(e) =>
                      updateAnswer(qIndex, aIndex, "text", e.target.value)
                    }
                    className="flex-1 min-w-[220px] h-[42px] border-2 border-[#353a7c] rounded-[6px] bg-[#fff] shadow-[3px_3px_#353a7c] font-semibold text-[#666] px-3 outline-none transition-all duration-300 focus:border-[#efad21] focus:shadow-[3px_3px_#efad21]"
                    placeholder={`Answer ${aIndex + 1}`}
                  />
                  <label className="flex items-center gap-2 text-base font-bold text-[#353a7c] cursor-pointer">
                    <span className="relative inline-flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={a.isCorrect}
                        onChange={(e) =>
                          updateAnswer(
                            qIndex,
                            aIndex,
                            "isCorrect",
                            e.target.checked
                          )
                        }
                        className="peer sr-only"
                      />
                      <span className="w-4 h-4 rounded-[4px] border-2 border-[#353a7c] bg-white shadow-[2px_2px_#353a7c] transition-colors duration-200 peer-checked:bg-[#353a7c] peer-checked:border-[#353a7c]" />
                      <svg
                        viewBox="0 0 24 24"
                        className="pointer-events-none absolute w-3 h-3 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l4 4 10-10" />
                      </svg>
                    </span>
                    Correct
                  </label>
                  {q.answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(qIndex, aIndex)}
                      className="relative overflow-hidden px-4 h-[34px] border-2 border-[#353a7c] rounded-[5px] bg-[#fff] shadow-[4px_4px_#353a7c] font-semibold text-[#9b0101] cursor-pointer transition-all duration-300 hover:text-[#e8e8e8] hover:shadow-[6px_6px_#9b0101] hover:border-[#fff] z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-[#c80404] before:z-[-1] before:transition-all before:duration-300 hover:before:w-full"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>

        <div className="mt-6" />
      </div>
    </form>
  );
}
