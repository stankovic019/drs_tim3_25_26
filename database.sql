/* TABELA USERS */
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    birth_date DATE,
    gender VARCHAR(10),
    country VARCHAR(100),
    street VARCHAR(150),
    street_number VARCHAR(20),
    role VARCHAR(20) DEFAULT 'PLAYER', -- PLAYER | MODERATOR | ADMIN
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* TABELA LOGIN ATTEMPTS */
CREATE TABLE login_attempts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    failed_attempts INT DEFAULT 0,
    blocked_until TIMESTAMP
);

/* TABELA KVIZOVI */
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration_seconds INT NOT NULL,
    author_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING | APPROVED | REJECTED
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* TABELA PITANJA */
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    points INT NOT NULL
);

/* TABELA ODGOVORI */
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);

/* TABELA REZULTATI */
CREATE TABLE quiz_results (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(id),
    user_id INT,
    score INT,
    time_spent INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
