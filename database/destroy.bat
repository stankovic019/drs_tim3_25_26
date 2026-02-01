@echo off
echo ========================================
echo   DRS Quiz - MySQL Docker Destroyer
echo ========================================
echo.
echo WARNING: This will PERMANENTLY delete:
echo   - DRS_quiz container
echo   - All database data
echo   - MySQL volume
echo.
set /p confirm="Are you sure? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Operation cancelled.
    pause
    exit /b 0
)
echo.

:: Zaustavljanje i brisanje containera
echo [1/3] Stopping and removing container...
docker-compose down
docker stop DRS_quiz >nul 2>&1
docker rm DRS_quiz >nul 2>&1
echo Container removed.
echo.

:: Brisanje volume-a
echo [2/3] Removing volumes...
docker volume rm database_mysql_data >nul 2>&1
docker volume prune -f >nul 2>&1
echo Volumes removed.
echo.

:: Provera
echo [3/3] Verifying cleanup...
docker ps -a | find "DRS_quiz" >nul
if %errorlevel% equ 0 (
    echo WARNING: Container still exists!
) else (
    echo Container successfully removed.
)

docker volume ls | find "mysql_data" >nul
if %errorlevel% equ 0 (
    echo WARNING: Volume still exists!
) else (
    echo Volume successfully removed.
)
echo.

echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo All database data has been removed.
echo Run start.bat to create a fresh setup.
echo.
pause