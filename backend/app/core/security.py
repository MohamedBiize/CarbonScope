# backend/app/core/security.py

from datetime import datetime, timedelta
from typing import Optional, Union, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.models.models import User, UserInDB, TokenData
# Importer le UserService réel
# from app.services.user_service import UserService

# Configuration du contexte de hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration de l'authentification OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe en clair correspond au mot de passe haché."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Génère un hash pour un mot de passe."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Crée un token JWT d'accès."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Optional[UserInDB]: # Renvoie UserInDB pour usage interne
    """Récupère l'utilisateur actuel (UserInDB) à partir du token JWT et de la DB."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    # === Modification Principale Ici ===
    # Importer UserService ici, à l'intérieur de la fonction
    from app.services.user_service import UserService
    # Utiliser le vrai UserService pour chercher l'utilisateur dans la base de données
    user_service = UserService()
    user = await user_service.get_user_by_email(email=token_data.email)
    # ==================================

    if user is None:
        raise credentials_exception

    # Retourne l'objet UserInDB (qui inclut le mot de passe hashé, etc.)
    # C'est la dépendance get_current_active_user qui vérifiera 'is_active'
    # et le routeur utilisera le modèle de réponse 'User' pour filtrer le retour.
    return user


async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB: # Attend UserInDB
    """Vérifie si l'utilisateur actuel est actif."""
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Utilisateur inactif")
    return current_user

# === Suppression de la fonction fictive ===
# def get_user_by_email(email: str) -> Optional[User]:
#     ... (ancienne fonction fictive supprimée)
# =========================================