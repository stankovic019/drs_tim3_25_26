import os
from dotenv import load_dotenv
from pathlib import Path

# putanja do /server/.env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Config:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5002")
    DB_USER = os.getenv("DB_USER", "drs")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "1234")
    
    # Dve odvojene baze podataka
    USER_DB_NAME = os.getenv("USER_DB_NAME", "USER_DATA")
    QUIZ_DB_NAME = os.getenv("QUIZ_DB_NAME", "QUIZZES_DATA")
    
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    # Glavna baza (user data)
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{USER_DB_NAME}"
    )
    
    # Binds - mapiranje modela na baze
    SQLALCHEMY_BINDS = {
        'user_data': f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{USER_DB_NAME}",
        'quiz_data': f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{QUIZ_DB_NAME}"
    }
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True  # Debug SQL queries

# Debug print
print(f"USER_DATA database: {Config.USER_DB_NAME}")
print(f"QUIZZES_DATA database: {Config.QUIZ_DB_NAME}")
print(f"DB_HOST: {Config.DB_HOST}:{Config.DB_PORT}")