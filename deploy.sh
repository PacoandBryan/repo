#!/bin/bash
# deploy.sh - Script to deploy Diky Price & Promotions system

# Configuration
PROJECT_ID="project-19e3f626-be4e-4f17-8aa"
ZONE="us-central1-f"
INSTANCE_NAME="diky-server"

echo "🚀 Starting deployment to $INSTANCE_NAME..."

# 1. Build Frontend
echo "📦 Building frontend..."
npm run build

# 2. Upload Backend Changes
echo "📤 Uploading backend files..."
gcloud compute scp \
  backend/app/catalog_models.py \
  backend/app/routes/catalog_api.py \
  backend/app/routes/admin.py \
  $INSTANCE_NAME:~/ \
  --zone=$ZONE --project=$PROJECT_ID

# 3. Upload Frontend Dist
echo "📤 Uploading frontend assets..."
tar -czf dist.tar.gz -C dist .
gcloud compute scp dist.tar.gz $INSTANCE_NAME:~/ --zone=$ZONE --project=$PROJECT_ID
rm dist.tar.gz

# 4. Upload Nginx Config
echo "📤 Uploading Nginx configuration..."
gcloud compute scp nginx_diky.conf $INSTANCE_NAME:~/ --zone=$ZONE --project=$PROJECT_ID

# 5. Apply Changes on VM
echo "🔧 Applying changes on VM..."
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID --command="
  # Move backend files
  sudo cp ~/catalog_models.py /var/www/diky-backend/app/catalog_models.py
  sudo cp ~/catalog_api.py /var/www/diky-backend/app/routes/catalog_api.py
  sudo cp ~/admin.py /var/www/diky-backend/app/routes/admin.py
  
  # Deploy frontend
  sudo mkdir -p /var/www/html
  sudo rm -rf /var/www/html/*
  sudo tar -xzf ~/dist.tar.gz -C /var/www/html
  sudo chown -R www-data:www-data /var/www/html
  
  # Update Nginx
  sudo cp ~/nginx_diky.conf /etc/nginx/sites-available/default
  sudo nginx -t && sudo systemctl reload nginx
  
  # Restart gunicorn via systemd
  sudo systemctl restart diky-backend
  
  echo '✅ VM changes applied, Nginx reloaded, and backend restarted via systemd.'
"

echo "🎉 Deployment complete!"
