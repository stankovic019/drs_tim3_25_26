import eventlet
eventlet.monkey_patch()

import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, socketio
from app.auth_routes import auth_bp
from app.quiz_routes import quiz_bp
from app.user_routes import user_bp
from app.upload import upload_bp
from app.socket_handlers import register_socket_handlers

import app.jwt_list  # registruje jwt callbacks


app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins="*")

# uploads folder VAN app/
UPLOAD_FOLDER = os.path.join(app.root_path, "..", "uploads")

# static route za slike
@app.route("/uploads/<path:filename>")
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# init ekstenzija
db.init_app(app)
jwt.init_app(app)
socketio.init_app(app, cors_allowed_origins="*")
register_socket_handlers(socketio)

# blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(user_bp)
app.register_blueprint(upload_bp)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True, use_reloader=False)
