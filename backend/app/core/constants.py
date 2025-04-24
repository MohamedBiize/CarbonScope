# backend/app/core/constants.py

# Données des régions et leurs facteurs d'émission
REGIONS = {
    "europe": {
        "id": "europe", # Ajouter un ID pour référence facile
        "name": "Europe",
        "co2_factor": 0.276,  # kg CO2 par kWh
        "description": "Moyenne européenne",
        "countries": ["France", "Allemagne", "Italie", "Espagne", "etc."]
    },
    "north_america": {
        "id": "north_america",
        "name": "Amérique du Nord",
        "co2_factor": 0.385,
        "description": "Moyenne nord-américaine",
        "countries": ["États-Unis", "Canada", "Mexique"]
    },
    "asia_pacific": {
        "id": "asia_pacific",
        "name": "Asie-Pacifique",
        "co2_factor": 0.555,
        "description": "Moyenne Asie-Pacifique",
        "countries": ["Chine", "Japon", "Inde", "Australie", "etc."]
    },
    "france": {
        "id": "france",
        "name": "France",
        "co2_factor": 0.052,
        "description": "Principalement énergie nucléaire",
        "countries": ["France"]
    },
    "sweden": {
        "id": "sweden",
        "name": "Suède",
        "co2_factor": 0.013,
        "description": "Principalement hydroélectricité et nucléaire",
        "countries": ["Suède"]
    },
    "china": {
        "id": "china",
        "name": "Chine",
        "co2_factor": 0.681,
        "description": "Principalement charbon",
        "countries": ["Chine"]
    }
}

# Facteurs de conversion pour les équivalents visuels
EQUIVALENTS = {
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

# Catégories de score carbone (À AJOUTER)
CARBON_CATEGORIES = {
    "A+": { "min_score": 90, "color": "#1a9850", "description": "Impact environnemental extrêmement faible" },
    "A":  { "min_score": 80, "color": "#66bd63", "description": "Impact environnemental très faible" },
    "B":  { "min_score": 70, "color": "#a6d96a", "description": "Impact environnemental faible" },
    "C":  { "min_score": 50, "color": "#fee08b", "description": "Impact environnemental modéré" },
    "D":  { "min_score": 30, "color": "#fdae61", "description": "Impact environnemental élevé" },
    "E":  { "min_score": 10, "color": "#f46d43", "description": "Impact environnemental très élevé" },
    "F":  { "min_score":  0, "color": "#d73027", "description": "Impact environnemental extrêmement élevé" }
}