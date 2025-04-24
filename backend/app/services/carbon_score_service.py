# backend/app/services/carbon_score_service.py

from typing import List, Dict, Any, Optional
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from fastapi import HTTPException, status
import math

from app.core.database import get_database
from app.models.models import CarbonScore, ModelRecommendation, AIModel # Ajuster imports modèles si besoin
from app.core.constants import CARBON_CATEGORIES
# Supposons que les schémas spécifiques ne sont pas strictement nécessaires pour le moment
# Si les méthodes de routeur les utilisent en response_model, il faudra les réimporter
# from app.schemas.carbon_score import CarbonScoreCategory, CarbonScoreEfficiency, CarbonScoreRanking, CarbonEfficiencyMetric

# Nom de la collection MongoDB pour les modèles AI
MODELS_COLLECTION = "ai_models"

class CarbonScoreService:
    """Service pour la gestion des scores carbone et des recommandations via MongoDB."""

    def __init__(self):
        """Initialise le service."""
        self.categories = CARBON_CATEGORIES
        # Les données modèles sont lues depuis la DB via _get_collection
        # Les scores sont supposés être DANS les documents modèles après exécution du script calculate_scores.py

    def _get_collection(self) -> AsyncIOMotorCollection:
        """Obtient la collection MongoDB pour les modèles AI."""
        # Utilise get_database() pour obtenir la connexion DB active
        db = get_database()
        return db[MODELS_COLLECTION]

    def _map_db_score_to_pydantic(self, db_model: Dict[str, Any]) -> Optional[CarbonScore]:
        """Convertit les champs pertinents d'un document MongoDB en modèle Pydantic CarbonScore."""
        if not db_model:
            return None

        # Vérifier si les champs calculés par le script sont présents
        required_fields = ["model_name", "carbon_score", "category", "rank_percentile", "efficiency_ratio"]
        if not all(field in db_model and db_model[field] is not None for field in required_fields):
            print(f"Avertissement: Champs de score manquants pour le modèle ID {db_model.get('_id')}")
            # Retourner None si un champ clé manque, car le score n'est pas complet
            return None

        try:
            return CarbonScore(
                model_id=str(db_model.get("_id")),
                model_name=db_model.get("model_name"),
                carbon_score=db_model.get("carbon_score"),
                efficiency_ratio=db_model.get("efficiency_ratio"), # Celui stocké est CO2/Perf
                rank_percentile=db_model.get("rank_percentile"),
                category=db_model.get("category")
            )
        except Exception as e:
            print(f"Erreur validation Pydantic _map_db_score_to_pydantic pour ID {db_model.get('_id')}: {e}")
            return None

    # --- Méthodes utilisées par le routeur carbon_scores.py ---

    async def get_carbon_score(self, model_id: str) -> Optional[CarbonScore]:
        """Récupère le score carbone d'un modèle depuis MongoDB."""
        collection = self._get_collection()
        try:
            obj_id = ObjectId(model_id)
        except InvalidId:
            return None # ID invalide

        db_model = await collection.find_one({"_id": obj_id})
        return self._map_db_score_to_pydantic(db_model)

    async def get_recommendations(self, model_id: str, limit: int = 3) -> List[ModelRecommendation]:
        """Récupère des recommandations alternatives plus écologiques depuis MongoDB."""
        collection = self._get_collection()
        try:
            original_obj_id = ObjectId(model_id)
        except InvalidId:
             # Le routeur devrait attraper ça via le retour None ou lever une exception
             print(f"ID invalide pour recommandations: {model_id}")
             return [] # Ou lever HTTPException

        original_model = await collection.find_one({"_id": original_obj_id})
        if not original_model:
             print(f"Modèle original non trouvé pour recommandations: {model_id}")
             return [] # Ou lever HTTPException

        # Vérifier données nécessaires pour la recommandation
        if original_model.get("training_co2_kg") is None or original_model.get("parameters_billions") is None \
           or original_model.get("architecture") is None or original_model.get("overall_score") is None:
             print(f"Données manquantes pour générer recommandations pour: {model_id}")
             return []

        # Critères de recherche (similaires à avant)
        query_filter = {
            "_id": {"$ne": original_obj_id},
            "training_co2_kg": {"$lt": original_model["training_co2_kg"], "$gt": 0},
            "architecture": original_model["architecture"],
            "parameters_billions": {
                "$gte": original_model["parameters_billions"] * 0.5, # Ajuster ces facteurs si besoin
                "$lte": original_model["parameters_billions"] * 1.5
            },
            "overall_score": {"$exists": True, "$ne": None}
        }

        # Trier par CO2 croissant et limiter
        recommendations_cursor = collection.find(query_filter).sort("training_co2_kg", 1).limit(limit * 5) # Prendre plus pour filtrer
        potential_recs_db = await recommendations_cursor.to_list(length=limit * 5)

        # Formater les recommandations (similaire à avant)
        recommendations = []
        for rec_model_db in potential_recs_db:
             if len(recommendations) >= limit: break
             performance_diff = 0
             if original_model.get("overall_score", 0) > 0 and rec_model_db.get("overall_score") is not None:
                  performance_diff = ((rec_model_db["overall_score"] - original_model["overall_score"]) / original_model["overall_score"]) * 100

             reason = "Modèle plus écologique "
             if performance_diff > 5: reason += "et plus performant"
             elif performance_diff > -10: reason += "avec des performances similaires"
             else: reason += "mais moins performant"

             recommendations.append(ModelRecommendation(
                 original_model_id=model_id,
                 original_model_name=original_model["model_name"],
                 recommended_model_id=str(rec_model_db["_id"]),
                 recommended_model_name=rec_model_db["model_name"],
                 co2_savings_kg=original_model["training_co2_kg"] - rec_model_db["training_co2_kg"],
                 performance_difference_percent=performance_diff,
                 similarity_score=0.8, # Simplifié
                 recommendation_reason=reason
             ))
        return recommendations

    async def get_carbon_ranking(self, limit: int = 10, sort_by: str = 'carbon_score', sort_order: str = 'desc') -> List[CarbonScore]:
        """Récupère le classement des modèles selon leur score carbone depuis MongoDB."""
        collection = self._get_collection()

        # Validation simple du champ de tri
        allowed_sort_keys = ['carbon_score', 'model_name', 'efficiency_ratio', 'rank_percentile', 'category']
        if sort_by not in allowed_sort_keys:
            sort_by = 'carbon_score' # Fallback

        mongo_sort_order = -1 if sort_order.lower() == 'desc' else 1

        # Récupérer les modèles triés, en s'assurant que le champ de tri existe
        ranking_cursor = collection.find(
            {sort_by: {"$exists": True, "$ne": None}},
            # Projection pour récupérer les champs nécessaires au CarbonScore
            {"_id": 1, "model_name": 1, "carbon_score": 1, "efficiency_ratio": 1, "rank_percentile": 1, "category": 1}
        ).sort(sort_by, mongo_sort_order).limit(limit)

        ranked_models_db = await ranking_cursor.to_list(length=limit)

        # Mapper vers le modèle Pydantic CarbonScore
        ranking = [self._map_db_score_to_pydantic(model) for model in ranked_models_db]
        return [score for score in ranking if score is not None] # Filtrer les None

    async def get_carbon_categories(self) -> Dict[str, Dict[str, Any]]:
        """Récupère les informations sur les catégories de score carbone."""
        return self.categories

    async def get_efficiency_metrics(self) -> Dict[str, Any]:
        """Récupère les métriques d'efficacité carbone globales via agrégation."""
        collection = self._get_collection()
        # Pipeline d'agrégation pour calculer les métriques
        pipeline = [
            { # Filtrer les documents valides pour le score
                "$match": {
                    "carbon_score": {"$exists": True, "$ne": None},
                    "category": {"$exists": True, "$ne": None}
                }
            },
            { # Grouper pour calculer les métriques globales ET la distribution par catégorie
                "$group": {
                    "_id": None, # Grouper tous les documents ensemble
                    "average_score": {"$avg": "$carbon_score"},
                    "median_score_calc": {"$median": { # $median est disponible dans MongoDB 5.0+
                         "input": "$carbon_score",
                         "method": 'approximate' # Ou 'exact' si nécessaire et supporté
                    }},
                    "best_score": {"$max": "$carbon_score"},
                    "worst_score": {"$min": "$carbon_score"},
                    "total_models": {"$sum": 1},
                     # Calculer la distribution directement
                     "category_distribution_array": {"$push": "$category"}
                }
            },
             { # Optionnel : Re-calculer la distribution si $push n'est pas idéal
                 "$addFields": {
                     "category_distribution": {
                         "$arrayToObject": {
                             "$map": {
                                 "input": {"$setUnion": ["$category_distribution_array"]},
                                 "as": "category",
                                 "in": {
                                     "k": "$$category",
                                     "v": {
                                         "$size": {
                                             "$filter": {
                                                 "input": "$category_distribution_array",
                                                 "cond": {"$eq": ["$$this", "$$category"]}
                                             }
                                         }
                                     }
                                 }
                             }
                         }
                     }
                 }
             }
        ]

        metrics_result = await collection.aggregate(pipeline).to_list(length=1)

        if not metrics_result:
            # Retourner des valeurs par défaut si aucune donnée agrégée
            return {
                "average_score": 0, "median_score": 0, "best_score": 0,
                "worst_score": 0, "total_models": 0, "category_distribution": {}
            }

        result_doc = metrics_result[0]
        # Remapper les noms si nécessaire et gérer l'absence de $median
        return {
            "average_score": result_doc.get("average_score"),
            "median_score": result_doc.get("median_score_calc"), # Récupérer la médiane calculée
            "best_score": result_doc.get("best_score"),
            "worst_score": result_doc.get("worst_score"),
            "total_models": result_doc.get("total_models"),
            "category_distribution": result_doc.get("category_distribution", {})
        }