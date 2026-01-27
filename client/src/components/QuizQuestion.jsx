import QuestionCard from './QuestionCard';
import AnswersGrid from './AnswersGrid';
export default function QuizQuestion({
    question,
    index,
    total,
    selectedAnswers,
    onToggle,
    onAutoNext,
}) {
    const isMulti = question.correctCount > 1;

    const handleAnswerClick = (answerId) => {
        const alreadySelected = selectedAnswers.includes(answerId);

        onToggle(question.id, answerId, !alreadySelected);

        if (!isMulti) {
            setTimeout(() => onAutoNext(), 300);
        }
    };

    return (
        <div className="space-y-6">
            <QuestionCard
                index={index}
                total={total}
                text={question.text}
                correctCount={question.correctCount}
            />

            <AnswersGrid
                answers={question.answers}
                selected={selectedAnswers}
                onClick={handleAnswerClick}
            />
        </div>
    );
}

