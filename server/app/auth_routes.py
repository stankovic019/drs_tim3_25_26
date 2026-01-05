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
        password_hash=generate_password_hash(data["password"], method="pbkdf2:sha256:600000")
    )

    db.session.add(user)
    db.session.commit()

    login_attempt = LoginAttempt(user_id=user.id)
    db.session.add(login_attempt)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# ---------------- LOGIN ----------------
LOCK_MINUTES = 1  

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    now = datetime.utcnow()

    if user.locked_until and user.locked_until > now:
        return jsonify({"message": "Account is locked. Try again later."}), 423

    if not check_password_hash(user.password_hash, password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1

        if user.failed_login_attempts >= 3:
            user.locked_until = now + timedelta(minutes=LOCK_MINUTES)
            user.failed_login_attempts = 0

        db.session.commit()
        return jsonify({"message": "Invalid credentials"}), 401

    # Successful login
    user.failed_login_attempts = 0
    user.locked_until = None
    db.session.commit()

    token = create_access_token(identity=user.id, additional_claims={"role": user.role})
    return jsonify({"access_token": token, "role": user.role}), 200
