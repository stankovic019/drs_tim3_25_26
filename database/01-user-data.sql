CREATE DATABASE IF NOT EXISTS USER_DATA;

CREATE TABLE IF NOT EXISTS USER_DATA.users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    birth_date DATE,
    gender VARCHAR(10),
    country VARCHAR(100),
    street VARCHAR(150),
    street_number VARCHAR(20),
    profile_image TEXT,
    role VARCHAR(20),
    created_at DATETIME,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME
);

CREATE TABLE IF NOT EXISTS USER_DATA.login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    failed_attempts INT,
    blocked_until DATETIME
);
