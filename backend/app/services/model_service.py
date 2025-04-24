# backend/app/services/model_service.py

from typing import List, Dict, Any, Optional
from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase
import math # Pour calculer total_pages

from app.core.database import get_database
from app.models.models import AIModel, AIModelCreate, SearchFilter, PaginatedResponse, Statistics
# Import ModelType si nécessaire pour la conversion lors de la création/update
from app.models.models import ModelType

from datetime import datetime
try:
    from dateutil.parser import parse as parse_datetime
    DATEUTIL_INSTALLED = True
except ImportError:
    DATEUTIL_INSTALLED = False
    print("WARNING: python-dateutil non installé. La conversion des dates sera limitée.")

# Nom de la collection MongoDB
COLLECTION_NAME = "ai_models"

class ModelService:
    """Service pour la gestion des modèles d'IA via MongoDB."""

    def __init__(self):
        """Initialise le service avec une référence à la base de données."""
        # On n'initialise plus de dictionnaire en mémoire ici
        # La connexion est gérée globalement et obtenue via get_database()
        pass # __init__ peut être vide ou ne pas exister si pas nécessaire

    def _get_collection(self) -> AsyncIOMotorDatabase:
        """Obtient la collection MongoDB pour les modèles AI."""
        db = get_database() # Récupère la connexion DB active
        return db[COLLECTION_NAME]

    def _map_db_model_to_pydantic(self, db_model: Dict[str, Any]) -> Optional[AIModel]: # Changer le retour en Optional[AIModel]
        print(f"--- Mapping model ID: {db_model.get('_id') if db_model else 'None'}") # Log début mapping
        """Convertit un document MongoDB en modèle Pydantic AIModel, en gérant la date et les NaN/Infinity."""
        if not db_model:
            return None # Retourner None si le document est vide/None

        if "_id" in db_model:
            db_model["id"] = str(db_model.pop("_id"))

        # Nettoyer les valeurs float invalides (NaN, Infinity) avant validation Pydantic
        for key, value in db_model.items():
            if isinstance(value, float):
                if math.isnan(value) or math.isinf(value):
                    db_model[key] = None # Remplacer NaN/inf par None (null en JSON)

        # Gérer la conversion de date (code précédent)
        date_str = db_model.get("date_submitted")
        if isinstance(date_str, str) and DATEUTIL_INSTALLED:
            try:
                db_model["date_submitted"] = parse_datetime(date_str)
            except ValueError:
                print(f"Warning: Impossible de parser la date '{date_str}' pour le modèle {db_model.get('id')}. Mise à None.")
                db_model["date_submitted"] = None
        elif isinstance(date_str, str):
            print(f"Warning: python-dateutil non installé, impossible de parser la date '{date_str}'. Mise à None.")
            db_model["date_submitted"] = None
        # Assurer que si la date est déjà un datetime, elle reste un datetime
        elif not isinstance(date_str, (datetime, type(None))):
            print(f"Warning: Type de date inattendu '{type(date_str)}' pour le modèle {db_model.get('id')}. Mise à None.")
            db_model["date_submitted"] = None


        try:
            # Créer l'instance Pydantic
            print(f"--- Mapping réussi pour ID: {db_model.get('id')}")
            return AIModel(**db_model)
        except Exception as e:
            # Log plus détaillé en cas d'échec de validation Pydantic
            print(f"Erreur de validation Pydantic pour AIModel (ID: {db_model.get('id', 'inconnu')}): {e}")
            print(f"Données DB après nettoyage/traitement: {db_model}")
            # Retourner None si la validation échoue après nettoyage
            return None
        
    

    async def get_models(self, search_filter: SearchFilter, user_id: str = None) -> PaginatedResponse:
        """Récupère une liste paginée de modèles d'IA avec filtres depuis MongoDB."""
        collection = self._get_collection()
        query = {}

        # Construire la requête de filtre MongoDB
        if search_filter.model_name:
            query["model_name"] = {"$regex": search_filter.model_name, "$options": "i"} # Recherche insensible à la casse
        if search_filter.architecture:
            query["architecture"] = search_filter.architecture
        if search_filter.model_type:
            # Assurer que la valeur correspond bien à l'Enum ou au string stocké
             query["model_type"] = search_filter.model_type # Ajuster si l'Enum est utilisé différemment en DB
        if search_filter.cloud_provider:
            query["cloud_provider"] = search_filter.cloud_provider

        # Filtres numériques (range)
        param_filter = {}
        if search_filter.min_parameters is not None:
            param_filter["$gte"] = search_filter.min_parameters
        if search_filter.max_parameters is not None:
            param_filter["$lte"] = search_filter.max_parameters
        if param_filter:
            query["parameters_billions"] = param_filter

        score_filter = {}
        if search_filter.min_score is not None:
            score_filter["$gte"] = search_filter.min_score
        if search_filter.max_score is not None:
            score_filter["$lte"] = search_filter.max_score
        if score_filter:
            query["overall_score"] = score_filter

        co2_filter = {}
        if search_filter.min_co2 is not None:
            co2_filter["$gte"] = search_filter.min_co2
        if search_filter.max_co2 is not None:
            co2_filter["$lte"] = search_filter.max_co2
        if co2_filter:
            query["training_co2_kg"] = co2_filter

        # TODO: Ajouter filtres de date si nécessaire (date_from, date_to)

        # Calculer le nombre total de documents correspondant aux filtres
        print(f"--- Exécution requête MongoDB: {query}") # Log de la requête
        total = await collection.count_documents(query)
        print(f"--- Nombre total trouvé: {total}") # Log du total

        # Calculer la pagination
        skip = (search_filter.page - 1) * search_filter.page_size
        total_pages = math.ceil(total / search_filter.page_size) if search_filter.page_size > 0 else 0

        # Déterminer le tri
        sort_direction = 1 if search_filter.sort_order.lower() == "asc" else -1
        sort_key = search_filter.sort_by

        # Récupérer les documents paginés et triés
        cursor = collection.find(query).sort(sort_key, sort_direction).skip(skip).limit(search_filter.page_size)
        db_models = await cursor.to_list(length=search_filter.page_size)
        print(f"--- {len(db_models)} documents récupérés pour la page.") # Log nb documents page


        # Convertir les résultats en modèles Pydantic
        items = [self._map_db_model_to_pydantic(model) for model in db_models]

        return PaginatedResponse(
            items=items,
            total=total,
            page=search_filter.page,
            page_size=search_filter.page_size,
            total_pages=total_pages
        )

    async def get_model_by_id(self, model_id: str) -> Optional[AIModel]:
        """Récupère un modèle d'IA par son ID depuis MongoDB."""
        collection = self._get_collection()
        try:
            obj_id = ObjectId(model_id)
        except InvalidId:
            return None # ID invalide, donc modèle non trouvé

        db_model = await collection.find_one({"_id": obj_id})

        if db_model:
            return self._map_db_model_to_pydantic(db_model)
        return None

    async def create_model(self, model_create: AIModelCreate) -> AIModel:
        """Crée un nouveau modèle d'IA dans MongoDB."""
        collection = self._get_collection()

        # Convertir le modèle Pydantic en dictionnaire
        model_data = model_create.model_dump()

        # Calculer l'efficacité carbone (si applicable)
        carbon_efficiency = None
        if model_data.get("training_co2_kg", 0) > 0 and model_data.get("overall_score", 0) > 0:
             carbon_efficiency = model_data["overall_score"] / model_data["training_co2_kg"]
        model_data["carbon_efficiency"] = carbon_efficiency

        # Insérer dans la base de données
        result = await collection.insert_one(model_data)

        # Récupérer le document nouvellement créé pour le retourner
        # (find_one nécessite l'_id ObjectId)
        new_db_model = await collection.find_one({"_id": result.inserted_id})

        return self._map_db_model_to_pydantic(new_db_model)

    # --- Les méthodes suivantes ne sont PAS encore refactorisées ---
    # Elles nécessiteraient d'utiliser MongoDB (potentiellement $distinct ou $group)
    # au lieu de self.models_db qui n'existe plus.

    async def get_statistics(self) -> Statistics:
        """Récupère les statistiques globales sur les modèles d'IA."""
        # TODO: Refactoriser pour utiliser MongoDB Aggregation Framework
        # Pour l'instant, retourne des valeurs vides/par défaut
        return Statistics(
             total_models=0, average_parameters=0, average_co2=0, average_score=0,
             total_co2=0, most_common_architecture="", most_common_model_type=ModelType.OTHER, # Mettre un type par défaut
             most_efficient_model={}, least_efficient_model={}, best_performing_model={}, most_recent_model={}
        )

    async def get_architectures(self) -> List[str]:
        """Récupère la liste des architectures disponibles."""
        # TODO: Refactoriser pour utiliser collection.distinct("architecture")
        return [] # Retourne vide pour l'instant

    async def get_model_types(self) -> List[str]:
        """Récupère la liste des types de modèles disponibles."""
         # TODO: Refactoriser pour utiliser collection.distinct("model_type")
        return [] # Retourne vide pour l'instant

    async def get_cloud_providers(self) -> List[str]:
        """Récupère la liste des fournisseurs de cloud disponibles."""
        # TODO: Refactoriser pour utiliser MongoDB Aggregation Framework
        return []

    async def load_initial_data(self) -> None:
        """Charge les données initiales depuis le fichier JSON dans MongoDB."""
        import json
        from app.core.config import settings
        import os

        collection = self._get_collection()
        
        # Vérifier si la collection est déjà peuplée
        count = await collection.count_documents({})
        print(f"Nombre de documents dans la collection: {count}")
        
        if count > 0:
            print("La collection est déjà peuplée, pas de chargement initial nécessaire.")
            # Vérifier la structure des données existantes
            first_doc = await collection.find_one({})
            print("Structure du premier document:")
            print(first_doc)
            return

        try:
            # Construire le chemin absolu vers le fichier de données
            data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), settings.DATA_PATH)
            print(f"Chemin du fichier de données: {data_path}")
            
            # Vérifier si le fichier existe
            if not os.path.exists(data_path):
                print(f"ERREUR: Le fichier de données n'existe pas à {data_path}")
                return
                
            # Lire le fichier JSON
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"Nombre de modèles à charger: {len(data)}")

            # Convertir les données au format attendu par MongoDB
            models_to_insert = []
            for model in data:
                print(f"Traitement du modèle: {model.get('model_name')}")
                # Renommer les clés si nécessaire
                model_data = {
                    "model_name": model.get("model_name"),
                    "architecture": model.get("architecture"),
                    "model_type": model.get("model_type"),
                    "parameters_billions": model.get("parameters_billions"),
                    "training_co2_kg": model.get("training_co2_kg"),
                    "overall_score": model.get("overall_score"),
                    "cloud_provider": model.get("cloud_provider"),
                    "date_submitted": model.get("date_submitted")
                }
                
                # Vérifier les données requises
                if not all(model_data.values()):
                    print(f"ATTENTION: Données manquantes pour le modèle {model.get('model_name')}")
                    print(f"Données: {model_data}")
                    continue
                
                # Calculer l'efficacité carbone
                if model_data["training_co2_kg"] and model_data["overall_score"]:
                    model_data["carbon_efficiency"] = model_data["overall_score"] / model_data["training_co2_kg"]
                
                models_to_insert.append(model_data)

            # Insérer les données en masse
            if models_to_insert:
                result = await collection.insert_many(models_to_insert)
                print(f"Chargement initial réussi : {len(result.inserted_ids)} modèles insérés.")
            else:
                print("Aucun modèle à insérer.")

        except Exception as e:
            print(f"Erreur lors du chargement initial des données : {str(e)}")
            raise