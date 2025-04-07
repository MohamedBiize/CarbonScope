from typing import List, Dict, Any, Optional
import json
import os
from bson import ObjectId
from datetime import datetime
import pandas as pd

from app.core.config import settings
from app.models.models import AIModel, AIModelCreate, SearchFilter, PaginatedResponse, Statistics


class ModelService:
    """Service pour la gestion des modèles d'IA."""
    
    def __init__(self):
        """Initialise le service de modèles."""
        self.models_db = {}
        self._load_data()
    
    def _load_data(self):
        """Charge les données des modèles depuis le fichier JSON."""
        try:
            with open(settings.DATA_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Convertir les données en modèles et les stocker avec un ID unique
            for idx, model_data in enumerate(data):
                model_id = str(ObjectId())
                
                # Renommer les clés pour correspondre au modèle Pydantic
                renamed_data = {
                    "model_name": model_data.get("Model Name", ""),
                    "parameters_billions": model_data.get("Parameters (B)", 0.0),
                    "architecture": model_data.get("Architecture", ""),
                    "model_type": model_data.get("Model Type", ""),
                    "training_co2_kg": model_data.get("Training CO2 (kg)", 0.0),
                    "overall_score": model_data.get("Overall Score", 0.0),
                    "mmlu_score": model_data.get("MMLU Score"),
                    "bbh_score": model_data.get("BBH Score"),
                    "math_score": model_data.get("Math Score"),
                    "date_submitted": model_data.get("Date Submitted"),
                    "training_energy_mwh": model_data.get("Training Energy (MWh)"),
                    "reported_co2_tons": model_data.get("Reported CO2 (t)"),
                    "cloud_provider": model_data.get("Cloud Provider"),
                    "water_use_million_liters": model_data.get("Water Use (Million Liters)")
                }
                
                # Calculer l'efficacité carbone (score/émissions)
                if renamed_data["training_co2_kg"] > 0:
                    renamed_data["carbon_efficiency"] = renamed_data["overall_score"] / renamed_data["training_co2_kg"]
                else:
                    renamed_data["carbon_efficiency"] = None
                
                self.models_db[model_id] = {"id": model_id, **renamed_data}
        except Exception as e:
            print(f"Erreur lors du chargement des données: {e}")
            # Créer quelques modèles fictifs en cas d'erreur
            self._create_mock_data()
    
    def _create_mock_data(self):
        """Crée des données fictives pour le développement."""
        # Créer quelques modèles fictifs
        model_id1 = str(ObjectId())
        self.models_db[model_id1] = {
            "id": model_id1,
            "model_name": "GPT-4",
            "parameters_billions": 1000.0,
            "architecture": "Transformer",
            "model_type": "💬 chat models (RLHF, DPO, IFT, ...)",
            "training_co2_kg": 5000.0,
            "overall_score": 90.0,
            "mmlu_score": 85.0,
            "bbh_score": 92.0,
            "math_score": 88.0,
            "date_submitted": "2024-06-01",
            "training_energy_mwh": 10000.0,
            "reported_co2_tons": 5.0,
            "cloud_provider": "Microsoft (Azure)",
            "water_use_million_liters": 2.5,
            "carbon_efficiency": 0.018
        }
        
        model_id2 = str(ObjectId())
        self.models_db[model_id2] = {
            "id": model_id2,
            "model_name": "LLaMA-3",
            "parameters_billions": 70.0,
            "architecture": "LlamaForCausalLM",
            "model_type": "🟢 pretrained",
            "training_co2_kg": 1200.0,
            "overall_score": 75.0,
            "mmlu_score": 70.0,
            "bbh_score": 78.0,
            "math_score": 72.0,
            "date_submitted": "2024-07-15",
            "training_energy_mwh": 2500.0,
            "reported_co2_tons": 1.2,
            "cloud_provider": None,
            "water_use_million_liters": None,
            "carbon_efficiency": 0.0625
        }
    
    async def get_models(self, search_filter: SearchFilter, user_id: str = None) -> PaginatedResponse:
        """Récupère une liste paginée de modèles d'IA avec filtres.
        
        Args:
            search_filter: Filtres de recherche
            user_id: ID de l'utilisateur pour l'historique de recherche
            
        Returns:
            PaginatedResponse: Réponse paginée avec les modèles
        """
        # Filtrer les modèles selon les critères
        filtered_models = self.models_db.values()
        
        if search_filter.model_name:
            filtered_models = [m for m in filtered_models if search_filter.model_name.lower() in m["model_name"].lower()]
        
        if search_filter.min_parameters is not None:
            filtered_models = [m for m in filtered_models if m["parameters_billions"] >= search_filter.min_parameters]
        
        if search_filter.max_parameters is not None:
            filtered_models = [m for m in filtered_models if m["parameters_billions"] <= search_filter.max_parameters]
        
        if search_filter.architecture:
            filtered_models = [m for m in filtered_models if search_filter.architecture == m["architecture"]]
        
        if search_filter.model_type:
            filtered_models = [m for m in filtered_models if search_filter.model_type == m["model_type"]]
        
        if search_filter.min_score is not None:
            filtered_models = [m for m in filtered_models if m["overall_score"] >= search_filter.min_score]
        
        if search_filter.max_score is not None:
            filtered_models = [m for m in filtered_models if m["overall_score"] <= search_filter.max_score]
        
        if search_filter.min_co2 is not None:
            filtered_models = [m for m in filtered_models if m["training_co2_kg"] >= search_filter.min_co2]
        
        if search_filter.max_co2 is not None:
            filtered_models = [m for m in filtered_models if m["training_co2_kg"] <= search_filter.max_co2]
        
        if search_filter.cloud_provider:
            filtered_models = [m for m in filtered_models if m["cloud_provider"] == search_filter.cloud_provider]
        
        # Trier les modèles
        reverse = search_filter.sort_order.lower() == "desc"
        filtered_models = sorted(filtered_models, key=lambda m: m.get(search_filter.sort_by, ""), reverse=reverse)
        
        # Calculer la pagination
        total = len(filtered_models)
        total_pages = (total + search_filter.page_size - 1) // search_filter.page_size
        
        start_idx = (search_filter.page - 1) * search_filter.page_size
        end_idx = start_idx + search_filter.page_size
        
        paginated_models = filtered_models[start_idx:end_idx]
        
        # Enregistrer la recherche dans l'historique de l'utilisateur si nécessaire
        # (Dans une vraie application, cela serait fait via le UserService)
        
        return PaginatedResponse(
            items=paginated_models,
            total=total,
            page=search_filter.page,
            page_size=search_filter.page_size,
            total_pages=total_pages
        )
    
    async def get_model_by_id(self, model_id: str) -> Optional[AIModel]:
        """Récupère un modèle d'IA par son ID.
        
        Args:
            model_id: ID du modèle
            
        Returns:
            Optional[AIModel]: Modèle si trouvé, None sinon
        """
        model_data = self.models_db.get(model_id)
        if not model_data:
            return None
        
        return AIModel(**model_data)
    
    async def create_model(self, model_create: AIModelCreate) -> AIModel:
        """Crée un nouveau modèle d'IA.
        
        Args:
            model_create: Données pour la création du modèle
            
        Returns:
            AIModel: Modèle créé
        """
        model_id = str(ObjectId())
        
        # Calculer l'efficacité carbone (score/émissions)
        carbon_efficiency = None
        if model_create.training_co2_kg > 0:
            carbon_efficiency = model_create.overall_score / model_create.training_co2_kg
        
        model_data = {
            "id": model_id,
            **model_create.model_dump(),
            "carbon_efficiency": carbon_efficiency
        }
        
        self.models_db[model_id] = model_data
        
        return AIModel(**model_data)
    
    async def get_statistics(self) -> Statistics:
        """Récupère les statistiques globales sur les modèles d'IA.
        
        Returns:
            Statistics: Statistiques globales
        """
        models = list(self.models_db.values())
        
        # Calculer les statistiques de base
        total_models = len(models)
        average_parameters = sum(m["parameters_billions"] for m in models) / total_models if total_models > 0 else 0
        average_co2 = sum(m["training_co2_kg"] for m in models) / total_models if total_models > 0 else 0
        average_score = sum(m["overall_score"] for m in models) / total_models if total_models > 0 else 0
        total_co2 = sum(m["training_co2_kg"] for m in models)
        
        # Trouver les architectures et types de modèles les plus courants
        architectures = {}
        model_types = {}
        
        for model in models:
            arch = model["architecture"]
            mtype = model["model_type"]
            
            architectures[arch] = architectures.get(arch, 0) + 1
            model_types[mtype] = model_types.get(mtype, 0) + 1
        
        most_common_architecture = max(architectures.items(), key=lambda x: x[1])[0] if architectures else ""
        most_common_model_type = max(model_types.items(), key=lambda x: x[1])[0] if model_types else ""
        
        # Trouver les modèles les plus efficaces et les moins efficaces
        models_with_efficiency = [m for m in models if m.get("carbon_efficiency") is not None]
        most_efficient_model = max(models_with_efficiency, key=lambda m: m.get("carbon_efficiency", 0)) if models_with_efficiency else {}
        least_efficient_model = min(models_with_efficiency, key=lambda m: m.get("carbon_efficiency", float('inf'))) if models_with_efficiency else {}
        
        # Trouver le modèle le plus performant
        best_performing_model = max(models, key=lambda m: m["overall_score"]) if models else {}
        
        # Trouver le modèle le plus récent
        models_with_date = [m for m in models if m.get("date_submitted") is not None]
        most_recent_model = max(models_with_date, key=lambda m: m["date_submitted"]) if models_with_date else {}
        
        return Statistics(
            total_models=total_models,
            average_parameters=average_parameters,
            average_co2=average_co2,
            average_score=average_score,
            total_co2=total_co2,
            most_common_architecture=most_common_architecture,
            most_common_model_type=most_common_model_type,
            most_efficient_model=most_efficient_model,
            least_efficient_model=least_efficient_model,
            best_performing_model=best_performing_model,
            most_recent_model=most_recent_model
        )
    
    async def get_architectures(self) -> List[str]:
        """Récupère la liste des architectures disponibles.
        
        Returns:
            List[str]: Liste des architectures
        """
        architectures = set()
        for model in self.models_db.values():
            if model["architecture"]:
                architectures.add(model["architecture"])
        
        return sorted(list(architectures))
    
    async def get_model_types(self) -> List[str]:
        """Récupère la liste des types de modèles disponibles.
        
        Returns:
            List[str]: Liste des types de modèles
        """
        model_types = set()
        for model in self.models_db.values():
            if model["model_type"]:
                model_types.add(model["model_type"])
        
        return sorted(list(model_types))
    
    async def get_cloud_providers(self) -> List[str]:
        """Récupère la liste des fournisseurs cloud disponibles.
        
        Returns:
            List[str]: Liste des fournisseurs cloud
        """
        providers = set()
        for model in self.models_db.values():
            if model["cloud_provider"]:
                providers.add(model["cloud_provider"])
        
        return sorted(list(providers))
