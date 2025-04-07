from typing import List, Dict, Any, Optional
import json
import os
from bson import ObjectId
from datetime import datetime
import tempfile
import shutil

from app.core.config import settings


class ExportService:
    """Service pour l'export de rapports et la gestion des scénarios."""
    
    def __init__(self):
        """Initialise le service d'export."""
        self.models_db = {}
        self.exports_db = {}
        self.scenarios_db = {}
        self.export_dir = os.path.join(os.getcwd(), "exports")
        os.makedirs(self.export_dir, exist_ok=True)
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
    
    async def export_to_pdf(
        self, 
        model_ids: List[str], 
        include_simulations: bool = False, 
        include_recommendations: bool = False,
        user_id: str = None
    ) -> Optional[str]:
        """Génère un rapport PDF comparatif pour les modèles d'IA sélectionnés.
        
        Args:
            model_ids: Liste des IDs des modèles à inclure
            include_simulations: Si True, inclut les simulations
            include_recommendations: Si True, inclut les recommandations
            user_id: ID de l'utilisateur
            
        Returns:
            Optional[str]: Chemin du fichier PDF généré, None en cas d'erreur
        """
        # Dans une vraie application, nous utiliserions une bibliothèque comme ReportLab ou WeasyPrint
        # pour générer un vrai PDF. Pour cet exemple, nous allons simplement créer un fichier texte.
        
        # Récupérer les modèles
        models = []
        for model_id in model_ids:
            model = self.models_db.get(model_id)
            if model:
                models.append(model)
        
        if not models:
            return None
        
        # Créer un fichier temporaire
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_id = str(ObjectId())
        filename = f"rapport_carbonscope_{timestamp}.txt"
        file_path = os.path.join(self.export_dir, filename)
        
        # Générer le contenu du rapport
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("RAPPORT COMPARATIF CARBONSCOPE AI\n")
            f.write("================================\n\n")
            f.write(f"Date de génération: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
            
            f.write("MODÈLES COMPARÉS\n")
            f.write("--------------\n\n")
            
            for model in models:
                f.write(f"Modèle: {model['model_name']}\n")
                f.write(f"Architecture: {model['architecture']}\n")
                f.write(f"Type: {model['model_type']}\n")
                f.write(f"Taille: {model['parameters_billions']} milliards de paramètres\n")
                f.write(f"Émissions CO2: {model['training_co2_kg']} kg\n")
                f.write(f"Score global: {model['overall_score']}\n")
                f.write("\n")
            
            f.write("COMPARAISON ENVIRONNEMENTALE\n")
            f.write("--------------------------\n\n")
            
            # Trier les modèles par émissions CO2
            models_by_co2 = sorted(models, key=lambda m: m['training_co2_kg'])
            
            f.write("Classement par émissions CO2 (du plus faible au plus élevé):\n")
            for idx, model in enumerate(models_by_co2):
                f.write(f"{idx+1}. {model['model_name']}: {model['training_co2_kg']} kg CO2\n")
            
            f.write("\n")
            
            # Trier les modèles par efficacité (score/émissions)
            models_by_efficiency = sorted(
                models, 
                key=lambda m: m['overall_score'] / m['training_co2_kg'] if m['training_co2_kg'] > 0 else 0,
                reverse=True
            )
            
            f.write("Classement par efficacité carbone (score/émissions):\n")
            for idx, model in enumerate(models_by_efficiency):
                efficiency = model['overall_score'] / model['training_co2_kg'] if model['training_co2_kg'] > 0 else 0
                f.write(f"{idx+1}. {model['model_name']}: {efficiency:.4f} points/kg CO2\n")
            
            f.write("\n")
            
            if include_simulations:
                f.write("SIMULATIONS D'IMPACT\n")
                f.write("------------------\n\n")
                
                f.write("Cette section inclurait des simulations d'impact pour différents scénarios d'utilisation.\n")
                f.write("Dans une vraie application, ces données seraient générées dynamiquement.\n")
                f.write("\n")
            
            if include_recommendations:
                f.write("RECOMMANDATIONS\n")
                f.write("---------------\n\n")
                
                f.write("Cette section inclurait des recommandations de modèles alternatifs plus écologiques.\n")
                f.write("Dans une vraie application, ces données seraient générées dynamiquement.\n")
                f.write("\n")
            
            f.write("CONCLUSION\n")
            f.write("----------\n\n")
            
            f.write("Ce rapport a été généré par CarbonScope AI, une application de visualisation\n")
            f.write("de l'empreinte carbone des modèles d'IA générative.\n")
            f.write("\n")
            f.write("Pour plus d'informations, visitez notre site web.\n")
        
        # Enregistrer l'export dans la base de données
        self.exports_db[file_id] = {
            "id": file_id,
            "user_id": user_id,
            "file_path": file_path,
            "filename": filename,
            "model_ids": model_ids,
            "type": "pdf",
            "timestamp": datetime.now().isoformat()
        }
        
        return file_path
    
    async def export_to_excel(
        self, 
        model_ids: List[str], 
        include_simulations: bool = False,
        user_id: str = None
    ) -> Optional[str]:
        """Génère un fichier Excel comparatif pour les modèles d'IA sélectionnés.
        
        Args:
            model_ids: Liste des IDs des modèles à inclure
            include_simulations: Si True, inclut les simulations
            user_id: ID de l'utilisateur
            
        Returns:
            Optional[str]: Chemin du fichier Excel généré, None en cas d'erreur
        """
        # Dans une vraie application, nous utiliserions une bibliothèque comme openpyxl ou pandas
        # pour générer un vrai fichier Excel. Pour cet exemple, nous allons simplement créer un fichier CSV.
        
        # Récupérer les modèles
        models = []
        for model_id in model_ids:
            model = self.models_db.get(model_id)
            if model:
                models.append(model)
        
        if not models:
            return None
        
        # Créer un fichier temporaire
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_id = str(ObjectId())
        filename = f"export_carbonscope_{timestamp}.csv"
        file_path = os.path.join(self.export_dir, filename)
        
        # Générer le contenu du fichier CSV
        with open(file_path, 'w', encoding='utf-8') as f:
            # Écrire l'en-tête
            f.write("Nom du modèle,Architecture,Type,Paramètres (milliards),Émissions CO2 (kg),Score global,Score MMLU,Score BBH,Score Math,Date de soumission,Énergie d'entraînement (MWh),CO2 rapporté (t),Fournisseur cloud,Utilisation d'eau (millions de litres)\n")
            
            # Écrire les données des modèles
            for model in models:
                f.write(f"{model['model_name']},{model['architecture']},{model['model_type']},{model['parameters_billions']},{model['training_co2_kg']},{model['overall_score']},{model.get('mmlu_score', '')},{model.get('bbh_score', '')},{model.get('math_score', '')},{model.get('date_submitted', '')},{model.get('training_energy_mwh', '')},{model.get('reported_co2_tons', '')},{model.get('cloud_provider', '')},{model.get('water_use_million_liters', '')}\n")
        
        # Enregistrer l'export dans la base de données
        self.exports_db[file_id] = {
            "id": file_id,
            "user_id": user_id,
            "file_path": file_path,
            "filename": filename,
            "model_ids": model_ids,
            "type": "excel",
            "timestamp": datetime.now().isoformat()
        }
        
        return file_path
    
    async def get_file_path(self, file_id: str, user_id: str) -> Optional[str]:
        """Récupère le chemin d'un fichier d'export.
        
        Args:
            file_id: ID du fichier
            user_id: ID de l'utilisateur
            
        Returns:
            Optional[str]: Chemin du fichier, None si non trouvé
        """
        export = self.exports_db.get(file_id)
        
        if not export or export["user_id"] != user_id:
            return None
        
        return export["file_path"]
    
    async def save_scenario(self, scenario_data: dict, name: str, user_id: str) -> str:
        """Sauvegarde un scénario d'analyse.
        
        Args:
            scenario_data: Données du scénario
            name: Nom du scénario
            user_id: ID de l'utilisateur
            
        Returns:
            str: ID du scénario sauvegardé
        """
        scenario_id = str(ObjectId())
        
        self.scenarios_db[scenario_id] = {
            "id": scenario_id,
            "user_id": user_id,
            "name": name,
            "data": scenario_data,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        return scenario_id
    
    async def list_scenarios(self, user_id: str) -> List[Dict[str, Any]]:
        """Liste les scénarios d'analyse sauvegardés par l'utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            List[Dict[str, Any]]: Liste des scénarios
        """
        user_scenarios = []
        
        for scenario_id, scenario in self.scenarios_db.items():
            if scenario["user_id"] == user_id:
                user_scenarios.append({
                    "id": scenario_id,
                    "name": scenario["name"],
                    "created_at": scenario["created_at"],
                    "updated_at": scenario["updated_at"]
                })
        
        return user_scenarios
    
    async def get_scenario(self, scenario_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Récupère un scénario d'analyse sauvegardé.
        
        Args:
            scenario_id: ID du scénario
            user_id: ID de l'utilisateur
            
        Returns:
            Optional[Dict[str, Any]]: Scénario si trouvé, None sinon
        """
        scenario = self.scenarios_db.get(scenario_id)
        
        if not scenario or scenario["user_id"] != user_id:
            return None
        
        return scenario
    
    async def delete_scenario(self, scenario_id: str, user_id: str) -> bool:
        """Supprime un scénario d'analyse sauvegardé.
        
        Args:
            scenario_id: ID du scénario
            user_id: ID de l'utilisateur
            
        Returns:
            bool: True si le scénario a été supprimé, False sinon
        """
        scenario = self.scenarios_db.get(scenario_id)
        
        if not scenario or scenario["user_id"] != user_id:
            return False
        
        del self.scenarios_db[scenario_id]
        return True
