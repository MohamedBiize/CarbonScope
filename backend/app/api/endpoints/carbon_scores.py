from fastapi import APIRouter, Depends
from typing import List
from app.services.carbon_score_service import CarbonScoreService
from app.schemas.carbon_score import CarbonScore, CarbonScoreCategory, CarbonScoreEfficiency

router = APIRouter()

@router.get("/ranking", response_model=List[CarbonScore])
async def get_carbon_score_ranking(limit: int = 50):
    """
    Récupère le classement des modèles par score carbone.
    """
    service = CarbonScoreService()
    return await service.get_ranking(limit)

@router.get("/categories", response_model=List[CarbonScoreCategory])
async def get_carbon_score_categories():
    """
    Récupère les catégories de scores carbone.
    """
    service = CarbonScoreService()
    return await service.get_categories()

@router.get("/efficiency", response_model=List[CarbonScoreEfficiency])
async def get_carbon_efficiency_metrics():
    """
    Récupère les métriques d'efficacité carbone des modèles.
    """
    service = CarbonScoreService()
    return await service.get_efficiency_metrics() 