#!/bin/bash

# Configuration
VM_NAME="diky-server"
ZONE="us-central1-f"
PROJECT="project-19e3f626-be4e-4f17-8aa"
DB_USER="diky_user"
DB_NAME="diky_db"
DB_PASS="diky_password_2024"

# 1. Update OS and Install Dependecies
echo "=== Updating OS and Installing Software ==="
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv postgresql postgresql-contrib nginx git

# 2. Setup PostgreSQL
echo "=== Setting up Database ==="
# Start Postgres
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create User and Database
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# 3. Setup Project Directory
echo "=== Setting up Application ==="
# Create directory
sudo mkdir -p /var/www/diky-backend
sudo chown -R $USER:$USER /var/www/diky-backend

# 4. Clone/Copy application files will happen via upload later
# For now, we create a placeholder virtualenv
cd /var/www/diky-backend
python3 -m venv venv

echo "=== VM Setup Complete! Ready for file upload. ==="
