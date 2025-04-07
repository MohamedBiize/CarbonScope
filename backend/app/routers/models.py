from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import Any, List, Optional

from app.models.models import AIModel, PaginatedResponse, SearchFilter, Statistics, AIModelCreate
from app.services.model_service import ModelService
from app.core.security import get_current_active_user
from app.models.models import User

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
async def get_models(
    model_name: Optional[str] = Query(None, description="Filtrer par nom de modèle"),
    min_parameters: Optional[float] = Query(None, description="Taille minimale en milliards de paramètres"),
    max_parameters: Optional[float] = Query(None, description="Taille maximale en milliards de paramètres"),
    architecture: Optional[str] = Query(None, description="Filtrer par architecture"),
    model_type: Optional[str] = Query(None, description="Filtrer par type de modèle"),
    min_score: Optional[float] = Query(None, description="Score minimal"),
    max_score: Optional[float] = Query(None, description="Score maximal"),
    min_co2: Optional[float] = Query(None, description="Émissions CO2 minimales (kg)"),
    max_co2: Optional[float] = Query(None, description="Émissions CO2 maximales (kg)"),
    cloud_provider: Optional[str] = Query(None, description="Filtrer par fournisseur cloud"),
    sort_by: str = Query("model_name", description="Champ de tri"),
    sort_order: str = Query("asc", description="Ordre de tri (asc/desc)"),
    page: int = Query(1, ge=1, description="Numéro de page"),
    page_size: int = Query(20, ge=1, le=100, description="Taille de la page"),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Récupère une liste paginée de modèles d'IA avec filtres.
    """
    search_filter = SearchFilter(
        model_name=model_name,
        min_parameters=min_parameters,
        max_parameters=max_parameters,
        architecture=architecture,
        model_type=model_type,
        min_score=min_score,
        max_score=max_score,
        min_co2=min_co2,
        max_co2=max_co2,
        cloud_provider=cloud_provider,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    
    model_service = ModelService()
    result = await model_service.get_models(search_filter, current_user.id)
    return result


@router.get("/statistics", response_model=Statistics)
async def get_statistics() -> Any:
    """
    Récupère les statistiques globales sur les modèles d'IA.
    """
    model_service = ModelService()
    statistics = await model_service.get_statistics()
    return statistics


@router.get("/{model_id}", response_model=AIModel)
async def get_model(
    model_id: str = Path(..., description="ID du modèle d'IA")
) -> Any:
    """
    Récupère les détails d'un modèle d'IA spécifique.
    """
    model_service = ModelService()
    model = await model_service.get_model_by_id(model_id)
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modèle non trouvé"
        )
    
    return model


@router.post("/", response_model=AIModel, status_code=status.HTTP_201_CREATED)
async def create_model(
    model_create: AIModelCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Crée un nouveau modèle d'IA (réservé aux administrateurs).
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Opération réservée aux administrateurs"
        )
    
    model_service = ModelService()
    model = await model_service.create_model(model_create)
    return model


@router.get("/architectures", response_model=List[str])
async def get_architectures() -> Any:
    """
    Récupère la liste des architectures disponibles.
    """
    model_service = ModelService()
    architectures = await model_service.get_architectures()
    return architectures


@router.get("/model-types", response_model=List[str])
async def get_model_types() -> Any:
    """
    Récupère la liste des types de modèles disponibles.
    """
    model_service = ModelService()
    model_types = await model_service.get_model_types()
    return model_types


@router.get("/cloud-providers", response_model=List[str])
async def get_cloud_providers() -> Any:
    """
    Récupère la liste des fournisseurs cloud disponibles.
    """
    model_service = ModelService()
    cloud_providers = await model_service.get_cloud_providers()
    return cloud_providers
