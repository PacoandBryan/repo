# Google Cloud Platform Migration Guide

This guide describes how to migrate the Diky Catalog SQL database and Python backend to Google Cloud (GCP).

## Phase 1: Cloud SQL (PostgreSQL) Setup

1. **Create a Cloud SQL Instance**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Search for "Cloud SQL" and click **Create Instance**.
   - Choose **PostgreSQL**.
   - Use the following settings (to match existing config or choose your own):
     - Instance ID: `diky-db`
     - Password: `diky_password_2024`
     - Database Version: PostgreSQL 15 or 14.
   - Under **Connections**, enable **Public IP** (or Private Service Access for better security).
   - Under **Authorized Networks**, add your current IP address to allow migration.

2. **Create the Database and User**:
   - Once instance is created, go to the **Databases** tab and create `diky_db`.
   - Go to the **Users** tab and create `diky_user` with password `diky_password_2024`.

3. **Initialize Schema**:
   - Run the provided SQL script against your new instance:
   ```bash
   psql "host=<INSTANCE_IP> user=diky_user dbname=diky_db" -f backend/setup_database.sql
   ```

## Phase 2: Compute Engine (Free Tier VM) Setup

1. **Connect to your VM**:
   - In Cloud Shell, run:
   ```bash
   gcloud compute ssh diky-server --zone=us-central1-f
   ```

2. **Run the Setup Script**:
   - Save the `vm_setup.sh` content to a file on the VM (e.g. `nano setup.sh`, paste, save).
   - Run it: `bash setup.sh`

3. **Upload Code**:
   - From your LOCAL terminal (where the code is), use `gcloud` or `scp` to upload the backend folder.
   
   *Wait for next instructions from AI on exact upload command.*


## Persistent Storage Note
Cloud Run is stateless. Images uploaded to `backend/uploads/` will be lost when the instance restarts. 
To persist images, it is recommended to:
1. Use **Google Cloud Storage** for media files.
2. Update `app.config['UPLOADS_FOLDER']` to use a GCS bucket.
o