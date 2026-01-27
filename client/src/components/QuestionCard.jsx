function QuestionCard({ index, total, text, correctCount }) {
    return (
        <div className="border-2 border-[#353a7c] rounded-xl bg-[linear-gradient(45deg,#0f172a,#1e3a8a)] shadow-[5px_5px_#353a7c] p-6 text-center">
            <p className="text-sm text-blue-200 font-bold mb-2">
                Question {index + 1} / {total}
            </p>

            <h3 className="text-xl font-extrabold text-white">
                {text}
            </h3>

            {correctCount > 1 && (
                <p className="mt-2 text-xs text-blue-200 font-semibold">
                    Select {correctCount} answers
                </p>
            )}
        </div>
    );
}
export default QuestionCard;