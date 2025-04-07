#!/bin/bash

# Script de déploiement automatisé pour CarbonScope AI
# Ce script prépare et déploie l'application sur Vercel (frontend) et Render (backend)

echo "🚀 Démarrage du déploiement de CarbonScope AI..."

# Création des archives pour le déploiement
echo "📦 Création des archives pour le déploiement..."

# Création de l'archive frontend
cd /home/ubuntu/carbonscope
mkdir -p deployment/packages
cd frontend
zip -r ../deployment/packages/carbonscope-frontend.zip . -x "node_modules/*" -x ".next/*"
echo "✅ Archive frontend créée avec succès"

# Création de l'archive backend
cd /home/ubuntu/carbonscope/backend
zip -r ../deployment/packages/carbonscope-backend.zip . -x "venv/*" -x "__pycache__/*"
echo "✅ Archive backend créée avec succès"

# Préparation du script d'importation de données
cd /home/ubuntu/carbonscope/deployment
cat > import_data.py << 'EOL'
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
EOL

echo "✅ Script d'importation de données créé avec succès"

# Création du fichier README pour le déploiement
cd /home/ubuntu/carbonscope/deployment
cat > README.md << 'EOL'
# Déploiement de CarbonScope AI

Ce dossier contient tous les fichiers nécessaires pour déployer l'application CarbonScope AI sur Vercel (frontend) et Render (backend).

## Contenu du dossier

- `deploy_instructions.md` : Instructions détaillées pour le déploiement manuel
- `deploy.sh` : Script de déploiement automatisé
- `import_data.py` : Script pour importer les données dans MongoDB Atlas
- `packages/` : Archives des applications frontend et backend
  - `carbonscope-frontend.zip` : Archive du frontend (React/Next.js)
  - `carbonscope-backend.zip` : Archive du backend (FastAPI)

## Déploiement rapide

1. Créez des comptes sur [Vercel](https://vercel.com), [Render](https://render.com) et [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Suivez les instructions détaillées dans `deploy_instructions.md`
3. Utilisez les archives dans le dossier `packages/` pour le déploiement

## Liens après déploiement

- Frontend : https://carbonscope.vercel.app
- Backend : https://carbonscope-api.onrender.com

## Support

Pour toute question ou assistance, consultez la documentation complète dans le dossier `/docs`.
EOL

echo "✅ README pour le déploiement créé avec succès"

# Création du fichier .env.example pour le backend
cd /home/ubuntu/carbonscope/backend
cat > .env.example << 'EOL'
# Variables d'environnement pour le backend CarbonScope AI
# Renommez ce fichier en .env pour le développement local

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carbonscope

# Authentification
SECRET_KEY=votre_cle_secrete_tres_longue_et_aleatoire
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=https://carbonscope.vercel.app

# Port (pour le développement local)
PORT=8000
EOL

echo "✅ Fichier .env.example créé avec succès"

# Création du fichier .env.example pour le frontend
cd /home/ubuntu/carbonscope/frontend
cat > .env.example << 'EOL'
# Variables d'environnement pour le frontend CarbonScope AI
# Renommez ce fichier en .env.local pour le développement local

# API Backend
NEXT_PUBLIC_API_URL=https://carbonscope-api.onrender.com
EOL

echo "✅ Fichier .env.example créé avec succès"

# Préparation du fichier de configuration Vercel
cd /home/ubuntu/carbonscope/frontend
cat > vercel.json << 'EOL'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://carbonscope-api.onrender.com"
  }
}
EOL

echo "✅ Fichier de configuration Vercel créé avec succès"

# Préparation du fichier de configuration Render
cd /home/ubuntu/carbonscope/backend
cat > render.yaml << 'EOL'
services:
  - type: web
    name: carbonscope-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: cd app && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: MONGODB_URI
        value: ${MONGODB_URI}
      - key: SECRET_KEY
        value: ${SECRET_KEY}
      - key: ALGORITHM
        value: "HS256"
      - key: ACCESS_TOKEN_EXPIRE_MINUTES
        value: "30"
      - key: FRONTEND_URL
        value: "https://carbonscope.vercel.app"
    healthCheckPath: /health
    autoDeploy: true
EOL

echo "✅ Fichier de configuration Render créé avec succès"

# Création d'une archive complète du projet
cd /home/ubuntu
zip -r carbonscope-complete.zip carbonscope -x "carbonscope/frontend/node_modules/*" -x "carbonscope/frontend/.next/*" -x "carbonscope/backend/venv/*" -x "carbonscope/backend/__pycache__/*"

echo "✅ Archive complète du projet créée avec succès: /home/ubuntu/carbonscope-complete.zip"

echo "🎉 Préparation du déploiement terminée avec succès!"
echo "📋 Suivez les instructions dans /home/ubuntu/carbonscope/deployment/deploy_instructions.md pour finaliser le déploiement"
