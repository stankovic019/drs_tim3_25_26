@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   DRS Quiz - MySQL Docker Starter
echo ========================================
echo.

:: Kreiranje .env fajla ako ne postoji
if not exist .env (
    echo .env file not found. Creating new one...
    echo.
    echo Enter the MySQL root password:
    set /p MYSQL_ROOT_PASSWORD=
    echo Enter the MySQL user username:
    set /p MYSQL_USER=
    echo Enter the MySQL user password:
    set /p MYSQL_PASSWORD=
    (
        echo MYSQL_ROOT_PASSWORD=!MYSQL_ROOT_PASSWORD!
        echo MYSQL_USER=!MYSQL_USER!
        echo MYSQL_PASSWORD=!MYSQL_PASSWORD!
    ) > .env
    echo .env file created successfully.
    echo.
) else (
    echo .env file already exists. Skipping creation.
    echo.
)

:: Učitavanje kredencijala iz .env fajla
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="MYSQL_ROOT_PASSWORD" set MYSQL_ROOT_PASSWORD=%%b
    if "%%a"=="MYSQL_USER" set MYSQL_USER=%%b
    if "%%a"=="MYSQL_PASSWORD" set MYSQL_PASSWORD=%%b
)

:: Putanja do Docker Desktop
set dockerPath="C:\Program Files\Docker\Docker Desktop.exe"

:: Proveravamo da li Docker radi
echo [1/7] Checking if Docker Desktop is running...
tasklist /FI "IMAGENAME eq Docker Desktop.exe" /NH | find "Docker Desktop.exe" >nul
if %errorlevel% neq 0 (
    echo Starting Docker Desktop...
    start "" %dockerPath%
    echo Waiting for Docker Desktop to start...
) else (
    echo Docker Desktop is already running.
)
echo.

:: Podesavamo Docker context
echo [2/7] Setting Docker context to default...
docker context use default
echo.

:: Cekamo da Docker bude spreman
echo [3/7] Waiting for Docker to be ready...
set maxWait=300
set interval=5
set elapsed=0

:waitLoop
docker ps >nul 2>&1
if %errorlevel% equ 0 goto ready
echo Docker not ready yet, waiting...
timeout /t %interval% /nobreak >nul
set /a elapsed+=interval
if %elapsed% lss %maxWait% goto waitLoop
echo Timeout: Docker did not become ready within %maxWait% seconds.
pause
exit /b 1

:ready
echo Docker is ready!
echo.

:: Proveravamo da li postoji stari container
echo [4/7] Checking for existing containers...
docker ps -a | find "DRS_quiz" >nul
if %errorlevel% equ 0 (
    echo Found existing DRS_quiz container.
    echo Stopping and removing it...
    docker stop DRS_quiz >nul 2>&1
    docker rm DRS_quiz >nul 2>&1
    echo Old container removed.
)
echo.

:: Proveravamo da li postoji stari volume
echo [5/7] Checking for existing volumes...
docker volume ls | find "mysql_data" >nul
if %errorlevel% equ 0 (
    echo Found existing mysql_data volume.
    echo Removing it to ensure fresh database creation...
    docker volume rm database_mysql_data >nul 2>&1
    echo Old volume removed.
)
echo.

:: Pokretanje docker-compose sa retry logikom
echo [6/7] Starting Docker Compose...
set maxRetries=10
set retryCount=0

:composeLoop
set /a attempt=retryCount+1
echo Running docker compose up -d... (attempt %attempt%)
docker compose up -d > output.txt 2>&1
set exit_code=%errorlevel%
if %exit_code% equ 0 (
    echo Docker Compose started successfully.
    goto waitForMySQL
) else (
    findstr "unable to get image" output.txt >nul
    if %errorlevel% equ 0 (
        echo Error detected: unable to get image. Retrying in 5 seconds...
        timeout /t 5 /nobreak >nul
        set /a retryCount+=1
        if %retryCount% lss %maxRetries% goto composeLoop
        echo Max retries reached. Failed to start.
        type output.txt
        pause
        exit /b 1
    ) else (
        echo Failed with other error.
        type output.txt
        pause
        exit /b 1
    )
)

:waitForMySQL
echo.
echo [7/7] Waiting for MySQL to initialize databases...
echo This may take 15-20 seconds...
timeout /t 15 /nobreak >nul
echo.

:: Provera baza podataka
echo ========================================
echo   Checking Databases
echo ========================================
docker exec -it DRS_quiz mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "SHOW DATABASES;" 2>nul
if %errorlevel% neq 0 (
    echo.
    echo Warning: Could not connect to MySQL yet.
    echo Waiting 10 more seconds...
    timeout /t 10 /nobreak >nul
    docker exec -it DRS_quiz mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "SHOW DATABASES;" 2>nul
)
echo.

:: Provera USER_DATA tabela
echo ========================================
echo   USER_DATA Tables
echo ========================================
docker exec -it DRS_quiz mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "USE USER_DATA; SHOW TABLES;" 2>nul
echo.

:: Provera QUIZZES_DATA tabela
echo ========================================
echo   QUIZZES_DATA Tables
echo ========================================
docker exec -it DRS_quiz mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -e "USE QUIZZES_DATA; SHOW TABLES;" 2>nul
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo MySQL is running on:
echo   Host: localhost
echo   Port: 5002
echo   User: %MYSQL_USER%
echo   Password: HIDDEN
echo.
echo To connect: docker exec -it DRS_quiz mysql -u %MYSQL_USER% -pHIDDEN
echo.
pause