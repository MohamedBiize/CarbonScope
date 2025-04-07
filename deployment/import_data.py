#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script d'importation des données pour CarbonScope AI
Ce script importe les données du CSV dans MongoDB Atlas
"""

import pandas as pd
from pymongo import MongoClient
import sys
import os

def import_data(mongodb_uri, csv_path):
    try:
        # Connexion à MongoDB
        print(f"Connexion à MongoDB...")
        client = MongoClient(mongodb_uri)
        db = client.carbonscope
        
        # Vérification de la connexion
        client.admin.command('ping')
        print("✅ Connexion à MongoDB réussie")
        
        # Lecture du CSV
        print(f"Lecture du fichier CSV: {csv_path}")
        df = pd.read_csv(csv_path)
        print(f"✅ Fichier CSV lu avec succès ({len(df)} lignes)")
        
        # Conversion en liste de dictionnaires
        models = df.to_dict("records")
        
        # Suppression des données existantes
        print("Suppression des données existantes...")
        db.models.delete_many({})
        
        # Insertion dans MongoDB
        print(f"Insertion de {len(models)} modèles dans MongoDB...")
        result = db.models.insert_many(models)
        
        print(f"✅ Importation réussie de {len(result.inserted_ids)} modèles")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'importation des données: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python import_data.py <mongodb_uri> <csv_path>")
        sys.exit(1)
    
    mongodb_uri = sys.argv[1]
    csv_path = sys.argv[2]
    
    success = import_data(mongodb_uri, csv_path)
    sys.exit(0 if success else 1)
