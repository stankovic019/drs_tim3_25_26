class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://user:password@127.0.0.1:5433/quiz_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "super-secret-key"
