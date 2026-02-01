#!/bin/bash

echo "========================================"
echo "  DRS Quiz - MySQL Docker Destroyer"
echo "========================================"
echo ""
echo "WARNING: This will PERMANENTLY delete:"
echo "  - DRS_quiz container"
echo "  - All database data"
echo "  - MySQL volume"
echo ""
read -p "Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi
echo ""

# Zaustavljanje i brisanje containera
echo "[1/3] Stopping and removing container..."
docker-compose down
docker stop DRS_quiz > /dev/null 2>&1
docker rm DRS_quiz > /dev/null 2>&1
echo "Container removed."
echo ""

# Brisanje volume-a
echo "[2/3] Removing volumes..."
docker volume rm database_mysql_data > /dev/null 2>&1
docker volume prune -f > /dev/null 2>&1
echo "Volumes removed."
echo ""

# Provera
echo "[3/3] Verifying cleanup..."
if docker ps -a | grep -q "DRS_quiz"; then
    echo "WARNING: Container still exists!"
else
    echo "Container successfully removed."
fi

if docker volume ls | grep -q "mysql_data"; then
    echo "WARNING: Volume still exists!"
else
    echo "Volume successfully removed."
fi
echo ""

echo "========================================"
echo "  Cleanup Complete!"
echo "========================================"
echo ""
echo "All database data has been removed."
echo "Run start.sh to create a fresh setup."
echo ""