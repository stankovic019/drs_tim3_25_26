import os
import time
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import User

upload_bp = Blueprint("upload", __name__, url_prefix="/api/upload")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route("/profile-image", methods=["POST"])
@jwt_required()
def upload_profile_image():
    if "file" not in request.files:
        return jsonify({"message": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"message": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"message": "Invalid file type"}), 400

    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    original_filename = secure_filename(file.filename)
    ext = original_filename.rsplit(".", 1)[1].lower()
    new_filename = f"{int(time.time())}.{ext}"

    upload_folder = os.path.join(current_app.root_path, "..", "uploads")
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, new_filename)
    file.save(file_path)

    # PUN URL DO SLIKE
    image_url = f"{request.host_url.rstrip('/')}/uploads/{new_filename}"

    user.profile_image = image_url
    db.session.commit()

    return jsonify({
        "message": "Image uploaded successfully",
        "imageUrl": image_url
    }), 201
