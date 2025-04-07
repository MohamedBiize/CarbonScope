from fastapi import APIRouter, Depends, HTTPException, Path, status
from typing import Any, List

from app.models.models import SimulationParams, SimulationResult
from app.services.simulation_service import SimulationService
from app.core.security import get_current_active_user
from app.models.models import User

router = APIRouter()


@router.post("/", response_model=SimulationResult)
async def simulate_impact(
    simulation_params: SimulationParams,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Simule l'impact carbone d'un modèle d'IA selon les paramètres fournis.
    """
    simulation_service = SimulationService()
    result = await simulation_service.simulate_impact(simulation_params, current_user.id)
    return result


@router.get("/regions", response_model=List[dict])
async def get_regions() -> Any:
    """
    Récupère la liste des régions disponibles pour la simulation avec leurs facteurs d'émission.
    """
    simulation_service = SimulationService()
    regions = await simulation_service.get_regions()
    return regions


@router.get("/equivalents", response_model=dict)
async def get_equivalents() -> Any:
    """
    Récupère les facteurs de conversion pour les équivalents visuels (km en voiture, arbres, etc.).
    """
    simulation_service = SimulationService()
    equivalents = await simulation_service.get_equivalents()
    return equivalents


@router.get("/history", response_model=List[SimulationResult])
async def get_simulation_history(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Récupère l'historique des simulations de l'utilisateur.
    """
    simulation_service = SimulationService()
    history = await simulation_service.get_simulation_history(current_user.id)
    return history


@router.post("/save/{simulation_id}", response_model=dict)
async def save_simulation(
    simulation_id: str = Path(..., description="ID de la simulation à sauvegarder"),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Sauvegarde une simulation dans le profil de l'utilisateur.
    """
    simulation_service = SimulationService()
    result = await simulation_service.save_simulation(simulation_id, current_user.id)
    return {"status": "success", "message": "Simulation sauvegardée avec succès"}


@router.delete("/history/{simulation_id}", response_model=dict)
async def delete_simulation(
    simulation_id: str = Path(..., description="ID de la simulation à supprimer"),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Supprime une simulation de l'historique de l'utilisateur.
    """
    simulation_service = SimulationService()
    result = await simulation_service.delete_simulation(simulation_id, current_user.id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation non trouvée"
        )
    
    return {"status": "success", "message": "Simulation supprimée avec succès"}
