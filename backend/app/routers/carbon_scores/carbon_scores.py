# backend/app/routers/carbon_scores/carbon_scores.py (ou chemin similaire)

from fastapi import APIRouter, Depends, HTTPException, Query, Path, status # Ajouter Query si vous utilisez limit dans ranking
from typing import Any, List, Dict # Ajouter Dict pour response_model=dict

# Importer les modèles Pydantic principaux depuis models.py
from app.models.models import CarbonScore, ModelRecommendation, User

# Importer le service correspondant
from app.services.carbon_score_service import CarbonScoreService

# Importer la dépendance d'authentification depuis security.py
from app.core.security import get_current_active_user
from app.schemas.carbon_score import CarbonEfficiencyMetric


router = APIRouter()
carbon_score_service = CarbonScoreService()

@router.get("/ranking", response_model=List[CarbonScore])
async def get_ranking(
    limit: int = 50,
    current_user = Depends(get_current_active_user)
):
    """Récupère le classement des modèles par score carbone"""
    try:
        return await carbon_score_service.get_ranking(limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories", response_model=Dict[str, Any])
async def get_categories(
    current_user = Depends(get_current_active_user)
):
    """Récupère les catégories de scores carbone"""
    try:
        return await carbon_score_service.get_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/efficiency-metrics", response_model=List[CarbonEfficiencyMetric])
async def get_efficiency_metrics(
    current_user = Depends(get_current_active_user)
):
    """Récupère les métriques d'efficacité carbone"""
    try:
        return await carbon_score_service.get_efficiency_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 