from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta

from extensions import db
from models import User, LoginAttempt

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# ---------------- REGISTER ----------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    user = User(
        first_name=data["firstName"],
        last_name=data["lastName"],
        email=data["email"],
        password_hash=generate_password_hash(data["password"])
    )

    db.session.add(user)
    db.session.commit()

    login_attempt = LoginAttempt(user_id=user.id)
    db.session.add(login_attempt)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# ---------------- LOGIN ----------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    attempt = LoginAttempt.query.filter_by(user_id=user.id).first()

    if attempt.blocked_until and attempt.blocked_until > datetime.utcnow():
        return jsonify({
            "message": "Account temporarily blocked",
            "blocked_until": attempt.blocked_until.isoformat()
        }), 403

    if not check_password_hash(user.password_hash, data["password"]):
        attempt.failed_attempts += 1

        if attempt.failed_attempts >= 3:
            attempt.blocked_until = datetime.utcnow() + timedelta(minutes=1)

        db.session.commit()
        return jsonify({"message": "Invalid credentials"}), 401

    # SUCCESS LOGIN
    attempt.failed_attempts = 0
    attempt.blocked_until = None
    db.session.commit()

    token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role}
    )

    return jsonify({
        "access_token": token,
        "role": user.role
    }), 200
