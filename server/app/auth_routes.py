from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.extensions import db
from app.models import User, TokenBlocklist

def require_role(*allowed_roles):
    claims = get_jwt()
    role = claims.get("role")
    if role not in allowed_roles:
        return False
    return True

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# ---------------- REGISTER ----------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    first_name = (data.get("firstName") or "").strip()
    last_name = (data.get("lastName") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    birth_date_str = (data.get("birthDate") or data.get("birth_date") or "").strip()
    gender = (data.get("gender") or "").strip()
    country = (data.get("country") or "").strip()
    street = (data.get("street") or "").strip()
    street_number = (data.get("streetNumber") or data.get("street_number") or "").strip()

    if not first_name or not last_name or not email or not password:
        return jsonify({"message": "firstName, lastName, email and password are required"}), 400

    if not birth_date_str or not gender or not country or not street or not street_number:
        return jsonify({"message": "birthDate, gender, country, street and streetNumber are required"}), 400

    try:
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "birthDate must be in format YYYY-MM-DD"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password_hash=generate_password_hash(password, method="pbkdf2:sha256:600000"),
        birth_date=birth_date,
        gender=gender,
        country=country,
        street=street,
        street_number=street_number,
        profile_image=None,  
        failed_login_attempts=0,
        locked_until=None,
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# ---------------- LOGIN ----------------
LOCK_MINUTES = 15 

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

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"access_token": token, "role": user.role}), 200


# ---------------- LOGOUT ----------------
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    db.session.add(TokenBlocklist(jti=jti))
    db.session.commit()
    return jsonify({"message": "Logged out"}), 200

# ---------------- KORISNIK ----------------
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "email": user.email,
        "role": user.role
    }), 200

# ---------------- ADMIN USERS ----------------
@auth_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    claims = get_jwt()
    if claims.get("role") != "ADMIN":
        return jsonify({"message": "Forbidden"}), 403

    users = User.query.order_by(User.id.asc()).all()
    return jsonify([
        {
            "id": u.id,
            "firstName": u.first_name,
            "lastName": u.last_name,
            "email": u.email,
            "role": u.role,
            "createdAt": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]), 200

# ---------------- ADMIN POSTAVI USER ROLE ----------------
@auth_bp.route("/users/<int:user_id>/role", methods=["PATCH"])
@jwt_required()
def set_user_role(user_id):
    claims = get_jwt()
    if claims.get("role") != "ADMIN":
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    new_role = (data.get("role") or "").strip().upper()

    if new_role not in ("PLAYER", "MODERATOR", "ADMIN"):
        return jsonify({"message": "Invalid role"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.role = new_role
    db.session.commit()

    return jsonify({"message": "Role updated", "id": user.id, "role": user.role}), 200


# ---------------- ADMIN: sve informacije o korisnicima ----------------
@auth_bp.route("/admin/all_users", methods=["GET"])
@jwt_required()
def admin_get_all_users():
    # Provera da li je trenutni korisnik ADMIN
    claims = get_jwt()
    if claims.get("role") != "ADMIN":
        return jsonify({"message": "Forbidden"}), 403

    # Dohvati sve korisnike iz baze
    users = User.query.order_by(User.id.asc()).all()

    # Pretvori u JSON niz
    users_list = [
        {
            "id": u.id,
            "firstName": u.first_name,
            "lastName": u.last_name,
            "email": u.email,
            "role": u.role,
            "birthDate": u.birth_date.isoformat() if u.birth_date else None,
            "gender": u.gender,
            "country": u.country,
            "street": u.street,
            "streetNumber": u.street_number,
            "profileImage": u.profile_image,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
            "failedLoginAttempts": u.failed_login_attempts,
            "lockedUntil": u.locked_until.isoformat() if u.locked_until else None
        }
        for u in users
    ]

    return jsonify(users_list), 200
