from pydantic_settings import BaseSettings
from typing import Optional, Dict, Any, List
import secrets
from datetime import timedelta


class Settings(BaseSettings):
    """Configuration globale de l'application."""
    
    # Informations sur l'application
    APP_NAME: str = "CarbonScope AI"
    API_V1_STR: str = "/api/v1"
    
    # Sécurité et authentification
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 jours
    
    # Configuration MongoDB
    USE_MONGODB_ATLAS: bool = False
    MONGODB_ATLAS_URL: Optional[str] = None
    MONGODB_LOCAL_HOST: str = "localhost"
    MONGODB_LOCAL_PORT: int = 27017
    DATABASE_NAME: str = "carbonscope"
    
    # Chemin vers les données
    DATA_PATH: str = "../resultats/donnees_application.json"
    METADATA_PATH: str = "../resultats/metadonnees.json"
    
    # Configuration CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Configuration de l'environnement
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
