from datetime import datetime, timedelta
from typing import Optional, Union, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.models.models import User, UserInDB, TokenData

# Configuration du contexte de hachage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration de l'authentification OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe en clair correspond au mot de passe haché.
    
    Args:
        plain_password: Mot de passe en clair
        hashed_password: Mot de passe haché
        
    Returns:
        bool: True si les mots de passe correspondent, False sinon
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Génère un hash pour un mot de passe.
    
    Args:
        password: Mot de passe en clair
        
    Returns:
        str: Hash du mot de passe
    """
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Crée un token JWT d'accès.
    
    Args:
        data: Données à encoder dans le token
        expires_delta: Durée de validité du token
        
    Returns:
        str: Token JWT encodé
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Récupère l'utilisateur actuel à partir du token JWT.
    
    Args:
        token: Token JWT
        
    Returns:
        User: Utilisateur actuel
        
    Raises:
        HTTPException: Si le token est invalide ou l'utilisateur n'existe pas
    """
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
    
    # Ici, vous devrez récupérer l'utilisateur depuis la base de données
    # Pour l'instant, nous utilisons une fonction fictive get_user_by_email
    user = get_user_by_email(email=token_data.email)
    
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Vérifie si l'utilisateur actuel est actif.
    
    Args:
        current_user: Utilisateur actuel
        
    Returns:
        User: Utilisateur actuel si actif
        
    Raises:
        HTTPException: Si l'utilisateur est inactif
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Utilisateur inactif")
    
    return current_user


# Fonction fictive pour récupérer un utilisateur par email
# À remplacer par une vraie fonction qui interroge la base de données
def get_user_by_email(email: str) -> Optional[User]:
    """Récupère un utilisateur par son email.
    
    Args:
        email: Email de l'utilisateur
        
    Returns:
        Optional[User]: Utilisateur si trouvé, None sinon
    """
    # Ceci est une fonction fictive pour l'exemple
    # Dans une vraie application, vous récupéreriez l'utilisateur depuis la base de données
    if email == "admin@example.com":
        return User(
            id="1",
            email="admin@example.com",
            username="admin",
            is_active=True,
            is_admin=True,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            favorites=[],
            search_history=[]
        )
    return None
