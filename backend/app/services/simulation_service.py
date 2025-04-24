# backend/app/services/simulation_service.py

from typing import List, Dict, Any, Optional
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
import math

from app.core.database import get_database
from app.models.models import SimulationParams, SimulationResult
from app.services.model_service import ModelService # Pour récupérer les infos du modèle
from app.core.constants import REGIONS, EQUIVALENTS # Importer depuis les constantes

# Nom de la collection pour stocker les simulations
SIMULATIONS_COLLECTION = "simulations"
# Nom de la collection pour les modèles AI (au cas où on accède directement)
MODELS_COLLECTION = "ai_models"

class SimulationService:
    """Service pour la simulation d'impact carbone (utilise MongoDB)."""

    def __init__(self):
        """Initialise le service."""
        # Pas besoin d'initialiser de DB en mémoire ici
        # Utilisation des constantes importées pour regions/equivalents
        self.regions = REGIONS
        self.equivalents = EQUIVALENTS
        self.model_service = ModelService() # Instancier pour récupérer les données modèles

    def _get_sim_collection(self) -> AsyncIOMotorDatabase:
        """Obtient la collection MongoDB pour les simulations."""
        db = get_database()
        return db[SIMULATIONS_COLLECTION]

    # La méthode pour récupérer la collection des modèles pourrait être ajoutée si
    # on n'utilise pas toujours ModelService pour récupérer les détails.
    # def _get_model_collection(self) -> AsyncIOMotorDatabase:
    #     db = get_database()
    #     return db[MODELS_COLLECTION]

    async def simulate_impact(self, params: SimulationParams, user_id: Optional[str] = None) -> SimulationResult:
        """Simule l'impact carbone et sauvegarde le résultat dans MongoDB."""

        # 1. Récupérer les informations du modèle via ModelService
        model = await self.model_service.get_model_by_id(params.model_id)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Modèle avec ID {params.model_id} non trouvé"
            )

        # 2. Récupérer le facteur d'émission de la région
        region_data = self.regions.get(params.region)
        if not region_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Région '{params.region}' non valide ou non supportée"
            )

        # 3. Effectuer les calculs (logique similaire à avant, mais utilise l'objet 'model')
        total_co2_kg = 0.0
        total_energy_kwh = None # Initialiser à None

        # Estimation simplifiée si pas d'énergie fournie, sinon on utilise le facteur régional
        # Note: Cette logique d'estimation devrait être affinée / basée sur des recherches
        if model.parameters_billions is not None and model.parameters_billions > 0:
            # Heuristique très simple (à remplacer par une meilleure estimation si possible)
            energy_per_inference_kwh = model.parameters_billions * 0.0001
            total_energy_kwh = energy_per_inference_kwh * params.frequency_per_day * params.duration_days
            total_co2_kg = total_energy_kwh * region_data["co2_factor"]
        else:
            # Si on ne peut pas estimer l'énergie, on ne peut pas calculer le CO2 basé sur la région
            # On pourrait retourner une erreur ou 0 ? Pour l'instant, 0.
            total_co2_kg = 0.0

        # Estimer l'utilisation d'eau (si possible et pertinent)
        total_water_liters = None
        # La logique précédente basée sur le ratio CO2/eau de l'ENTRAÎNEMENT
        # n'est probablement PAS pertinente pour l'INFÉRENCE.
        # Il faudrait une autre source de données/heuristique ici. Laisser à None pour l'instant.
        # if model.water_use_million_liters and model.training_co2_kg and total_co2_kg > 0:
        #     water_factor = model.water_use_million_liters / model.training_co2_kg
        #     total_water_liters = total_co2_kg * water_factor * 1000000

        # 4. Calculer les équivalents
        equivalent_car_km = total_co2_kg / self.equivalents["car_km"]["factor"] if total_co2_kg > 0 else 0
        equivalent_trees_needed = math.ceil(total_co2_kg / self.equivalents["trees"]["factor"]) if total_co2_kg > 0 else 0
        equivalent_smartphone_charges = math.ceil(total_co2_kg / self.equivalents["smartphone_charges"]["factor"]) if total_co2_kg > 0 else 0

        # 5. Préparer l'objet résultat Pydantic
        simulation_result = SimulationResult(
            model_id=params.model_id,
            model_name=model.model_name, # Utiliser le nom du modèle récupéré
            total_co2_kg=total_co2_kg,
            total_energy_kwh=total_energy_kwh,
            total_water_liters=total_water_liters,
            equivalent_car_km=equivalent_car_km,
            equivalent_trees_needed=equivalent_trees_needed,
            equivalent_smartphone_charges=equivalent_smartphone_charges
        )

        # 6. Sauvegarder la simulation dans la collection MongoDB
        collection = self._get_sim_collection()
        simulation_doc = {
            # Pas besoin de stocker l'ID ici, MongoDB le génère (_id)
            "user_id": user_id, # Associer à l'utilisateur (si fourni)
            "params": params.dict(), # Stocker les paramètres utilisés
            "result": simulation_result.dict(), # Stocker les résultats
            "timestamp": datetime.now() # Utiliser datetime pour tri/requêtes
        }
        await collection.insert_one(simulation_doc)

        # 7. Retourner le résultat Pydantic
        return simulation_result

    async def get_regions(self) -> List[Dict[str, Any]]:
        """Récupère la liste des régions disponibles."""
        # Retourne les données depuis les constantes chargées
        return [region_data for region_data in self.regions.values()]

    async def get_equivalents(self) -> Dict[str, Dict[str, Any]]:
        """Récupère les facteurs de conversion pour les équivalents visuels."""
        # Retourne les données depuis les constantes chargées
        return self.equivalents

    async def get_simulation_history(self, user_id: str) -> List[SimulationResult]:
        """Récupère l'historique des simulations de l'utilisateur depuis MongoDB."""
        if not user_id:
            return []
        collection = self._get_sim_collection()
        history_cursor = collection.find({"user_id": user_id}).sort("timestamp", -1) # Trier par date décroissante
        history_docs = await history_cursor.to_list(length=100) # Limiter la taille de l'historique ?

        # Extraire et valider les résultats avec Pydantic
        results = []
        for doc in history_docs:
            if "result" in doc:
                try:
                    # Ajouter l'ID de la simulation du document parent si nécessaire
                    # doc["result"]["simulation_db_id"] = str(doc["_id"])
                    results.append(SimulationResult(**doc["result"]))
                except Exception as e:
                    print(f"Erreur de validation pour l'historique de simulation: {e}, data: {doc['result']}")
                    # Ignorer l'entrée invalide ou gérer l'erreur autrement
        return results

    async def save_simulation(self, simulation_id: str, user_id: str) -> bool:
        """Sauvegarde une simulation dans MongoDB (ajoute un flag 'saved')."""
        collection = self._get_sim_collection()
        try:
            sim_obj_id = ObjectId(simulation_id)
        except InvalidId:
            return False # ID invalide

        result = await collection.update_one(
            {"_id": sim_obj_id, "user_id": user_id}, # Vérifie aussi l'utilisateur
            {"$set": {"saved": True}}
        )
        return result.modified_count > 0 # Retourne True si un document a été modifié

    async def delete_simulation(self, simulation_id: str, user_id: str) -> bool:
        """Supprime une simulation de MongoDB."""
        collection = self._get_sim_collection()
        try:
            sim_obj_id = ObjectId(simulation_id)
        except InvalidId:
            return False # ID invalide

        result = await collection.delete_one(
             {"_id": sim_obj_id, "user_id": user_id} # Vérifie aussi l'utilisateur
        )
        return result.deleted_count > 0 # Retourne True si un document a été supprimé