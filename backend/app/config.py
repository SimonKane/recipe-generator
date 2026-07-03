import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/food_recipes")
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS settings
    allowed_origins: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",  # Added for your frontend
        "http://localhost:8081",  # Added for your frontend (alternative port)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:8080",  # Added for your frontend
        "http://127.0.0.1:8081",  # Added for your frontend (alternative port)
    ]

settings = Settings()