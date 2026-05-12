from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://aura:aura123@localhost:5432/aura_db"
    DATABASE_URL_SYNC: str = "postgresql://aura:aura123@localhost:5432/aura_db"
    
    # Redis (Celery broker)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Anthropic
    ANTHROPIC_API_KEY: str
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    CLAUDE_HAIKU_MODEL: str = "claude-haiku-4-5-20251001"
    
    # App
    APP_NAME: str = "AURA Backend"
    DEBUG: bool = False
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    # Kargo gecikme eşiği (saat)
    CARGO_DELAY_THRESHOLD_HOURS: int = 48
    
    # Stok kritik eşiği
    LOW_STOCK_THRESHOLD: int = 10
    VERY_LOW_STOCK_THRESHOLD: int = 5
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()