from app import create_app
import os
from dotenv import load_dotenv

# Make sure .env file is loaded before app creation
load_dotenv()

# Debug environment variables
print("DEBUG: Environment variables at startup:")
print(f"DEBUG: ADMIN_EMAIL={os.getenv('ADMIN_EMAIL', 'not set')}")
print(f"DEBUG: ADMIN_PASSWORD masked length={len(os.getenv('ADMIN_PASSWORD', '')) if os.getenv('ADMIN_PASSWORD') else 0}")

app = create_app()

if __name__ == '__main__':
    app.run(debug=True) 