#!/bin/bash

# Configuration
INSTANCE_CONNECTION_NAME="project-19e3f626-be4e-4f17-8aa:us-central1:dikyluzsql"
# Password is URL-encoded: I8C)"&5,=TYPbFBU  ->  I8C%29%22%265%2C%3DTYPbFBU
DB_PASS="I8C%29%22%265%2C%3DTYPbFBU"
DB_USER="dikyluzsql"
DB_NAME="diky_db"

# Connection string using Unix Socket (Standard for Cloud Run)
DB_URL="postgresql://${DB_USER}:${DB_PASS}@/${DB_NAME}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"

echo "Deploying diky-backend to Cloud Run..."
echo "Using Instance: $INSTANCE_CONNECTION_NAME"

gcloud run deploy diky-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
  --set-env-vars "DATABASE_URL=$DB_URL"

echo "Deployment command sent."
