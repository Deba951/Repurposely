import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")

    # Google Gemini API
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")

    # Stripe configuration
    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
    stripe_publishable_key: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    stripe_webhook_secret: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    class Config:
        env_file = ".env"

settings = Settings()
