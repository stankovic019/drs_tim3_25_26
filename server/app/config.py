class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://user:password@localhost:5432/quiz_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "super-secret-key"
