from fastapi import APIRouter, Depends, HTTPException, Path, status
from typing import Any, List

from app.models.models import CarbonScore, ModelRecommendation
from app.services.carbon_score_service import CarbonScoreService
from app.core.security import get_current_active_user
from app.models.models import User

router = APIRouter()


@router.get("/{model_id}", response_model=CarbonScore)
async def get_carbon_score(
    model_id: str = Path(..., description="ID du modèle d'IA"),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Calcule et récupère le score carbone d'un modèle d'IA spécifique.
    """
    carbon_score_service = CarbonScoreService()
    score = await carbon_score_service.get_carbon_score(model_id)
    
    if not score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modèle non trouvé ou score carbone non calculable"
        )
    
    return score


@router.get("/recommendations/{model_id}", response_model=List[ModelRecommendation])
async def get_recommendations(
    model_id: str = Path(..., description="ID du modèle d'IA"),
    limit: int = 5,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Récupère des recommandations de modèles alternatifs plus écologiques.
    """
    carbon_score_service = CarbonScoreService()
    recommendations = await carbon_score_service.get_recommendations(model_id, limit)
    
    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modèle non trouvé ou aucune recommandation disponible"
        )
    
    return recommendations


@router.get("/ranking", response_model=List[CarbonScore])
async def get_carbon_ranking(
    limit: int = 10
) -> Any:
    """
    Récupère le classement des modèles d'IA selon leur score carbone.
    """
    carbon_score_service = CarbonScoreService()
    ranking = await carbon_score_service.get_carbon_ranking(limit)
    return ranking


@router.get("/categories", response_model=dict)
async def get_carbon_categories() -> Any:
    """
    Récupère les informations sur les catégories de score carbone (A+, A, B, C, D, E, F).
    """
    carbon_score_service = CarbonScoreService()
    categories = await carbon_score_service.get_carbon_categories()
    return categories


@router.get("/efficiency-metrics", response_model=dict)
async def get_efficiency_metrics() -> Any:
    """
    Récupère les métriques d'efficacité carbone pour l'ensemble des modèles.
    """
    carbon_score_service = CarbonScoreService()
    metrics = await carbon_score_service.get_efficiency_metrics()
    return metrics
