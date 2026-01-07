from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db, jwt
from auth_routes import auth_bp
from quiz_routes import quiz_bp
import jwt_list 

app = Flask(__name__)
app.config.from_object(Config)
cors = CORS(app, origins='*')

db.init_app(app)
jwt.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(quiz_bp)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

#python server/env/main.py for Windows
#python3 server/env/main.py for Mac/Linux
