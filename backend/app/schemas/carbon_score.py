from typing import List, Optional
from pydantic import BaseModel

class CarbonScoreRanking(BaseModel):
    model_id: str
    name: str
    carbon_score: float
    rank: int

class CarbonScoreCategory(BaseModel):
    category: str
    count: int
    average_score: float

class CarbonEfficiencyMetric(BaseModel):
    model_id: str
    name: str
    carbon_efficiency: float
    training_co2_kg: float
    overall_score: float 