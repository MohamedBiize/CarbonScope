# backend/populate_db.py

import asyncio
import json

# Importer les fonctions de connexion/déconnexion et l'objet settings
# Assurez-vous que le script peut trouver ces modules.
# Si vous lancez depuis le dossier 'backend', ces imports devraient fonctionner.
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.core.config import settings

# Nom de la collection cible
COLLECTION_NAME = "ai_models"

async def populate():
    """Fonction principale pour peupler la base de données."""
    await connect_to_mongo() # Établir la connexion
    db = get_database()      # Obtenir l'objet database motor
    collection = db[COLLECTION_NAME]

    print(f"Connexion à la base '{settings.DATABASE_NAME}', collection '{COLLECTION_NAME}' établie.")

    # Optionnel : Vider la collection avant de la remplir pour éviter les doublons
    count = await collection.count_documents({})
    if count > 0:
        print(f"La collection '{COLLECTION_NAME}' contient déjà {count} documents. Suppression...")
        await collection.delete_many({})
        print("Collection vidée.")

    # Charger les données depuis le fichier JSON
    print(f"Chargement des données depuis {settings.DATA_PATH}...")
    try:
        with open(settings.DATA_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"{len(data)} modèles chargés depuis le fichier JSON.")
    except FileNotFoundError:
        print(f"ERREUR: Fichier de données non trouvé à l'emplacement : {settings.DATA_PATH}")
        print("Vérifiez la variable DATA_PATH dans .env ou config.py")
        await close_mongo_connection()
        return
    except Exception as e:
        print(f"ERREUR lors de la lecture du fichier JSON : {e}")
        await close_mongo_connection()
        return

    # Préparer et insérer les données
    models_to_insert = []
    print("Préparation des données pour l'insertion...")
    for model_data in data:
        # Renommer les clés et préparer le document pour MongoDB
        # (Similaire à l'ancien _load_data, mais sans générer d'ID ici, MongoDB le fera)
        processed_data = {
            "model_name": model_data.get("Model Name"), # Garder None si manquant
            "parameters_billions": model_data.get("Parameters (B)"),
            "architecture": model_data.get("Architecture"),
            "model_type": model_data.get("Model Type"), # Pourrait nécessiter validation/conversion si vous utilisez strictement l'Enum
            "training_co2_kg": model_data.get("Training CO2 (kg)"),
            "overall_score": model_data.get("Overall Score"),
            "mmlu_score": model_data.get("MMLU Score"),
            "bbh_score": model_data.get("BBH Score"),
            "math_score": model_data.get("Math Score"),
            "date_submitted": model_data.get("Date Submitted"), # Devrait être converti en datetime si format string
            "training_energy_mwh": model_data.get("Training Energy (MWh)"),
            "reported_co2_tons": model_data.get("Reported CO2 (t)"),
            "cloud_provider": model_data.get("Cloud Provider"),
            "water_use_million_liters": model_data.get("Water Use (Million Liters)")
        }
        # Filtrer les clés avec des valeurs None si vous ne voulez pas les stocker
        processed_data = {k: v for k, v in processed_data.items() if v is not None}

        # Calcul optionnel de l'efficacité (peut aussi être fait à la volée par le service si préféré)
        if processed_data.get("training_co2_kg", 0) > 0 and processed_data.get("overall_score", 0) > 0:
             processed_data["carbon_efficiency"] = processed_data["overall_score"] / processed_data["training_co2_kg"]

        # TODO: Convertir 'date_submitted' en objet datetime si c'est une chaîne
        # Exemple (si le format est 'YYYY-MM-DD'):
        # if isinstance(processed_data.get("date_submitted"), str):
        #     try:
        #         from dateutil.parser import parse
        #         processed_data["date_submitted"] = parse(processed_data["date_submitted"])
        #     except (ValueError, ImportError):
        #         print(f"Warning: Could not parse date {processed_data['date_submitted']} for {processed_data['model_name']}")
        #         processed_data["date_submitted"] = None # Ou gérer autrement

        models_to_insert.append(processed_data)

    # Insérer les données dans MongoDB
    if models_to_insert:
        print(f"Insertion de {len(models_to_insert)} modèles dans MongoDB...")
        try:
            result = await collection.insert_many(models_to_insert)
            print(f"Insertion réussie. {len(result.inserted_ids)} documents ajoutés.")
        except Exception as e:
            print(f"ERREUR lors de l'insertion dans MongoDB : {e}")
    else:
        print("Aucune donnée à insérer.")

    await close_mongo_connection() # Fermer la connexion

if __name__ == "__main__":
    print("Lancement du script de peuplement de la base de données...")
    asyncio.run(populate())
    print("Script terminé.")