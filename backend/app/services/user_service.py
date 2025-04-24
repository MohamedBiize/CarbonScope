# backend/app/services/user_service.py

from typing import List, Dict, Any, Optional
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status

from app.core.database import get_database
from app.models.models import User, UserCreate, UserInDB # Importer les modèles Pydantic
from app.core.security import get_password_hash # Importer la fonction de hachage

# Nom de la collection MongoDB pour les utilisateurs
USERS_COLLECTION = "users"
# Nom de la collection pour les modèles (si get_favorites est implémenté plus tard)
MODELS_COLLECTION = "ai_models"

class UserService:
    """Service pour la gestion des utilisateurs via MongoDB."""

    def _get_collection(self) -> AsyncIOMotorDatabase:
        """Obtient la collection MongoDB pour les utilisateurs."""
        db = get_database()
        return db[USERS_COLLECTION]

    def _map_db_user_to_pydantic(self, db_user: Dict[str, Any]) -> Optional[UserInDB]:
        """Convertit un document MongoDB en modèle Pydantic UserInDB."""
        if not db_user:
            return None
        if "_id" in db_user:
            db_user["id"] = str(db_user.pop("_id"))
        try:
            # Valider avec Pydantic avant de retourner
            return UserInDB(**db_user)
        except Exception as e:
            print(f"Erreur de validation Pydantic pour UserInDB: {e}, data: {db_user}")
            return None

    def _map_user_in_db_to_user(self, user_in_db: UserInDB) -> Optional[User]:
         """Convertit UserInDB en User (pour les réponses API, sans mot de passe hashé)."""
         if not user_in_db:
             return None
         # Utiliser exclude pour enlever le champ non désiré lors de la conversion
         user_data = user_in_db.dict(exclude={"hashed_password"})
         try:
             return User(**user_data)
         except Exception as e:
             print(f"Erreur de validation Pydantic pour User: {e}, data: {user_data}")
             return None

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Récupère un utilisateur par son ID depuis MongoDB."""
        collection = self._get_collection()
        try:
            obj_id = ObjectId(user_id)
        except InvalidId:
            return None
        db_user = await collection.find_one({"_id": obj_id})
        return self._map_db_user_to_pydantic(db_user)

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Récupère un utilisateur par son email depuis MongoDB."""
        collection = self._get_collection()
        db_user = await collection.find_one({"email": email})
        return self._map_db_user_to_pydantic(db_user)

    async def create_user(self, user_create: UserCreate) -> User:
        """Crée un nouvel utilisateur dans MongoDB."""
        collection = self._get_collection()

        # Vérifier si l'email existe déjà (bonne pratique même si aussi fait dans le routeur)
        existing_user = await self.get_user_by_email(user_create.email)
        if existing_user:
             raise HTTPException(
                 status_code=status.HTTP_400_BAD_REQUEST,
                 detail="Un utilisateur avec cet email existe déjà."
             )

        hashed_password = get_password_hash(user_create.password)
        now = datetime.now()

        user_doc = {
            "email": user_create.email,
            "username": user_create.username,
            "hashed_password": hashed_password,
            "is_active": True,
            "is_admin": False, # Par défaut non admin
            "created_at": now,
            "updated_at": now,
            "favorites": [],
            "search_history": []
        }

        result = await collection.insert_one(user_doc)
        # Récupérer le document inséré pour obtenir l'_id généré
        created_db_user = await collection.find_one({"_id": result.inserted_id})

        # Mapper vers UserInDB puis vers User pour la réponse
        created_user_in_db = self._map_db_user_to_pydantic(created_db_user)
        return self._map_user_in_db_to_user(created_user_in_db)


    async def update_user(self, user_id: str, user_update: UserCreate) -> Optional[User]:
         """Met à jour un utilisateur (exemple simple, n'utilise pas UserUpdate)."""
         # Note: Utiliser UserCreate pour l'update est étrange, il faudrait un modèle UserUpdate
         collection = self._get_collection()
         try:
             obj_id = ObjectId(user_id)
         except InvalidId:
             return None

         update_data = {}
         if user_update.email:
             update_data["email"] = user_update.email
         if user_update.username:
             update_data["username"] = user_update.username
         if user_update.password: # Si un nouveau mot de passe est fourni
             update_data["hashed_password"] = get_password_hash(user_update.password)
         update_data["updated_at"] = datetime.now()

         if not update_data:
             # Retourner l'utilisateur actuel si aucune donnée n'est fournie pour la mise à jour
             user_in_db = await self.get_user_by_id(user_id)
             return self._map_user_in_db_to_user(user_in_db)

         result = await collection.update_one(
             {"_id": obj_id},
             {"$set": update_data}
         )

         if result.matched_count == 0:
             return None

         updated_user_in_db = await self.get_user_by_id(user_id)
         return self._map_user_in_db_to_user(updated_user_in_db)


    async def add_favorite(self, user_id: str, model_id: str) -> Optional[User]:
        """Ajoute un modèle aux favoris dans MongoDB."""
        collection = self._get_collection()
        try:
            obj_id = ObjectId(user_id)
        except InvalidId:
            return None

        # Utiliser $addToSet pour éviter les doublons
        result = await collection.update_one(
            {"_id": obj_id},
            {"$addToSet": {"favorites": model_id}, "$set": {"updated_at": datetime.now()}}
        )

        if result.matched_count == 0:
            return None

        updated_user_in_db = await self.get_user_by_id(user_id)
        return self._map_user_in_db_to_user(updated_user_in_db)

    async def remove_favorite(self, user_id: str, model_id: str) -> Optional[User]:
        """Supprime un modèle des favoris dans MongoDB."""
        collection = self._get_collection()
        try:
            obj_id = ObjectId(user_id)
        except InvalidId:
            return None

        result = await collection.update_one(
            {"_id": obj_id},
            {"$pull": {"favorites": model_id}, "$set": {"updated_at": datetime.now()}}
        )

        if result.matched_count == 0:
            return None

        updated_user_in_db = await self.get_user_by_id(user_id)
        return self._map_user_in_db_to_user(updated_user_in_db)

    async def get_favorites(self, user_id: str) -> List[Any]:
        """Récupère les IDs des favoris (ou les modèles complets si implémenté)."""
        user = await self.get_user_by_id(user_id) # Récupère UserInDB
        if not user:
            return []

        favorite_ids = user.favorites
        if not favorite_ids:
             return []

        # TODO: Implémenter la récupération des détails des modèles favoris
        # depuis la collection 'ai_models' si nécessaire.
        # Exemple:
        # model_collection = get_database()[MODELS_COLLECTION]
        # obj_ids = [ObjectId(fid) for fid in favorite_ids try ObjectId(fid) except InvalidId: None]
        # valid_obj_ids = [oid for oid in obj_ids if oid is not None]
        # cursor = model_collection.find({"_id": {"$in": valid_obj_ids}})
        # favorite_models = await cursor.to_list(length=len(valid_obj_ids))
        # return [ModelService()._map_db_model_to_pydantic(model) for model in favorite_models]

        # Pour l'instant, retourne juste les IDs
        return favorite_ids

    async def get_search_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Récupère l'historique de recherche."""
        user = await self.get_user_by_id(user_id)
        return user.search_history if user else []

    # La méthode add_search_history n'était pas dans le routeur, mais voici une ébauche
    async def add_search_history(self, user_id: str, search_data: Dict[str, Any]):
         collection = self._get_collection()
         try:
             obj_id = ObjectId(user_id)
         except InvalidId:
             return None # Ou lever une exception

         search_entry = {
             # "id": str(ObjectId()), # Pas besoin d'ID pour l'entrée d'historique? Ou si, comme sous-document?
             "timestamp": datetime.now(),
             "data": search_data
         }
         # Ajouter au début de la liste et limiter la taille ?
         await collection.update_one(
             {"_id": obj_id},
             {"$push": {"search_history": {"$each": [search_entry], "$slice": -20}}, # Garde les 20 derniers
              "$set": {"updated_at": datetime.now()}}
         )
         # Pas besoin de retourner l'utilisateur ici généralement

    async def clear_search_history(self, user_id: str) -> Optional[User]:
        """Efface l'historique de recherche."""
        collection = self._get_collection()
        try:
            obj_id = ObjectId(user_id)
        except InvalidId:
            return None

        result = await collection.update_one(
            {"_id": obj_id},
            {"$set": {"search_history": [], "updated_at": datetime.now()}}
        )

        if result.matched_count == 0:
            return None

        updated_user_in_db = await self.get_user_by_id(user_id)
        return self._map_user_in_db_to_user(updated_user_in_db)