#!/bin/bash

echo "========================================"
echo "  DRS Quiz - MySQL Docker Starter"
echo "========================================"
echo ""

# Kreiranje .env fajla ako ne postoji
if [ ! -f .env ]; then
    echo ".env file not found. Creating new one..."
    echo ""
    read -p "Enter the MySQL root password: " MYSQL_ROOT_PASSWORD
    read -p "Enter the MySQL user username: " MYSQL_USER
    read -p "Enter the MySQL user password: " MYSQL_PASSWORD
    
    cat > .env << EOF
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASSWORD
EOF
    echo ".env file created successfully."
    echo ""
else
    echo ".env file already exists. Skipping creation."
    echo ""
fi

# Učitavanje kredencijala iz .env fajla
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Proveravamo da li Docker radi
echo "[1/7] Checking if Docker is running..."
if ! docker ps > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi
echo "Docker is running!"
echo ""

# Postavljamo Docker context
echo "[2/7] Setting Docker context to default..."
docker context use default > /dev/null 2>&1
echo ""

# Čekamo da Docker bude potpuno spreman
echo "[3/7] Waiting for Docker to be ready..."
maxWait=300
interval=5
elapsed=0

while ! docker ps > /dev/null 2>&1; do
    echo "Docker not ready yet, waiting..."
    sleep $interval
    elapsed=$((elapsed + interval))
    if [ $elapsed -ge $maxWait ]; then
        echo "Timeout: Docker did not become ready within $maxWait seconds."
        exit 1
    fi
done
echo "Docker is ready!"
echo ""

# Proveravamo da li postoji stari container
echo "[4/7] Checking for existing containers..."
if docker ps -a | grep -q "DRS_quiz"; then
    echo "Found existing DRS_quiz container."
    echo "Stopping and removing it..."
    docker stop DRS_quiz > /dev/null 2>&1
    docker rm DRS_quiz > /dev/null 2>&1
    echo "Old container removed."
fi
echo ""

# Proveravamo da li postoji stari volume
echo "[5/7] Checking for existing volumes..."
if docker volume ls | grep -q "mysql_data"; then
    echo "Found existing mysql_data volume."
    echo "Removing it to ensure fresh database creation..."
    docker volume rm database_mysql_data > /dev/null 2>&1
    echo "Old volume removed."
fi
echo ""

# Pokretanje docker-compose sa retry logikom
echo "[6/7] Starting Docker Compose..."
maxRetries=10
retryCount=0

while [ $retryCount -lt $maxRetries ]; do
    attempt=$((retryCount + 1))
    echo "Running docker compose up -d... (attempt $attempt)"
    
    if docker compose up -d > output.txt 2>&1; then
        echo "Docker Compose started successfully."
        break
    else
        if grep -q "unable to get image" output.txt; then
            echo "Error detected: unable to get image. Retrying in 5 seconds..."
            sleep 5
            retryCount=$((retryCount + 1))
        else
            echo "Failed with other error."
            cat output.txt
            exit 1
        fi
    fi
    
    if [ $retryCount -ge $maxRetries ]; then
        echo "Max retries reached. Failed to start."
        cat output.txt
        exit 1
    fi
done
echo ""

# Čekanje da MySQL bude spreman
echo "[7/7] Waiting for MySQL to initialize databases..."
echo "This may take 15-20 seconds..."
sleep 15
echo ""

# Provera baza podataka
echo "========================================"
echo "  Checking Databases"
echo "========================================"
docker exec -it DRS_quiz mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -e "SHOW DATABASES;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo ""
    echo "Warning: Could not connect to MySQL yet."
    echo "Waiting 10 more seconds..."
    sleep 10
    docker exec -it DRS_quiz mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -e "SHOW DATABASES;" 2>/dev/null
fi
echo ""

# Provera USER_DATA tabela
echo "========================================"
echo "  USER_DATA Tables"
echo "========================================"
docker exec -it DRS_quiz mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -e "USE USER_DATA; SHOW TABLES;" 2>/dev/null
echo ""

# Provera QUIZZES_DATA tabela
echo "========================================"
echo "  QUIZZES_DATA Tables"
echo "========================================"
docker exec -it DRS_quiz mysql -u $MYSQL_USER -p$MYSQL_PASSWORD -e "USE QUIZZES_DATA; SHOW TABLES;" 2>/dev/null
echo ""

echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "MySQL is running on:"
echo "  Host: localhost"
echo "  Port: 5002"
echo "  User: $MYSQL_USER"
echo "  Password: $MYSQL_PASSWORD"
echo ""
echo "To connect: docker exec -it DRS_quiz mysql -u $MYSQL_USER -p$MYSQL_PASSWORD"
echo ""