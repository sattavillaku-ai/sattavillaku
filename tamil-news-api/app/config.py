import os
from typing import List, Dict
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Supabase PostgreSQL Configuration
    SUPABASE_URL: str = Field(default="", description="Supabase project URL")
    SUPABASE_KEY: str = Field(default="", description="Supabase anon or service-role API key")

    # Scheduler Settings
    NEWS_FETCH_INTERVAL_MINUTES: int = Field(default=10, description="Interval in minutes between news fetches")

    # Server Configuration
    HOST: str = Field(default="0.0.0.0", description="Host to bind FastAPI server")
    PORT: int = Field(default=8000, description="Port to bind FastAPI server")
    ENVIRONMENT: str = Field(default="development", description="Environment mode")

    # CORS
    CORS_ORIGINS: str = Field(default="*", description="Allowed CORS origins comma-separated or *")

    # Tamil RSS Target Categories
    CATEGORIES: List[str] = [
        "தமிழ்நாடு",
        "சென்னை",
        "இந்தியா",
        "உலகம்",
        "அரசியல்",
        "வணிகம்",
        "தொழில்நுட்பம்",
        "விளையாட்டு",
        "சினிமா",
        "கல்வி",
        "வேலைவாய்ப்பு",
        "பங்குச்சந்தை"
    ]

    # Category search query overrides / expansions for better Google News RSS matches
    CATEGORY_QUERIES: Dict[str, str] = {
        "தமிழ்நாடு": "தமிழ்நாடு",
        "சென்னை": "சென்னை",
        "இந்தியா": "இந்தியா",
        "உலகம்": "உலகம்",
        "அரசியல்": "அரசியல்",
        "வணிகம்": "வணிகம்",
        "தொழில்நுட்பம்": "தொழில்நுட்பம்",
        "விளையாட்டு": "விளையாட்டு",
        "சினிமா": "சினிமா",
        "கல்வி": "கல்வி",
        "வேலைவாய்ப்பு": "வேலைவாய்ப்பு",
        "பங்குச்சந்தை": "பங்குச்சந்தை OR சென்செக்ஸ் OR நிஃப்டி"
    }

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "allow"


settings = Settings()
