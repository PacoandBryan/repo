#!/bin/bash

# Configuration
DB_HOST="136.115.219.82"
DB_USER="dikyluzsql"
DB_NAME="diky_db"
DUMP_FILE="backend/diky_dump.sql"

# Export password to avoid prompt
export PGPASSWORD='I8C)"&5,=TYPbFBU'

echo "Checking connection to Cloud SQL..."
# Try to connect to postgres db to verify connectivity
PGCONNECT_TIMEOUT=10 psql -h $DB_HOST -U $DB_USER -d postgres -c "SELECT 1;" > /dev/null 2>&1


if [ $? -ne 0 ]; then
    echo "Error: Could not connect to database at $DB_HOST."
    echo "Please ensure your IP address ($(curl -s ifconfig.me)) is added to the 'Authorized Networks' in Google Cloud Console."
    exit 1
fi

echo "Creating database '$DB_NAME' if it doesn't exist..."
# Create database (ignore error if exists)
psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database might already exist, continuing..."

echo "Importing data from $DUMP_FILE..."
# Import data
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $DUMP_FILE

echo "Migration completed!"
