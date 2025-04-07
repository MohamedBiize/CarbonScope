from typing import List, Dict, Any, Optional
import json
import os
from bson import ObjectId
from datetime import datetime

from app.core.config import settings
from app.models.models import User, UserCreate, UserInDB
from app.core.security import get_password_hash


class UserService:
    """Service pour la gestion des utilisateurs."""
    
    def __init__(self):
        """Initialise le service utilisateur."""
        # Dans une vraie application, nous utiliserions MongoDB
        # Pour l'instant, nous utilisons un dictionnaire en mémoire pour simuler la base de données
        self.users_db = {}
        self._load_mock_data()
    
    def _load_mock_data(self):
        """Charge des données fictives pour le développement."""
        # Créer un utilisateur admin par défaut
        admin_id = str(ObjectId())
        self.users_db[admin_id] = {
            "id": admin_id,
            "email": "admin@example.com",
            "username": "admin",
            "hashed_password": get_password_hash("admin123"),
            "is_active": True,
            "is_admin": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "favorites": [],
            "search_history": []
        }
        
        # Créer un utilisateur normal par défaut
        user_id = str(ObjectId())
        self.users_db[user_id] = {
            "id": user_id,
            "email": "user@example.com",
            "username": "user",
            "hashed_password": get_password_hash("user123"),
            "is_active": True,
            "is_admin": False,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "favorites": [],
            "search_history": []
        }
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Récupère un utilisateur par son ID.
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            Optional[UserInDB]: Utilisateur si trouvé, None sinon
        """
        user_data = self.users_db.get(user_id)
        if not user_data:
            return None
        
        return UserInDB(**user_data)
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Récupère un utilisateur par son email.
        
        Args:
            email: Email de l'utilisateur
            
        Returns:
            Optional[UserInDB]: Utilisateur si trouvé, None sinon
        """
        for user_id, user_data in self.users_db.items():
            if user_data["email"] == email:
                return UserInDB(**user_data)
        
        return None
    
    async def create_user(self, user_create: UserCreate) -> User:
        """Crée un nouvel utilisateur.
        
        Args:
            user_create: Données pour la création de l'utilisateur
            
        Returns:
            User: Utilisateur créé
        """
        user_id = str(ObjectId())
        user_data = {
            "id": user_id,
            "email": user_create.email,
            "username": user_create.username,
            "hashed_password": get_password_hash(user_create.password),
            "is_active": True,
            "is_admin": False,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "favorites": [],
            "search_history": []
        }
        
        self.users_db[user_id] = user_data
        
        return User(
            id=user_id,
            email=user_create.email,
            username=user_create.username,
            is_active=True,
            is_admin=False,
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"],
            favorites=[],
            search_history=[]
        )
    
    async def update_user(self, user_id: str, user_update: UserCreate) -> Optional[User]:
        """Met à jour un utilisateur existant.
        
        Args:
            user_id: ID de l'utilisateur à mettre à jour
            user_update: Données pour la mise à jour de l'utilisateur
            
        Returns:
            Optional[User]: Utilisateur mis à jour si trouvé, None sinon
        """
        if user_id not in self.users_db:
            return None
        
        user_data = self.users_db[user_id]
        user_data["email"] = user_update.email
        user_data["username"] = user_update.username
        user_data["hashed_password"] = get_password_hash(user_update.password)
        user_data["updated_at"] = datetime.now()
        
        self.users_db[user_id] = user_data
        
        return User(
            id=user_id,
            email=user_data["email"],
            username=user_data["username"],
            is_active=user_data["is_active"],
            is_admin=user_data["is_admin"],
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"],
            favorites=user_data["favorites"],
            search_history=user_data["search_history"]
        )
    
    async def add_favorite(self, user_id: str, model_id: str) -> Optional[User]:
        """Ajoute un modèle aux favoris de l'utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            model_id: ID du modèle à ajouter aux favoris
            
        Returns:
            Optional[User]: Utilisateur mis à jour si trouvé, None sinon
        """
        if user_id not in self.users_db:
            return None
        
        user_data = self.users_db[user_id]
        
        if model_id not in user_data["favorites"]:
            user_data["favorites"].append(model_id)
            user_data["updated_at"] = datetime.now()
            self.users_db[user_id] = user_data
        
        return User(
            id=user_id,
            email=user_data["email"],
            username=user_data["username"],
            is_active=user_data["is_active"],
            is_admin=user_data["is_admin"],
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"],
            favorites=user_data["favorites"],
            search_history=user_data["search_history"]
        )
    
    async def remove_favorite(self, user_id: str, model_id: str) -> Optional[User]:
        """Supprime un modèle des favoris de l'utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            model_id: ID du modèle à supprimer des favoris
            
        Returns:
            Optional[User]: Utilisateur mis à jour si trouvé, None sinon
        """
        if user_id not in self.users_db:
            return None
        
        user_data = self.users_db[user_id]
        
        if model_id in user_data["favorites"]:
            user_data["favorites"].remove(model_id)
            user_data["updated_at"] = datetime.now()
            self.users_db[user_id] = user_data
        
        return User(
            id=user_id,
            email=user_data["email"],
            username=user_data["username"],
            is_active=user_data["is_active"],
            is_admin=user_data["is_admin"],
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"],
            favorites=user_data["favorites"],
            search_history=user_data["search_history"]
        )
    
    async def get_favorites(self, user_id: str) -> List[Dict[str, Any]]:
        """Récupère les modèles favoris de l'utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            List[Dict[str, Any]]: Liste des modèles favoris
        """
        if user_id not in self.users_db:
            return []
        
        user_data = self.users_db[user_id]
        favorite_ids = user_data["favorites"]
        
        # Dans une vraie application, nous récupérerions les modèles depuis la base de données
        # Pour l'instant, nous retournons simplement les IDs
        return [{"id": model_id} for model_id in favorite_ids]
    
    async def get_search_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Récupère l'historique de recherche de l'utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            List[Dict[str, Any]]: Historique de recherche
        """
        if user_id not in self.users_db:
            return []
        
        user_data = self.users_db[user_id]
        return user_data["search_history"]
    
    async def add_search_history(self, user_id: str, search_data: Dict[str, Any]) -> Optional[User]:
        """Ajoute une recherche à l'historique de l'utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            search_data: Données de la recherche
            
        Returns:
            Optional[User]: Utilisateur mis à jour si trouvé, None sinon
        """
        if user_id not in self.users_db:
            return None
        
        user_data = self.users_db[user_id]
        
        search_entry = {
            "id": str(ObjectId()),
            "timestamp": datetime.now(),
            "data": search_data
        }
        
        user_data["search_history"].append(search_entry)
        user_data["updated_at"] = datetime.now()
        self.users_db[user_id] = user_data
        
        return User(
            id=user_id,
            email=user_data["email"],
            username=user_data["username"],
            is_active=user_data["is_active"],
            is_admin=user_data["is_admin"],
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"],
            favorites=user_data["favorites"],
            search_history=user_data["search_history"]
        )
    
    async def clear_search_history(self, user_id: str) -> Optional[User]:
        """Efface l'historique de recherche de l'utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            Optional[User]: Utilisateur mis à jour si trouvé, None sinon
        """
        if user_id not in self.users_db:
            return None
        
        user_data = self.users_db[user_id]
        user_data["search_history"] = []
        user_data["updated_at"] = datetime.now()
        self.users_db[user_id] = user_data
        
        return User(
            id=user_id,
            email=user_data["email"],
            username=user_data["username"],
            is_active=user_data["is_active"],
            is_admin=user_data["is_admin"],
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"],
            favorites=user_data["favorites"],
            search_history=user_data["search_history"]
        )
