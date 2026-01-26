from datetime import datetime
import time

from app.extensions import db, socketio
from app.models import Quiz, QuizAttempt, User
from app.mail_service import send_email


def _calculate_score(quiz, submitted):
    score = 0
    for q in quiz.questions:
        chosen = submitted.get(q.id)
        if not chosen:
            continue

        valid_ids = {a.id for a in q.answers}
        if not chosen.issubset(valid_ids):
            continue

        correct_ids = {a.id for a in q.answers if a.is_correct}
        if chosen == correct_ids:
            score += (q.points or 0)
    return score


def process_quiz_submission(quiz_id, attempt_id, submitted_answers, expired=False):
    from app.main import app

    with app.app_context():
        attempt = QuizAttempt.query.get(attempt_id)
        quiz = Quiz.query.get(quiz_id)
        if not attempt or not quiz:
            return

        if attempt.score is not None:
            return

        if not expired:
            time.sleep(2)

        submitted = {}
        for item in submitted_answers or []:
            qid = item.get("questionId")
            answer_ids = item.get("answerIds") or []
            if isinstance(qid, int):
                submitted[qid] = set(
                    x for x in answer_ids if isinstance(x, int)
                )

        score = 0 if expired else _calculate_score(quiz, submitted)
        attempt.score = score
        db.session.commit()

        player = User.query.get(attempt.player_id)
        duration_seconds = None
        if attempt.started_at and attempt.finished_at:
            duration_seconds = int(
                (attempt.finished_at - attempt.started_at).total_seconds()
            )
        socketio.emit(
            "quiz_result_ready",
            {
                "quizId": quiz.id,
                "attemptId": attempt.id,
                "score": score,
                "durationSeconds": duration_seconds,
                "finishedAt": attempt.finished_at.isoformat()
                if attempt.finished_at
                else None,
            },
            to=f"user:{attempt.player_id}",
        )

        if player and player.email:
            body = (
                "Your quiz result is ready.\n\n"
                f"Quiz: {quiz.title}\n"
                f"Score: {score}\n"
            )
            try:
                send_email(player.email, "Quiz Result", body)
            except Exception:
                pass
