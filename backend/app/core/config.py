# backend/app/core/config.py

import os
from pydantic import BaseSettings, AnyHttpUrl # Correction: Importer depuis pydantic (v1)
from typing import Optional, List, Union, Any

class Settings(BaseSettings):
    """Configuration globale de l'application, chargée depuis .env ou variables d'environnement."""

    # Informations sur l'application
    APP_NAME: str = "CarbonScope AI"
    API_V1_STR: str = "/api/v1"
    PROJECT_ROOT: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) # Chemin vers la racine du projet backend

    # Sécurité et authentification
    # !! IMPORTANT: Définissez une clé SECRÈTE et FORTE dans votre fichier .env !!
    SECRET_KEY: str = "votre_super_secret_key_a_remplacer_dans_env" # Default peu sûr, juste pour démarrer
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 jours

    # Configuration MongoDB (Priorité: .env > Variables système)
    USE_MONGODB_ATLAS: bool = False # Par défaut sur False, surcharger via .env pour utiliser Atlas
    MONGODB_ATLAS_URL: Optional[str] = None # Sera chargé depuis .env si USE_MONGODB_ATLAS=True
    MONGODB_LOCAL_HOST: str = "localhost"
    MONGODB_LOCAL_PORT: int = 27017
    DATABASE_NAME: str = "carbonscope"

    # Chemin vers les données (Utilise PROJECT_ROOT pour être plus robuste)
    # Note: Si 'resultats' est en dehors du dossier 'backend', ajustez le chemin relatif à PROJECT_ROOT
    # Par exemple: DATA_PATH: str = os.path.join(os.path.dirname(PROJECT_ROOT), "resultats", "donnees_application.json")
    # Si 'resultats' est DANS 'backend', ce serait:
    DATA_PATH: str = os.path.join(os.path.dirname(PROJECT_ROOT), "resultats", "donnees_application.json")
    METADATA_PATH: str = os.path.join(os.path.dirname(PROJECT_ROOT), "resultats", "metadonnees.json")

    # Configuration CORS (Chargée depuis l'environnement, fallback pour dev local)
    # Utilisez une chaîne séparée par des virgules dans .env, ex: "http://localhost:3000,https://votre-frontend.vercel.app"
    BACKEND_CORS_ORIGINS_STR: str = "http://localhost:3000" # String lue depuis l'env ou default
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [] # Liste qui sera populée

    # Configuration de l'environnement
    DEBUG: bool = False # Par défaut False pour la production, surcharger avec DEBUG=True dans .env pour dev

    # Logique pour populer BACKEND_CORS_ORIGINS à partir de la chaîne
    def __init__(self, **values: Any):
        super().__init__(**values)
        self.BACKEND_CORS_ORIGINS = [origin.strip() for origin in self.BACKEND_CORS_ORIGINS_STR.split(",") if origin.strip()]

    class Config:
        env_file = ".env"           # Nom du fichier à lire
        env_file_encoding = 'utf-8' # Encodage du fichier .env
        case_sensitive = True       # Respecter la casse des variables d'environnement

# Instance unique des paramètres
settings = Settings()

# Afficher un avertissement si la clé secrète par défaut est utilisée
if settings.SECRET_KEY == "votre_super_secret_key_a_remplacer_dans_env":
    import warnings
    warnings.warn("ATTENTION: Utilisation de la SECRET_KEY par défaut. Définissez une clé forte dans le fichier .env pour la production !", stacklevel=2)