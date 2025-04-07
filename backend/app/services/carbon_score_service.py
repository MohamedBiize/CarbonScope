from typing import List, Dict, Any, Optional
import json
import os
from bson import ObjectId
from datetime import datetime

from app.core.config import settings
from app.models.models import CarbonScore, ModelRecommendation


class CarbonScoreService:
    """Service pour le calcul des scores carbone et des recommandations."""
    
    def __init__(self):
        """Initialise le service de score carbone."""
        self.models_db = {}
        self.carbon_scores = {}
        self.categories = self._load_categories()
        self._load_models()
        self._calculate_all_scores()
    
    def _load_models(self):
        """Charge les données des modèles depuis le fichier JSON."""
        try:
            with open(settings.DATA_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Convertir les données en modèles et les stocker avec un ID unique
            for idx, model_data in enumerate(data):
                model_id = str(ObjectId())
                
                # Renommer les clés pour correspondre au modèle Pydantic
                renamed_data = {
                    "id": model_id,
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
                
                self.models_db[model_id] = renamed_data
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
            "water_use_million_liters": 2.5
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
            "water_use_million_liters": None
        }
    
    def _load_categories(self) -> Dict[str, Dict[str, Any]]:
        """Charge les informations sur les catégories de score carbone.
        
        Returns:
            Dict[str, Dict[str, Any]]: Informations sur les catégories
        """
        # Dans une vraie application, ces données seraient chargées depuis une base de données
        # ou un fichier de configuration
        return {
            "A+": {
                "min_score": 90,
                "color": "#1a9850",
                "description": "Impact environnemental extrêmement faible"
            },
            "A": {
                "min_score": 80,
                "color": "#66bd63",
                "description": "Impact environnemental très faible"
            },
            "B": {
                "min_score": 70,
                "color": "#a6d96a",
                "description": "Impact environnemental faible"
            },
            "C": {
                "min_score": 50,
                "color": "#fee08b",
                "description": "Impact environnemental modéré"
            },
            "D": {
                "min_score": 30,
                "color": "#fdae61",
                "description": "Impact environnemental élevé"
            },
            "E": {
                "min_score": 10,
                "color": "#f46d43",
                "description": "Impact environnemental très élevé"
            },
            "F": {
                "min_score": 0,
                "color": "#d73027",
                "description": "Impact environnemental extrêmement élevé"
            }
        }
    
    def _calculate_all_scores(self):
        """Calcule les scores carbone pour tous les modèles."""
        # Calculer l'efficacité carbone pour tous les modèles
        models_with_data = []
        for model_id, model in self.models_db.items():
            if model["training_co2_kg"] > 0 and model["overall_score"] > 0:
                efficiency_ratio = model["overall_score"] / model["training_co2_kg"]
                model["efficiency_ratio"] = efficiency_ratio
                models_with_data.append(model)
        
        # Trier les modèles par efficacité
        models_with_data.sort(key=lambda m: m["efficiency_ratio"], reverse=True)
        
        # Calculer les percentiles
        total_models = len(models_with_data)
        for idx, model in enumerate(models_with_data):
            percentile = 100 - (idx / total_models * 100)
            
            # Déterminer la catégorie
            category = "F"
            for cat, cat_data in sorted(self.categories.items(), key=lambda x: x[1]["min_score"], reverse=True):
                if percentile >= cat_data["min_score"]:
                    category = cat
                    break
            
            # Calculer le score carbone (0-100)
            carbon_score = percentile
            
            # Sauvegarder le score
            self.carbon_scores[model["id"]] = CarbonScore(
                model_id=model["id"],
                model_name=model["model_name"],
                carbon_score=carbon_score,
                efficiency_ratio=model["efficiency_ratio"],
                rank_percentile=percentile,
                category=category
            )
    
    async def get_carbon_score(self, model_id: str) -> Optional[CarbonScore]:
        """Récupère le score carbone d'un modèle d'IA.
        
        Args:
            model_id: ID du modèle
            
        Returns:
            Optional[CarbonScore]: Score carbone si disponible, None sinon
        """
        return self.carbon_scores.get(model_id)
    
    async def get_recommendations(self, model_id: str, limit: int = 5) -> List[ModelRecommendation]:
        """Récupère des recommandations de modèles alternatifs plus écologiques.
        
        Args:
            model_id: ID du modèle
            limit: Nombre maximum de recommandations
            
        Returns:
            List[ModelRecommendation]: Liste des recommandations
        """
        if model_id not in self.models_db:
            return []
        
        original_model = self.models_db[model_id]
        
        # Trouver des modèles similaires mais plus efficaces
        recommendations = []
        
        # Filtrer les modèles potentiels
        potential_models = []
        for m_id, model in self.models_db.items():
            # Exclure le modèle original
            if m_id == model_id:
                continue
            
            # Vérifier que le modèle a des données d'émissions
            if model["training_co2_kg"] <= 0:
                continue
            
            # Vérifier que le modèle est plus efficace
            if model["training_co2_kg"] >= original_model["training_co2_kg"]:
                continue
            
            # Calculer la similarité (basée sur l'architecture et le type)
            similarity_score = 0.0
            
            # Même architecture
            if model["architecture"] == original_model["architecture"]:
                similarity_score += 0.4
            
            # Même type
            if model["model_type"] == original_model["model_type"]:
                similarity_score += 0.3
            
            # Taille similaire (±30%)
            if 0.7 * original_model["parameters_billions"] <= model["parameters_billions"] <= 1.3 * original_model["parameters_billions"]:
                similarity_score += 0.3
            
            # Performance similaire ou meilleure
            performance_diff = (model["overall_score"] - original_model["overall_score"]) / original_model["overall_score"] * 100
            
            # Ajouter à la liste des modèles potentiels
            potential_models.append({
                "model": model,
                "similarity_score": similarity_score,
                "performance_difference_percent": performance_diff,
                "co2_savings_kg": original_model["training_co2_kg"] - model["training_co2_kg"]
            })
        
        # Trier par similarité puis par économies de CO2
        potential_models.sort(key=lambda x: (x["similarity_score"], x["co2_savings_kg"]), reverse=True)
        
        # Prendre les top N recommandations
        for i, rec in enumerate(potential_models[:limit]):
            model = rec["model"]
            
            # Déterminer la raison de la recommandation
            reason = "Modèle plus écologique "
            if rec["performance_difference_percent"] > 0:
                reason += "et plus performant"
            elif rec["performance_difference_percent"] > -10:
                reason += "avec des performances similaires"
            else:
                reason += "mais moins performant"
            
            recommendations.append(ModelRecommendation(
                original_model_id=model_id,
                original_model_name=original_model["model_name"],
                recommended_model_id=model["id"],
                recommended_model_name=model["model_name"],
                co2_savings_kg=rec["co2_savings_kg"],
                performance_difference_percent=rec["performance_difference_percent"],
                similarity_score=rec["similarity_score"],
                recommendation_reason=reason
            ))
        
        return recommendations
    
    async def get_carbon_ranking(self, limit: int = 10) -> List[CarbonScore]:
        """Récupère le classement des modèles d'IA selon leur score carbone.
        
        Args:
            limit: Nombre maximum de modèles à retourner
            
        Returns:
            List[CarbonScore]: Liste des scores carbone
        """
        # Trier les scores par score carbone décroissant
        sorted_scores = sorted(
            self.carbon_scores.values(),
            key=lambda x: x.carbon_score,
            reverse=True
        )
        
        return sorted_scores[:limit]
    
    async def get_carbon_categories(self) -> Dict[str, Dict[str, Any]]:
        """Récupère les informations sur les catégories de score carbone.
        
        Returns:
            Dict[str, Dict[str, Any]]: Informations sur les catégories
        """
        return self.categories
    
    async def get_efficiency_metrics(self) -> Dict[str, Any]:
        """Récupère les métriques d'efficacité carbone pour l'ensemble des modèles.
        
        Returns:
            Dict[str, Any]: Métriques d'efficacité
        """
        if not self.carbon_scores:
            return {
                "average_score": 0,
                "median_score": 0,
                "best_score": 0,
                "worst_score": 0,
                "category_distribution": {}
            }
        
        scores = [score.carbon_score for score in self.carbon_scores.values()]
        scores.sort()
        
        # Calculer la distribution par catégorie
        category_distribution = {}
        for score in self.carbon_scores.values():
            category = score.category
            category_distribution[category] = category_distribution.get(category, 0) + 1
        
        return {
            "average_score": sum(scores) / len(scores),
            "median_score": scores[len(scores) // 2],
            "best_score": scores[-1],
            "worst_score": scores[0],
            "category_distribution": category_distribution
        }
