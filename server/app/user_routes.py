from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.extensions import db
from app.models import User
from app.dto import UserDTO

user_bp = Blueprint("user", __name__, url_prefix="/api/users")


# ---------------- GET MY USER DATA ----------------
@user_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_my_user(user_id):
    current_user_id = int(get_jwt_identity())

    # STRIKTNO: možeš samo svoj ID
    if current_user_id != user_id:
        return jsonify({"message": "Forbidden"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(UserDTO.from_model(user).to_dict()), 200


# ---------------- UPDATE MY USER DATA ----------------
@user_bp.route("/<int:user_id>", methods=["PATCH"])
@jwt_required()
def update_my_user(user_id):
    current_user_id = int(get_jwt_identity())

    # STRIKTNO: možeš samo sebe
    if current_user_id != user_id:
        return jsonify({"message": "Forbidden"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json() or {}

    # ZABRANJENA POLJA
    forbidden_fields = {"id", "email", "role", "createdAt"}
    if any(field in data for field in forbidden_fields):
        return jsonify({"message": "Attempt to modify forbidden fields"}), 400

    # DOZVOLJENA POLJA (partial update)
    if "firstName" in data:
        user.first_name = data["firstName"].strip()

    if "lastName" in data:
        user.last_name = data["lastName"].strip()

    if "birthDate" in data:
        try:
            user.birth_date = datetime.strptime(
                data["birthDate"], "%Y-%m-%d"
            ).date()
        except ValueError:
            return jsonify({"message": "birthDate must be YYYY-MM-DD"}), 400

    if "gender" in data:
        user.gender = data["gender"].strip()

    if "country" in data:
        user.country = data["country"].strip()

    if "street" in data:
        user.street = data["street"].strip()

    if "streetNumber" in data:
        user.street_number = data["streetNumber"].strip()

    if "profileImage" in data:
        user.profile_image = data["profileImage"]

    db.session.commit()

    return jsonify({
        "message": "User updated successfully",
        "id": user.id
    }), 200
