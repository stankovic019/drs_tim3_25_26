from flask import request
from flask_jwt_extended import decode_token
from flask_socketio import join_room

from app.models import TokenBlocklist


def register_socket_handlers(socketio):
    @socketio.on("connect")
    def handle_connect(auth):
        token = None
        if isinstance(auth, dict):
            token = auth.get("token")

        if not token:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1].strip()

        if not token:
            return False

        try:
            payload = decode_token(token)
        except Exception:
            return False

        jti = payload.get("jti")
        if jti and TokenBlocklist.query.filter_by(jti=jti).first():
            return False

        user_id = payload.get("sub")
        if user_id is not None:
            join_room(f"user:{user_id}")

        if payload.get("role") == "ADMIN":
            join_room("admins")
        return True
