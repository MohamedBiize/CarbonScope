from typing import List, Dict, Any, Optional
import json
import os
from bson import ObjectId
from datetime import datetime

from app.core.config import settings
from app.models.models import SimulationParams, SimulationResult


class SimulationService:
    """Service pour la simulation d'impact carbone des modèles d'IA."""
    
    def __init__(self):
        """Initialise le service de simulation."""
        self.simulations_db = {}
        self.models_db = {}
        self.regions = self._load_regions()
        self.equivalents = self._load_equivalents()
        self._load_models()
    
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
    
    def _load_regions(self) -> Dict[str, Dict[str, Any]]:
        """Charge les données des régions et leurs facteurs d'émission.
        
        Returns:
            Dict[str, Dict[str, Any]]: Données des régions
        """
        # Dans une vraie application, ces données seraient chargées depuis une base de données
        # ou un fichier de configuration
        return {
            "europe": {
                "name": "Europe",
                "co2_factor": 0.276,  # kg CO2 par kWh
                "description": "Moyenne européenne",
                "countries": ["France", "Allemagne", "Italie", "Espagne", "etc."]
            },
            "north_america": {
                "name": "Amérique du Nord",
                "co2_factor": 0.385,  # kg CO2 par kWh
                "description": "Moyenne nord-américaine",
                "countries": ["États-Unis", "Canada", "Mexique"]
            },
            "asia_pacific": {
                "name": "Asie-Pacifique",
                "co2_factor": 0.555,  # kg CO2 par kWh
                "description": "Moyenne Asie-Pacifique",
                "countries": ["Chine", "Japon", "Inde", "Australie", "etc."]
            },
            "france": {
                "name": "France",
                "co2_factor": 0.052,  # kg CO2 par kWh (faible grâce au nucléaire)
                "description": "Principalement énergie nucléaire",
                "countries": ["France"]
            },
            "sweden": {
                "name": "Suède",
                "co2_factor": 0.013,  # kg CO2 par kWh (très faible)
                "description": "Principalement hydroélectricité et nucléaire",
                "countries": ["Suède"]
            },
            "china": {
                "name": "Chine",
                "co2_factor": 0.681,  # kg CO2 par kWh (élevé)
                "description": "Principalement charbon",
                "countries": ["Chine"]
            }
        }
    
    def _load_equivalents(self) -> Dict[str, Dict[str, Any]]:
        """Charge les facteurs de conversion pour les équivalents visuels.
        
        Returns:
            Dict[str, Dict[str, Any]]: Facteurs de conversion
        """
        # Dans une vraie application, ces données seraient chargées depuis une base de données
        # ou un fichier de configuration
        return {
            "car_km": {
                "name": "Kilomètres en voiture diesel",
                "factor": 0.17,  # kg CO2 par km
                "description": "Équivalent en kilomètres parcourus en voiture diesel moyenne"
            },
            "trees": {
                "name": "Arbres nécessaires",
                "factor": 25,  # kg CO2 absorbé par arbre par an
                "description": "Nombre d'arbres nécessaires pour absorber cette quantité de CO2 en un an"
            },
            "smartphone_charges": {
                "name": "Charges de smartphone",
                "factor": 0.005,  # kg CO2 par charge
                "description": "Équivalent en nombre de charges complètes de smartphone"
            },
            "flights": {
                "name": "Vols Paris-New York",
                "factor": 1000,  # kg CO2 par vol
                "description": "Équivalent en nombre de vols aller simple Paris-New York"
            },
            "beef_kg": {
                "name": "Kilogrammes de bœuf",
                "factor": 60,  # kg CO2 par kg de bœuf
                "description": "Équivalent en kilogrammes de bœuf produit"
            }
        }
    
    async def simulate_impact(self, params: SimulationParams, user_id: str = None) -> SimulationResult:
        """Simule l'impact carbone d'un modèle d'IA selon les paramètres fournis.
        
        Args:
            params: Paramètres de simulation
            user_id: ID de l'utilisateur pour l'historique
            
        Returns:
            SimulationResult: Résultat de la simulation
        """
        # Récupérer le modèle
        model = self.models_db.get(params.model_id)
        if not model:
            raise ValueError(f"Modèle avec ID {params.model_id} non trouvé")
        
        # Récupérer le facteur d'émission de la région
        region_data = self.regions.get(params.region)
        if not region_data:
            raise ValueError(f"Région {params.region} non trouvée")
        
        # Estimer la consommation d'énergie par inférence (en kWh)
        # Ceci est une estimation simplifiée basée sur la taille du modèle
        energy_per_inference_kwh = model["parameters_billions"] * 0.0001
        
        # Calculer l'énergie totale sur la période (en kWh)
        total_energy_kwh = energy_per_inference_kwh * params.frequency_per_day * params.duration_days
        
        # Calculer les émissions de CO2 (en kg)
        total_co2_kg = total_energy_kwh * region_data["co2_factor"]
        
        # Estimer l'utilisation d'eau (en litres)
        # Ceci est une estimation simplifiée
        total_water_liters = None
        if model["water_use_million_liters"]:
            water_factor = model["water_use_million_liters"] / model["training_co2_kg"]
            total_water_liters = total_co2_kg * water_factor * 1000000  # Convertir en litres
        
        # Calculer les équivalents
        equivalent_car_km = total_co2_kg / self.equivalents["car_km"]["factor"]
        equivalent_trees_needed = int(total_co2_kg / self.equivalents["trees"]["factor"])
        equivalent_smartphone_charges = int(total_co2_kg / self.equivalents["smartphone_charges"]["factor"])
        
        # Créer et sauvegarder la simulation
        simulation_id = str(ObjectId())
        simulation_result = SimulationResult(
            model_id=params.model_id,
            model_name=model["model_name"],
            total_co2_kg=total_co2_kg,
            total_energy_kwh=total_energy_kwh,
            total_water_liters=total_water_liters,
            equivalent_car_km=equivalent_car_km,
            equivalent_trees_needed=equivalent_trees_needed,
            equivalent_smartphone_charges=equivalent_smartphone_charges
        )
        
        # Sauvegarder la simulation dans la base de données
        self.simulations_db[simulation_id] = {
            "id": simulation_id,
            "user_id": user_id,
            "params": params.model_dump(),
            "result": simulation_result.model_dump(),
            "timestamp": datetime.now().isoformat()
        }
        
        return simulation_result
    
    async def get_regions(self) -> List[Dict[str, Any]]:
        """Récupère la liste des régions disponibles pour la simulation.
        
        Returns:
            List[Dict[str, Any]]: Liste des régions
        """
        return [{"id": region_id, **region_data} for region_id, region_data in self.regions.items()]
    
    async def get_equivalents(self) -> Dict[str, Dict[str, Any]]:
        """Récupère les facteurs de conversion pour les équivalents visuels.
        
        Returns:
            Dict[str, Dict[str, Any]]: Facteurs de conversion
        """
        return self.equivalents
    
    async def get_simulation_history(self, user_id: str) -> List[SimulationResult]:
        """Récupère l'historique des simulations de l'utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            List[SimulationResult]: Historique des simulations
        """
        user_simulations = [
            sim["result"] for sim in self.simulations_db.values()
            if sim["user_id"] == user_id
        ]
        
        return [SimulationResult(**sim) for sim in user_simulations]
    
    async def save_simulation(self, simulation_id: str, user_id: str) -> bool:
        """Sauvegarde une simulation dans le profil de l'utilisateur.
        
        Args:
            simulation_id: ID de la simulation
            user_id: ID de l'utilisateur
            
        Returns:
            bool: True si la simulation a été sauvegardée, False sinon
        """
        if simulation_id not in self.simulations_db:
            return False
        
        simulation = self.simulations_db[simulation_id]
        
        # Vérifier que la simulation appartient à l'utilisateur
        if simulation["user_id"] != user_id:
            return False
        
        # Marquer la simulation comme sauvegardée
        simulation["saved"] = True
        self.simulations_db[simulation_id] = simulation
        
        return True
    
    async def delete_simulation(self, simulation_id: str, user_id: str) -> bool:
        """Supprime une simulation de l'historique de l'utilisateur.
        
        Args:
            simulation_id: ID de la simulation
            user_id: ID de l'utilisateur
            
        Returns:
            bool: True si la simulation a été supprimée, False sinon
        """
        if simulation_id not in self.simulations_db:
            return False
        
        simulation = self.simulations_db[simulation_id]
        
        # Vérifier que la simulation appartient à l'utilisateur
        if simulation["user_id"] != user_id:
            return False
        
        # Supprimer la simulation
        del self.simulations_db[simulation_id]
        
        return True
