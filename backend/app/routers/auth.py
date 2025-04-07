from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any, List

from app.core.security import create_access_token, verify_password, get_current_active_user
from app.models.models import User, UserCreate, Token, UserLogin
from app.services.user_service import UserService
from app.core.config import settings

router = APIRouter()


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user_create: UserCreate) -> Any:
    """
    Enregistre un nouvel utilisateur.
    """
    # Vérifier si l'utilisateur existe déjà
    user_service = UserService()
    existing_user = await user_service.get_user_by_email(user_create.email)
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )
    
    # Créer le nouvel utilisateur
    user = await user_service.create_user(user_create)
    return user


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    Authentifie un utilisateur et génère un token JWT.
    """
    user_service = UserService()
    user = await user_service.get_user_by_email(form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)) -> Any:
    """
    Récupère les informations de l'utilisateur connecté.
    """
    return current_user


@router.put("/me", response_model=User)
async def update_user(
    user_update: UserCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Met à jour les informations de l'utilisateur connecté.
    """
    user_service = UserService()
    updated_user = await user_service.update_user(current_user.id, user_update)
    return updated_user


@router.post("/me/favorites/{model_id}", response_model=User)
async def add_favorite(
    model_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Ajoute un modèle aux favoris de l'utilisateur.
    """
    user_service = UserService()
    updated_user = await user_service.add_favorite(current_user.id, model_id)
    return updated_user


@router.delete("/me/favorites/{model_id}", response_model=User)
async def remove_favorite(
    model_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Supprime un modèle des favoris de l'utilisateur.
    """
    user_service = UserService()
    updated_user = await user_service.remove_favorite(current_user.id, model_id)
    return updated_user


@router.get("/me/favorites", response_model=List[Any])
async def get_favorites(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Récupère les modèles favoris de l'utilisateur.
    """
    user_service = UserService()
    favorites = await user_service.get_favorites(current_user.id)
    return favorites


@router.get("/me/history", response_model=List[Any])
async def get_search_history(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Récupère l'historique de recherche de l'utilisateur.
    """
    user_service = UserService()
    history = await user_service.get_search_history(current_user.id)
    return history


@router.delete("/me/history", response_model=User)
async def clear_search_history(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Efface l'historique de recherche de l'utilisateur.
    """
    user_service = UserService()
    updated_user = await user_service.clear_search_history(current_user.id)
    return updated_user
