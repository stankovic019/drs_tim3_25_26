from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.extensions import db, jwt
from app.auth_routes import auth_bp
from app.quiz_routes import quiz_bp
import app.jwt_list  # ako je u app folderu, može: from app import jwt_list

app = Flask(__name__)
app.config.from_object(Config)
cors = CORS(app, origins='*')

db.init_app(app)   # povezuje SQLAlchemy sa Flask app
jwt.init_app(app)  # povezuje JWT sa Flask app

app.register_blueprint(auth_bp)
app.register_blueprint(quiz_bp)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # kreira sve tabele definisane u modelima
    app.run(debug=True)
