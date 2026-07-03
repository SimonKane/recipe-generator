import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./food_recipes.db")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    free_ai_enabled: bool = os.getenv("FREE_AI_ENABLED", "true").lower() == "true"
    one_generation_per_client: bool = os.getenv("ONE_GENERATION_PER_CLIENT", "true").lower() == "true"
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
