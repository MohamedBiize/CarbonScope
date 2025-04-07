from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os

from app.core.config import settings
from app.routers import auth, models, simulations, carbon_scores, exports

# Création de l'application FastAPI
app = FastAPI(
    title="CarbonScope AI API",
    description="API pour l'application CarbonScope AI de visualisation de l'empreinte carbone des modèles d'IA",
    version="0.1.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentification"]
)

app.include_router(
    models.router,
    prefix=f"{settings.API_V1_STR}/models",
    tags=["Modèles d'IA"]
)

app.include_router(
    simulations.router,
    prefix=f"{settings.API_V1_STR}/simulations",
    tags=["Simulations"]
)

app.include_router(
    carbon_scores.router,
    prefix=f"{settings.API_V1_STR}/carbon-scores",
    tags=["Scores Carbone"]
)

app.include_router(
    exports.router,
    prefix=f"{settings.API_V1_STR}/exports",
    tags=["Exports et Rapports"]
)

# Route racine
@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API CarbonScope AI",
        "documentation": "/docs",
        "version": "0.1.0"
    }

# Vérification de l'état de l'API
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "api_version": "0.1.0",
        "environment": "development" if settings.DEBUG else "production"
    }
