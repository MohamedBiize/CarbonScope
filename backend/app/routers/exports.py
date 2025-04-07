from fastapi import APIRouter, Depends, HTTPException, Path, status, UploadFile, File
from typing import Any, List
from fastapi.responses import FileResponse
import os
import json

from app.models.models import User
from app.core.security import get_current_active_user
from app.services.export_service import ExportService

router = APIRouter()


@router.post("/pdf", response_model=dict)
async def export_to_pdf(
    model_ids: List[str],
    include_simulations: bool = False,
    include_recommendations: bool = False,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Génère un rapport PDF comparatif pour les modèles d'IA sélectionnés.
    """
    export_service = ExportService()
    pdf_path = await export_service.export_to_pdf(
        model_ids, 
        include_simulations, 
        include_recommendations,
        current_user.id
    )
    
    if not pdf_path:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la génération du PDF"
        )
    
    filename = os.path.basename(pdf_path)
    return {"status": "success", "file_path": pdf_path, "filename": filename}


@router.post("/excel", response_model=dict)
async def export_to_excel(
    model_ids: List[str],
    include_simulations: bool = False,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Génère un fichier Excel comparatif pour les modèles d'IA sélectionnés.
    """
    export_service = ExportService()
    excel_path = await export_service.export_to_excel(
        model_ids, 
        include_simulations,
        current_user.id
    )
    
    if not excel_path:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la génération du fichier Excel"
        )
    
    filename = os.path.basename(excel_path)
    return {"status": "success", "file_path": excel_path, "filename": filename}


@router.get("/download/{file_id}", response_class=FileResponse)
async def download_file(
    file_id: str = Path(..., description="ID du fichier à télécharger"),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Télécharge un fichier d'export généré précédemment.
    """
    export_service = ExportService()
    file_path = await export_service.get_file_path(file_id, current_user.id)
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fichier non trouvé"
        )
    
    return FileResponse(
        path=file_path,
        filename=os.path.basename(file_path),
        media_type="application/octet-stream"
    )


@router.post("/scenario/save", response_model=dict)
async def save_scenario(
    scenario_data: dict,
    name: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Sauvegarde un scénario d'analyse (modèles sélectionnés, paramètres de simulation, etc.).
    """
    export_service = ExportService()
    scenario_id = await export_service.save_scenario(scenario_data, name, current_user.id)
    
    return {"status": "success", "scenario_id": scenario_id, "message": "Scénario sauvegardé avec succès"}


@router.get("/scenario/list", response_model=List[dict])
async def list_scenarios(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Liste les scénarios d'analyse sauvegardés par l'utilisateur.
    """
    export_service = ExportService()
    scenarios = await export_service.list_scenarios(current_user.id)
    return scenarios


@router.get("/scenario/{scenario_id}", response_model=dict)
async def get_scenario(
    scenario_id: str = Path(..., description="ID du scénario à récupérer"),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Récupère un scénario d'analyse sauvegardé.
    """
    export_service = ExportService()
    scenario = await export_service.get_scenario(scenario_id, current_user.id)
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scénario non trouvé"
        )
    
    return scenario


@router.delete("/scenario/{scenario_id}", response_model=dict)
async def delete_scenario(
    scenario_id: str = Path(..., description="ID du scénario à supprimer"),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Supprime un scénario d'analyse sauvegardé.
    """
    export_service = ExportService()
    result = await export_service.delete_scenario(scenario_id, current_user.id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scénario non trouvé"
        )
    
    return {"status": "success", "message": "Scénario supprimé avec succès"}
