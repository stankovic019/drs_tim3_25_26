-- Davanje privilegija korisniku 'drs' na obe baze
GRANT ALL PRIVILEGES ON USER_DATA.* TO 'drs'@'%';
GRANT ALL PRIVILEGES ON QUIZZES_DATA.* TO 'drs'@'%';
FLUSH PRIVILEGES;
