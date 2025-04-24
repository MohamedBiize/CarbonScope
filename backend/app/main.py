from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.routers import auth, models, simulations, exports
from app.routers.carbon_scores import router as carbon_scores_router
from app.services.model_service import ModelService
from app.services.carbon_score_service import CarbonScoreService

# Création de l'application FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Événement au démarrage : Connexion à MongoDB
@app.on_event("startup")
async def startup_db_client():
    print("Tentative de connexion à MongoDB...")
    try:
        app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
        app.mongodb = app.mongodb_client[settings.MONGODB_DB]
        print("Connexion MongoDB réussie !")
        print(f"Connecté à la base de données '{settings.MONGODB_DB}'")
        
        # Initialisation des services
        model_service = ModelService()
        carbon_score_service = CarbonScoreService()
        
        # Chargement des données initiales
        await model_service.load_initial_data()
        
        # Calcul des scores carbone
        await carbon_score_service.calculate_all_scores()
        
    except Exception as e:
        print(f"Erreur de connexion à MongoDB: {str(e)}")
        raise

# Événement à l'arrêt : Fermeture de la connexion MongoDB
@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# Inclusion des routeurs
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(models.router, prefix=f"{settings.API_V1_STR}/models", tags=["models"])
app.include_router(simulations.router, prefix=f"{settings.API_V1_STR}/simulations", tags=["simulations"])
app.include_router(carbon_scores_router, prefix=f"{settings.API_V1_STR}/carbon-scores", tags=["carbon-scores"])
app.include_router(exports.router, prefix=f"{settings.API_V1_STR}/exports", tags=["exports"])

# Route racine
@app.get("/")
async def root():
    return {
        "message": f"Bienvenue sur l'API {settings.APP_NAME}", # Utiliser settings
        "documentation": "/docs",
        "version": app.version # Utiliser la version de l'app
    }

# Vérification de l'état de l'API
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "api_version": app.version, # Utiliser la version de l'app
        "environment": "development" if settings.DEBUG else "production"
    }
