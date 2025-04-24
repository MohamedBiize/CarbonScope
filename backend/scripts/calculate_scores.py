# backend/scripts/calculate_scores.py

import asyncio
import math
from typing import List, Dict, Any, Tuple

# Assurez-vous que le script peut trouver les modules de l'application
# Si vous lancez depuis le dossier 'backend' avec python -m scripts.calculate_scores
# ces imports devraient fonctionner.
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.core.config import settings
from app.core.constants import CARBON_CATEGORIES # Importer les catégories

# Nom de la collection MongoDB pour les modèles AI
MODELS_COLLECTION = "ai_models"

# --- Fonctions utilitaires pour le calcul ---

def calculate_percentile_rank(value: float, sorted_values: List[float]) -> float:
    """Calcule le rang percentile (0-100, 100 = meilleur) pour une valeur donnée."""
    if not sorted_values:
        return 0.0
    # Compte combien de valeurs sont STRICTEMENT MEILLEURES (plus petites)
    better_count = sum(1 for v in sorted_values if v < value)
    # Compte combien de valeurs sont EGALES
    equal_count = sum(1 for v in sorted_values if v == value)

    # Le rang est basé sur ceux qui sont moins bons + la moitié de ceux qui sont égaux
    rank = better_count + (equal_count / 2.0)
    percentile = (rank / len(sorted_values)) * 100
    # On veut que le meilleur score (plus petite valeur) ait 100, donc on inverse
    return 100.0 - percentile

async def calculate_and_update_scores():
    """Fonction principale pour calculer et mettre à jour les scores."""
    await connect_to_mongo()
    db = get_database()
    collection = db[MODELS_COLLECTION]
    print(f"Connecté à la collection '{MODELS_COLLECTION}'.")

    # 1. Récupérer tous les modèles avec les données nécessaires
    print("Récupération des modèles depuis MongoDB...")
    models_cursor = collection.find(
        { # Filtre pour ne prendre que ceux avec les données de base
            "training_co2_kg": {"$exists": True, "$ne": None, "$gt": 0},
            "parameters_billions": {"$exists": True, "$ne": None, "$gt": 0},
            "overall_score": {"$exists": True, "$ne": None, "$gt": 0}
        },
        { # Projection pour ne récupérer que les champs utiles
            "_id": 1,
            "model_name": 1,
            "training_co2_kg": 1,
            "parameters_billions": 1,
            "overall_score": 1
        }
    )
    all_models = await models_cursor.to_list(length=None) # Charger tous les modèles éligibles
    print(f"{len(all_models)} modèles éligibles récupérés pour le calcul des scores.")

    if not all_models:
        print("Aucun modèle éligible trouvé pour calculer les scores.")
        await close_mongo_connection()
        return

    # 2. Calculer les métriques pour chaque modèle
    print("Calcul des métriques individuelles (CO2/Param, CO2/Score)...")
    metrics = {}
    valid_co2 = []
    valid_co2_per_param = []
    valid_co2_per_score = []

    for model in all_models:
        model_id_str = str(model["_id"])
        metrics[model_id_str] = {}

        # CO2 Absolu
        co2 = model["training_co2_kg"]
        metrics[model_id_str]["co2"] = co2
        valid_co2.append(co2)

        # CO2 par Paramètre
        params = model["parameters_billions"]
        co2_per_param = co2 / params
        metrics[model_id_str]["co2_per_param"] = co2_per_param
        valid_co2_per_param.append(co2_per_param)

        # CO2 par Score
        score = model["overall_score"]
        co2_per_score = co2 / score
        metrics[model_id_str]["co2_per_score"] = co2_per_score
        valid_co2_per_score.append(co2_per_score)

    # Trier les listes de valeurs pour le calcul des percentiles (ordre croissant)
    valid_co2.sort()
    valid_co2_per_param.sort()
    valid_co2_per_score.sort()

    # 3. Calculer les rangs percentiles et le score final pour chaque modèle
    print("Calcul des rangs percentiles et du score final...")
    updates = []
    for model in all_models:
        model_id_str = str(model["_id"])
        model_metrics = metrics[model_id_str]

        # Calculer les percentiles (100 = meilleur = valeur la plus basse)
        rank_co2 = calculate_percentile_rank(model_metrics["co2"], valid_co2)
        rank_co2_param = calculate_percentile_rank(model_metrics["co2_per_param"], valid_co2_per_param)
        rank_co2_score = calculate_percentile_rank(model_metrics["co2_per_score"], valid_co2_per_score)

        # Calculer le score final pondéré (AJUSTER LES POIDS ICI SI BESOIN)
        # Exemple: 40% CO2 Absolu, 40% CO2/Param, 20% CO2/Score
        final_score = (0.4 * rank_co2) + (0.4 * rank_co2_param) + (0.2 * rank_co2_score)
        final_score = max(0, min(100, final_score)) # Assurer entre 0 et 100

        # Déterminer la catégorie
        category = "F" # Catégorie par défaut
        # Trier les catégories par min_score décroissant pour trouver la bonne
        for cat, cat_data in sorted(CARBON_CATEGORIES.items(), key=lambda x: x[1]["min_score"], reverse=True):
            if final_score >= cat_data["min_score"]:
                category = cat
                break

        # Préparer l'opération de mise à jour pour ce modèle
        updates.append({
            "filter": {"_id": model["_id"]},
            "update": {
                "$set": {
                    "carbon_score": final_score,
                    "category": category,
                    "rank_percentile": final_score, # On peut utiliser le score final comme percentile global
                    "efficiency_ratio": model_metrics["co2_per_score"], # Ou 1/co2_per_score si on veut perf/co2
                    "co2_per_param": model_metrics["co2_per_param"] # Stocker pour info
                }
            }
        })

    # 4. Mettre à jour les documents dans MongoDB
    print(f"Mise à jour de {len(updates)} modèles dans MongoDB...")
    if updates:
        from pymongo import UpdateOne # Importer pour bulk_write

        bulk_operations = [UpdateOne(upd["filter"], upd["update"]) for upd in updates]
        try:
            result = await collection.bulk_write(bulk_operations)
            print(f"Mise à jour réussie. {result.modified_count} documents modifiés.")
        except Exception as e:
            print(f"ERREUR lors de la mise à jour en masse (bulk_write) : {e}")
            # Tenter la mise à jour individuelle en cas d'échec du bulk ? (Plus lent)
            # print("Tentative de mise à jour individuelle...")
            # updated_count = 0
            # for upd in updates:
            #     try:
            #         res_ind = await collection.update_one(upd["filter"], upd["update"])
            #         updated_count += res_ind.modified_count
            #     except Exception as e_ind:
            #         print(f"Erreur MAJ individuelle pour {upd['filter']}: {e_ind}")
            # print(f"Mise à jour individuelle terminée: {updated_count} modifiés.")

    await close_mongo_connection()

if __name__ == "__main__":
    print("Lancement du script de calcul des scores carbone...")
    # Utiliser asyncio.run pour exécuter la fonction async principale
    asyncio.run(calculate_and_update_scores())
    print("Script de calcul des scores terminé.")