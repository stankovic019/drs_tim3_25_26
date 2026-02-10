from flask import Blueprint, request, jsonify
from multiprocessing import Process
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.extensions import db, socketio
from app.models import Quiz, Question, AnswerOption, QuizAttempt, User
from app.dto import QuizDTO, QuizAttemptDTO
from app.quiz_processing import process_quiz_submission
from app.mail_service import send_quiz_report_email_async

from datetime import datetime, timedelta

quiz_bp = Blueprint("quizzes", __name__, url_prefix="/api/quizzes")


def require_role(*allowed_roles):
    role = (get_jwt() or {}).get("role")
    return role in allowed_roles

# ---------------- NAPRAVI KVIZ ----------------
@quiz_bp.route("", methods=["POST"])
@jwt_required()
def create_quiz():
    if not require_role("MODERATOR", "ADMIN"):
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    duration = data.get("durationSeconds")

    questions_data = data.get("questions") or []

    if not title:
        return jsonify({"message": "title is required"}), 400
    if not isinstance(duration, int) or duration <= 0:
        return jsonify({"message": "durationSeconds must be a positive integer"}), 400
    if not isinstance(questions_data, list) or len(questions_data) == 0:
        return jsonify({"message": "questions must be a non-empty list"}), 400

    author_id = int(get_jwt_identity())

    quiz = Quiz(title=title, duration_seconds=duration, author_id=author_id, status="PENDING")
    db.session.add(quiz)
    db.session.flush()  

    for q in questions_data:
        if not isinstance(q, dict):
            db.session.rollback()
            return jsonify({"message": "Each question must be an object"}), 400
        
        q_text = (q.get("text") or "").strip()
        points = q.get("points", 1)
        answers_data = q.get("answers") or []

        if not q_text:
            db.session.rollback()
            return jsonify({"message": "Each question must have text"}), 400
        if not isinstance(points, int) or points <= 0:
            db.session.rollback()
            return jsonify({"message": "Each question points must be a positive integer"}), 400
        if not isinstance(answers_data, list) or len(answers_data) < 2:
            db.session.rollback()
            return jsonify({"message": "Each question must have at least 2 answers"}), 400

        correct_count = 0
        question = Question(quiz_id=quiz.id, text=q_text, points=points)
        db.session.add(question)
        db.session.flush()

        for a in answers_data:
            if not isinstance(a, dict):
                db.session.rollback()
                return jsonify({"message": "Each answer must be an object"}), 400

            a_text = (a.get("text") or "").strip()
            if not a_text:
                db.session.rollback()
                return jsonify({"message": "Each answer must have text"}), 400

            is_correct = a.get("isCorrect")
            if not isinstance(is_correct, bool):
                db.session.rollback()
                return jsonify({"message": "isCorrect must be boolean (true/false)"}), 400
            if is_correct:
                correct_count += 1

            db.session.add(AnswerOption(
                question_id=question.id,
                text=a_text,
                is_correct=is_correct
            ))

        if correct_count < 1:
            db.session.rollback()
            return jsonify({"message": "Each question must have at least 1 correct answer"}), 400

    db.session.commit()
    author = User.query.get(quiz.author_id)
    author_name = None
    if author:
        author_name = f"{author.first_name} {author.last_name}".strip()
    socketio.emit("quiz_created", {
        "id": quiz.id,
        "title": quiz.title,
        "durationSeconds": quiz.duration_seconds,
        "status": quiz.status,
        "authorId": quiz.author_id,
        "authorName": author_name,
        "createdAt": quiz.created_at.isoformat() if quiz.created_at else None
    }, to="admins")
    return jsonify({"message": "Quiz created", "id": quiz.id, "status": quiz.status}), 201

# ---------------- KVIZ ZA ODOBRAVANJE LISTA ----------------
@quiz_bp.route("/pending", methods=["GET"])
@jwt_required()
def list_pending_quizzes():
    if not require_role("ADMIN"):
        return jsonify({"message": "Forbidden"}), 403

    quizzes = Quiz.query.filter_by(status="PENDING").order_by(Quiz.id.asc()).all()

    result = []
    for q in quizzes:
        author = User.query.get(q.author_id)
        author_name = None
        if author:
            author_name = f"{author.first_name} {author.last_name}".strip()
        result.append(QuizDTO.from_model(q, author_name=author_name).to_dict())

    return jsonify(result), 200

# ---------------- SVI KVIZOVI (ADMIN) ----------------
@quiz_bp.route("/admin/all", methods=["GET"])
@jwt_required()
def list_all_quizzes_admin():
    if not require_role("ADMIN"):
        return jsonify({"message": "Forbidden"}), 403

    quizzes = Quiz.query.order_by(Quiz.id.asc()).all()
    result = []
    for q in quizzes:
        author = User.query.get(q.author_id)
        author_name = None
        if author:
            author_name = f"{author.first_name} {author.last_name}".strip()
        result.append(QuizDTO.from_model(q, author_name=author_name).to_dict())
    return jsonify(result), 200

# ---------------- ODOBRI KVIZ ----------------
@quiz_bp.route("/<int:quiz_id>/approve", methods=["PATCH"])
@jwt_required()
def approve_quiz(quiz_id):
    if not require_role("ADMIN"):
        return jsonify({"message": "Forbidden"}), 403

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    if quiz.status != "PENDING":
        return jsonify({"message": "Quiz is not pending"}), 400

    quiz.status = "APPROVED"
    quiz.rejection_reason = None
    db.session.commit()
    socketio.emit("quiz_reviewed", {
        "id": quiz.id,
        "status": quiz.status,
        "reason": quiz.rejection_reason
    }, to=f"user:{quiz.author_id}")

    return jsonify({"message": "Quiz approved", "id": quiz.id, "status": quiz.status}), 200

# ---------------- ODBIJ KVIZ ----------------
@quiz_bp.route("/<int:quiz_id>/reject", methods=["PATCH"])
@jwt_required()
def reject_quiz(quiz_id):
    if not require_role("ADMIN"):
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return jsonify({"message": "reason is required"}), 400

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    if quiz.status != "PENDING":
        return jsonify({"message": "Quiz is not pending"}), 400

    quiz.status = "REJECTED"
    quiz.rejection_reason = reason
    db.session.commit()
    socketio.emit("quiz_reviewed", {
        "id": quiz.id,
        "status": quiz.status,
        "reason": quiz.rejection_reason
    }, to=f"user:{quiz.author_id}")

    return jsonify({
        "message": "Quiz rejected",
        "id": quiz.id,
        "status": quiz.status,
        "reason": quiz.rejection_reason
    }), 200

# ---------------- LISTA ODOBRENIH KVIZOVA ----------------
@quiz_bp.route("", methods=["GET"])
@jwt_required()
def list_approved_quizzes():
    quizzes = Quiz.query.filter_by(status="APPROVED").order_by(Quiz.id.asc()).all()

    return jsonify([QuizDTO.from_model(q).to_dict() for q in quizzes]), 200

# ---------------- DETALJI KVIZA ----------------
@quiz_bp.route("/<int:quiz_id>", methods=["GET"])
@jwt_required()
def get_quiz_details(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    role = (get_jwt() or {}).get("role")
    if role == "PLAYER" and quiz.status != "APPROVED":
        return jsonify({"message": "Forbidden"}), 403

    dto = QuizDTO.from_model(
        quiz,
        include_questions=True,
        include_correct_count=role == "PLAYER",
    )
    return jsonify(dto.to_dict()), 200

# ---------------- POKRENI KVIZ ----------------
@quiz_bp.route("/<int:quiz_id>/start", methods=["POST"])
@jwt_required()
def start_quiz_attempt(quiz_id):
    if not require_role("PLAYER"):
        return jsonify({"message": "Forbidden"}), 403

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404
    if quiz.status != "APPROVED":
        return jsonify({"message": "Quiz not available"}), 403

    player_id = int(get_jwt_identity())

    attempt = QuizAttempt.query.filter_by(quiz_id=quiz_id, player_id=player_id).first()
    if attempt:
        if attempt.finished_at is not None:
            return jsonify({"message": "Already finished", "attemptId": attempt.id}), 409

        return jsonify({
            "attemptId": attempt.id,
            "quizId": attempt.quiz_id,
            "startedAt": attempt.started_at.isoformat(),
            "finishedAt": None
        }), 200

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        player_id=player_id,
        started_at=datetime.utcnow()
    )
    db.session.add(attempt)
    db.session.commit()

    return jsonify({
        "attemptId": attempt.id,
        "quizId": attempt.quiz_id,
        "startedAt": attempt.started_at.isoformat(),
        "finishedAt": None
    }), 201

# ---------------- POSALJI POKUSAJ KVIZA ----------------
@quiz_bp.route("/<int:quiz_id>/submit", methods=["POST"])
@jwt_required()
def submit_quiz_attempt(quiz_id):
    if not require_role("PLAYER"):
        return jsonify({"message": "Forbidden"}), 403

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404
    if quiz.status != "APPROVED":
        return jsonify({"message": "Quiz not available"}), 403

    player_id = int(get_jwt_identity())

    attempt = QuizAttempt.query.filter_by(quiz_id=quiz_id, player_id=player_id).first()
    if not attempt:
        return jsonify({"message": "You must start the quiz first"}), 409

    if attempt.finished_at is not None:
        if attempt.score is None:
            return jsonify({"message": "Processing"}), 202
        return jsonify({"message": "Already submitted", "score": attempt.score}), 409

    now = datetime.utcnow()
    elapsed_seconds = (now - attempt.started_at).total_seconds()
    if quiz.duration_seconds is not None and elapsed_seconds > quiz.duration_seconds:
        attempt.finished_at = now
        attempt.score = None
        db.session.commit()
        proc = Process(
            target=process_quiz_submission,
            args=(quiz.id, attempt.id, [], True),
            daemon=True
        )
        proc.start()
        return jsonify({"message": "Time expired, processing result"}), 202

    data = request.get_json() or {}
    answers = data.get("answers") or []
    remaining_seconds = data.get("remainingSeconds")

    if not isinstance(answers, list):
        return jsonify({"message": "answers must be a list"}), 400

    quiz_question_ids = {q.id for q in quiz.questions}

    submitted = {}  
    for item in answers:
        if not isinstance(item, dict):
            return jsonify({"message": "answers items must be objects"}), 400

        qid = item.get("questionId")
        answer_ids = item.get("answerIds")

        if not isinstance(qid, int):
            return jsonify({"message": "questionId must be an integer"}), 400
        if qid not in quiz_question_ids:
            return jsonify({"message": f"Question {qid} does not belong to this quiz"}), 400

        if not isinstance(answer_ids, list) or len(answer_ids) == 0:
            return jsonify({"message": f"answerIds must be a non-empty list for question {qid}"}), 400
        if not all(isinstance(x, int) for x in answer_ids):
            return jsonify({"message": f"answerIds must contain integers for question {qid}"}), 400

        submitted[qid] = set(answer_ids)

    for q in quiz.questions:
        chosen = submitted.get(q.id)
        if not chosen:
            continue

        valid_ids = {a.id for a in q.answers}
        if not chosen.issubset(valid_ids):
            return jsonify({"message": f"Invalid answerIds for question {q.id}"}), 400

    if (
        isinstance(remaining_seconds, int)
        and quiz.duration_seconds is not None
        and remaining_seconds >= 0
        and remaining_seconds <= quiz.duration_seconds
    ):
        elapsed = quiz.duration_seconds - remaining_seconds
        attempt.finished_at = attempt.started_at + timedelta(seconds=elapsed)
    else:
        attempt.finished_at = now
    attempt.score = None
    db.session.commit()

    proc = Process(
        target=process_quiz_submission,
        args=(quiz.id, attempt.id, answers, False),
        daemon=True
    )
    proc.start()

    return jsonify({
        "attemptId": attempt.id,
        "quizId": quiz.id,
        "status": "PROCESSING"
    }), 202

# ---------------- LISTA POBJEDNIKA ----------------
@quiz_bp.route("/<int:quiz_id>/leaderboard", methods=["GET"])
@jwt_required()
def leaderboard(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz or quiz.status != "APPROVED":
        return jsonify({"message": "Quiz not found"}), 404

    attempts = (
        QuizAttempt.query
        .filter_by(quiz_id=quiz_id)
        .filter(QuizAttempt.score.isnot(None))
        .order_by(QuizAttempt.score.desc(), QuizAttempt.finished_at.asc())
        .limit(50)
        .all()
    )

    result = []
    for a in attempts:
        duration = None
        if a.started_at and a.finished_at:
            duration = int((a.finished_at - a.started_at).total_seconds())

        u = User.query.get(a.player_id)

        dto = QuizAttemptDTO(
            player_id=a.player_id,
            name=f"{u.first_name} {u.last_name}".strip() if u else None,
            score=a.score,
            duration_seconds=duration,
            finished_at=a.finished_at.isoformat() if a.finished_at else None,
        )
        result.append(dto.to_dict())
    return jsonify(result), 200

# ---------------- OBRISI KVIZ ----------------
@quiz_bp.route("/<int:quiz_id>", methods=["DELETE"])
@jwt_required()
def delete_quiz(quiz_id):
    if not require_role("MODERATOR", "ADMIN"):
        return jsonify({"message": "Forbidden"}), 403

    user_id = int(get_jwt_identity())

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    if not require_role("ADMIN") and quiz.author_id != user_id:
        return jsonify({"message": "Forbidden"}), 403

    QuizAttempt.query.filter_by(quiz_id=quiz_id).delete(synchronize_session=False)
    db.session.delete(quiz)
    db.session.commit()
    return jsonify({"message": "Quiz deleted", "id": quiz_id}), 200

# ---------------- REZULTAT KVIZA ----------------
@quiz_bp.route("/<int:quiz_id>/result/me", methods=["GET"])
@jwt_required()
def my_result(quiz_id):
    if not require_role("PLAYER"):
        return jsonify({"message": "Forbidden"}), 403

    user_id = int(get_jwt_identity())

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    attempt = QuizAttempt.query.filter_by(quiz_id=quiz_id, player_id=user_id).first()
    if not attempt:
        return jsonify({"message": "No attempt"}), 404

    now = datetime.utcnow()

    if attempt.finished_at is None:
        if quiz.duration_seconds is not None and attempt.started_at is not None:
            elapsed = (now - attempt.started_at).total_seconds()
            if elapsed > quiz.duration_seconds:
                attempt.finished_at = now
                attempt.score = None
                db.session.commit()
                proc = Process(
                    target=process_quiz_submission,
                    args=(quiz.id, attempt.id, [], True),
                    daemon=True
                )
                proc.start()
            else:
                return jsonify({"message": "Not submitted yet"}), 409
        else:
            return jsonify({"message": "Not submitted yet"}), 409

    duration = None
    if attempt.started_at and attempt.finished_at:
        duration = int((attempt.finished_at - attempt.started_at).total_seconds())

    if attempt.score is None:
        return jsonify({"message": "Processing"}), 202

    return jsonify({
        "quizId": quiz_id,
        "playerId": user_id,
        "score": attempt.score,
        "durationSeconds": duration,
        "finishedAt": attempt.finished_at.isoformat() if attempt.finished_at else None
    }), 200

# ---------------- MOJI KVIZOVI ----------------
@quiz_bp.route("/mine", methods=["GET"])
@jwt_required()
def my_quizzes():
    if not require_role("MODERATOR", "ADMIN"):
        return jsonify({"message": "Forbidden"}), 403

    user_id = int(get_jwt_identity())

    quizzes = (
        Quiz.query
        .filter_by(author_id=user_id)
        .order_by(Quiz.id.asc())
        .all()
    )

    return jsonify([QuizDTO.from_model(q).to_dict() for q in quizzes]), 200

# ---------------- ODBIJENI KVIZ ----------------
@quiz_bp.route("/<int:quiz_id>", methods=["PUT"])
@jwt_required()
def update_rejected_quiz(quiz_id):
    if not require_role("MODERATOR", "ADMIN"):
        return jsonify({"message": "Forbidden"}), 403

    user_id = int(get_jwt_identity())

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    if not require_role("ADMIN") and quiz.author_id != user_id:
        return jsonify({"message": "Forbidden"}), 403

    if quiz.status != "REJECTED":
        return jsonify({"message": "Only REJECTED quizzes can be edited"}), 400

    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    duration = data.get("durationSeconds")
    questions_data = data.get("questions") or []

    if not title:
        return jsonify({"message": "title is required"}), 400
    if not isinstance(duration, int) or duration <= 0:
        return jsonify({"message": "durationSeconds must be a positive integer"}), 400
    if not isinstance(questions_data, list) or len(questions_data) == 0:
        return jsonify({"message": "questions must be a non-empty list"}), 400

    quiz.title = title
    quiz.duration_seconds = duration

    quiz.questions.clear()
    db.session.flush()

    for q in questions_data:
        if not isinstance(q, dict):
            db.session.rollback()
            return jsonify({"message": "Each question must be an object"}), 400

        q_text = (q.get("text") or "").strip()
        points = q.get("points", 1)
        answers_data = q.get("answers") or []

        if not q_text:
            db.session.rollback()
            return jsonify({"message": "Each question must have text"}), 400
        if not isinstance(points, int) or points <= 0:
            db.session.rollback()
            return jsonify({"message": "Each question points must be a positive integer"}), 400
        if not isinstance(answers_data, list) or len(answers_data) < 2:
            db.session.rollback()
            return jsonify({"message": "Each question must have at least 2 answers"}), 400

        question = Question(quiz_id=quiz.id, text=q_text, points=points)
        db.session.add(question)
        db.session.flush()

        correct_count = 0
        for a in answers_data:
            if not isinstance(a, dict):
                db.session.rollback()
                return jsonify({"message": "Each answer must be an object"}), 400

            a_text = (a.get("text") or "").strip()
            if not a_text:
                db.session.rollback()
                return jsonify({"message": "Each answer must have text"}), 400

            is_correct = a.get("isCorrect")

            if not isinstance(is_correct, bool):
                db.session.rollback()
                return jsonify({"message": "isCorrect must be boolean (true/false)"}), 400

            if is_correct:
                correct_count += 1

            db.session.add(AnswerOption(
                question_id=question.id,
                text=a_text,
                is_correct=is_correct
            ))

        if correct_count < 1:
            db.session.rollback()
            return jsonify({"message": "Each question must have at least 1 correct answer"}), 400

    quiz.status = "PENDING"
    quiz.rejection_reason = None

    db.session.commit()
    return jsonify({"message": "Quiz updated and resubmitted", "id": quiz.id, "status": quiz.status}), 200


#---------------- POSALJI IZVJESTAJ KVIZA EMAILOM ----------------
@quiz_bp.route("/<int:quiz_id>/report/email", methods=["POST"])
@jwt_required()
def email_quiz_report(quiz_id):
    if not require_role("ADMIN"):
        return jsonify({"message": "Forbidden"}), 403

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    data = request.get_json(silent=True) or {}
    requested_email = (data.get("email") or "").strip()

    admin_user = User.query.get(int(get_jwt_identity()))
    target_email = requested_email or (admin_user.email if admin_user else "")

    if not target_email:
        return jsonify({"message": "Target email is required"}), 400

    attempts = (
        QuizAttempt.query
        .filter_by(quiz_id=quiz_id)
        .order_by(QuizAttempt.finished_at.desc())
        .all()
    )

    attempt_rows = []
    for attempt in attempts:
        player = User.query.get(attempt.player_id)
        full_name = (
            f"{player.first_name} {player.last_name}".strip()
            if player else f"Player {attempt.player_id}"
        )

        duration_seconds = None
        if attempt.started_at and attempt.finished_at:
            duration_seconds = int((attempt.finished_at - attempt.started_at).total_seconds())

        attempt_rows.append({
            "player_id": attempt.player_id,
            "name": full_name,
            "score": attempt.score,
            "finished_at": attempt.finished_at,
            "duration_seconds": duration_seconds,
        })

    send_quiz_report_email_async(
        to_email=target_email,
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        attempt_rows=attempt_rows,
    )

    return jsonify({"message": "Report generation started. Email will be sent shortly."}), 202
