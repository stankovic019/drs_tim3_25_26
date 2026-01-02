from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, origins='*')

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify([
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"}
    ])

if __name__ == '__main__':
    app.run(debug=True, port=5000)

#python server/env/main.py for Windows
#python3 server/env/main.py for Mac/Linux
