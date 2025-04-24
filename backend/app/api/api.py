from fastapi import APIRouter
from app.api.endpoints import models, auth, carbon_scores

api_router = APIRouter()
 
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(carbon_scores.router, prefix="/carbon-scores", tags=["carbon-scores"]) 