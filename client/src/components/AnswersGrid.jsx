function AnswersGrid({ answers, selected, onClick }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {answers.map((a, idx) => {
                const isActive = selected.includes(a.id);

                return (
                    <button
                        key={a.id}
                        onClick={() => onClick(a.id)}
                        className={`
              relative p-4 rounded-lg border-2 font-bold text-left
              transition-all duration-200
              ${isActive
                                ? "bg-[linear-gradient(45deg,#353a7c,#353a7c)] text-white border-[#353a7c] shadow-[4px_4px_#353a7c]"
                                : "bg-white border-[#353a7c]shadow-[3px_3px_#353a7c] text-[#353a7c] hover:-translate-y-0.5"}
            `}
                    >
                        <span className="mr-2 font-extrabold ">
                            {String.fromCharCode(65 + idx)}:
                        </span>
                        <span >
                            {a.text}
                        </span>
                    </button>
                );
            })}
        </div >
    );
}
export default AnswersGrid;