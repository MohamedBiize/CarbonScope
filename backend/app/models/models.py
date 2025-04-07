from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class UserBase(BaseModel):
    """Modèle de base pour les utilisateurs."""
    email: EmailStr
    username: str


class UserCreate(UserBase):
    """Modèle pour la création d'un utilisateur."""
    password: str


class UserLogin(BaseModel):
    """Modèle pour la connexion d'un utilisateur."""
    email: EmailStr
    password: str


class UserInDB(UserBase):
    """Modèle pour un utilisateur en base de données."""
    id: str
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    favorites: List[str] = []
    search_history: List[Dict[str, Any]] = []


class User(UserBase):
    """Modèle pour un utilisateur."""
    id: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime
    favorites: List[str] = []
    search_history: List[Dict[str, Any]] = []


class Token(BaseModel):
    """Modèle pour un token d'authentification."""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Modèle pour les données d'un token."""
    email: Optional[str] = None


class ModelType(str, Enum):
    """Types de modèles d'IA."""
    PRETRAINED = "🟢 pretrained"
    FINE_TUNED = "🔶 fine-tuned on domain-specific datasets"
    CHAT = "💬 chat models (RLHF, DPO, IFT, ...)"
    MERGED = "🤝 base merges and moerges"
    CONTINUOUS = "🟩 continuously pretrained"
    MULTIMODAL = "🌸 multimodal"
    OTHER = "❓ other"


class AIModel(BaseModel):
    """Modèle pour un modèle d'IA."""
    id: str
    model_name: str
    parameters_billions: float
    architecture: str
    model_type: ModelType
    training_co2_kg: float
    overall_score: float
    mmlu_score: Optional[float] = None
    bbh_score: Optional[float] = None
    math_score: Optional[float] = None
    date_submitted: Optional[datetime] = None
    training_energy_mwh: Optional[float] = None
    reported_co2_tons: Optional[float] = None
    cloud_provider: Optional[str] = None
    water_use_million_liters: Optional[float] = None
    carbon_efficiency: Optional[float] = None


class AIModelCreate(BaseModel):
    """Modèle pour la création d'un modèle d'IA."""
    model_name: str
    parameters_billions: float
    architecture: str
    model_type: ModelType
    training_co2_kg: float
    overall_score: float
    mmlu_score: Optional[float] = None
    bbh_score: Optional[float] = None
    math_score: Optional[float] = None
    date_submitted: Optional[datetime] = None
    training_energy_mwh: Optional[float] = None
    reported_co2_tons: Optional[float] = None
    cloud_provider: Optional[str] = None
    water_use_million_liters: Optional[float] = None


class AIModelUpdate(BaseModel):
    """Modèle pour la mise à jour d'un modèle d'IA."""
    model_name: Optional[str] = None
    parameters_billions: Optional[float] = None
    architecture: Optional[str] = None
    model_type: Optional[ModelType] = None
    training_co2_kg: Optional[float] = None
    overall_score: Optional[float] = None
    mmlu_score: Optional[float] = None
    bbh_score: Optional[float] = None
    math_score: Optional[float] = None
    date_submitted: Optional[datetime] = None
    training_energy_mwh: Optional[float] = None
    reported_co2_tons: Optional[float] = None
    cloud_provider: Optional[str] = None
    water_use_million_liters: Optional[float] = None


class SimulationParams(BaseModel):
    """Paramètres pour la simulation d'impact carbone."""
    model_id: str
    frequency_per_day: int = Field(gt=0)
    region: str
    cloud_provider: Optional[str] = None
    duration_days: int = Field(gt=0, default=365)


class SimulationResult(BaseModel):
    """Résultat d'une simulation d'impact carbone."""
    model_id: str
    model_name: str
    total_co2_kg: float
    total_energy_kwh: Optional[float] = None
    total_water_liters: Optional[float] = None
    equivalent_car_km: Optional[float] = None
    equivalent_trees_needed: Optional[int] = None
    equivalent_smartphone_charges: Optional[int] = None


class CarbonScore(BaseModel):
    """Score carbone pour un modèle d'IA."""
    model_id: str
    model_name: str
    carbon_score: float  # 0-100, plus élevé = plus écologique
    efficiency_ratio: float  # performance / émissions
    rank_percentile: float  # percentile parmi tous les modèles
    category: str  # A+, A, B, C, D, E, F


class ModelRecommendation(BaseModel):
    """Recommandation de modèle alternatif plus écologique."""
    original_model_id: str
    original_model_name: str
    recommended_model_id: str
    recommended_model_name: str
    co2_savings_kg: float
    performance_difference_percent: float
    similarity_score: float  # 0-1, plus élevé = plus similaire
    recommendation_reason: str


class SearchFilter(BaseModel):
    """Filtre de recherche pour les modèles d'IA."""
    model_name: Optional[str] = None
    min_parameters: Optional[float] = None
    max_parameters: Optional[float] = None
    architecture: Optional[str] = None
    model_type: Optional[ModelType] = None
    min_score: Optional[float] = None
    max_score: Optional[float] = None
    min_co2: Optional[float] = None
    max_co2: Optional[float] = None
    cloud_provider: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    sort_by: Optional[str] = "model_name"
    sort_order: Optional[str] = "asc"
    page: int = 1
    page_size: int = 20


class PaginatedResponse(BaseModel):
    """Réponse paginée pour les listes de modèles."""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


class Statistics(BaseModel):
    """Statistiques globales sur les modèles d'IA."""
    total_models: int
    average_parameters: float
    average_co2: float
    average_score: float
    total_co2: float
    most_common_architecture: str
    most_common_model_type: ModelType
    most_efficient_model: Dict[str, Any]
    least_efficient_model: Dict[str, Any]
    best_performing_model: Dict[str, Any]
    most_recent_model: Dict[str, Any]
