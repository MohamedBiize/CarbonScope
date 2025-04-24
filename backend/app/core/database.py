# backend/app/core/database.py

from motor.motor_asyncio import AsyncIOMotorClient # Utiliser Motor pour async
from pymongo.server_api import ServerApi
import asyncio

# Importer l'instance unique des settings
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_manager = Database()

async def connect_to_mongo():
    """Établit la connexion à MongoDB au démarrage de l'application."""
    print("Tentative de connexion à MongoDB...")
    if settings.USE_MONGODB_ATLAS:
        if not settings.MONGODB_ATLAS_URL:
            raise ValueError("USE_MONGODB_ATLAS est True mais MONGODB_ATLAS_URL n'est pas défini dans .env")
        print(f"Connexion à MongoDB Atlas...")
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_ATLAS_URL,
            server_api=ServerApi("1") # Bonne pratique pour Atlas
        )
    else:
        print(f"Connexion à MongoDB local ({settings.MONGODB_LOCAL_HOST}:{settings.MONGODB_LOCAL_PORT})...")
        db_manager.client = AsyncIOMotorClient(
            host=settings.MONGODB_LOCAL_HOST,
            port=settings.MONGODB_LOCAL_PORT
        )

    # Vérifier la connexion (optionnel mais recommandé)
    try:
        # The ismaster command is cheap and does not require auth.
        await db_manager.client.admin.command('ping')
        print("Connexion MongoDB réussie !")
    except Exception as e:
        print(f"Erreur de connexion MongoDB: {e}")
        raise

    db_manager.db = db_manager.client[settings.DATABASE_NAME]
    print(f"Connecté à la base de données '{settings.DATABASE_NAME}'")

async def close_mongo_connection():
    """Ferme la connexion MongoDB à l'arrêt de l'application."""
    if db_manager.client:
        print("Fermeture de la connexion MongoDB.")
        db_manager.client.close()

def get_database() -> AsyncIOMotorClient: # Renvoie le client DB Motor
    """Récupère l'instance de la base de données Motor."""
    if db_manager.db is None:
        # Ceci ne devrait pas arriver si connect_to_mongo est appelé au démarrage
        raise Exception("La base de données n'est pas initialisée. Assurez-vous d'appeler connect_to_mongo au démarrage.")
    return db_manager.db # Retourne l'objet Database de Motor

# Note: Pour utiliser cette connexion dans FastAPI, vous ajouterez généralement
# connect_to_mongo et close_mongo_connection aux événements startup/shutdown
# de votre application FastAPI dans main.py, et utiliserez Depends(get_database)
# dans vos endpoints ou services pour obtenir l'accès à la base de données.
# Nous ferons cela plus tard.