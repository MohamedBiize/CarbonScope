# Instructions de déploiement permanent - CarbonScope AI

Ce document contient les instructions détaillées pour déployer de manière permanente l'application CarbonScope AI sur Vercel (frontend) et Render (backend).

## 1. Déploiement du Frontend sur Vercel

### Prérequis
- Un compte Vercel (inscription gratuite sur [vercel.com](https://vercel.com))
- Un compte GitHub pour héberger le code source

### Étapes de déploiement

1. **Préparation du dépôt GitHub**
   ```bash
   # Créer un nouveau dépôt GitHub pour le frontend
   git init
   git add .
   git commit -m "Initial commit for CarbonScope AI frontend"
   git remote add origin https://github.com/votre-utilisateur/carbonscope-frontend.git
   git push -u origin main
   ```

2. **Déploiement sur Vercel**
   - Connectez-vous à votre compte Vercel
   - Cliquez sur "New Project"
   - Importez votre dépôt GitHub
   - Configurez le projet :
     - Framework Preset: Next.js
     - Root Directory: frontend
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Dans "Environment Variables", ajoutez :
     - `NEXT_PUBLIC_API_URL`: URL de votre API backend (ex: https://carbonscope-api.onrender.com)
   - Cliquez sur "Deploy"

3. **Vérification du déploiement**
   - Une fois le déploiement terminé, Vercel fournira une URL (ex: https://carbonscope.vercel.app)
   - Vérifiez que l'application fonctionne correctement en naviguant sur cette URL

## 2. Déploiement du Backend sur Render

### Prérequis
- Un compte Render (inscription gratuite sur [render.com](https://render.com))
- Un compte GitHub pour héberger le code source
- Un compte MongoDB Atlas pour la base de données

### Étapes de déploiement

1. **Configuration de MongoDB Atlas**
   - Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Créez un nouveau cluster (l'option gratuite est suffisante pour commencer)
   - Configurez un utilisateur de base de données avec mot de passe
   - Configurez les règles de réseau pour autoriser les connexions depuis n'importe où (0.0.0.0/0)
   - Obtenez l'URI de connexion (format: `mongodb+srv://username:password@cluster.mongodb.net/carbonscope`)

2. **Préparation du dépôt GitHub**
   ```bash
   # Créer un nouveau dépôt GitHub pour le backend
   git init
   git add .
   git commit -m "Initial commit for CarbonScope AI backend"
   git remote add origin https://github.com/votre-utilisateur/carbonscope-backend.git
   git push -u origin main
   ```

3. **Déploiement sur Render**
   - Connectez-vous à votre compte Render
   - Cliquez sur "New Web Service"
   - Sélectionnez votre dépôt GitHub
   - Configurez le service :
     - Name: carbonscope-api
     - Environment: Python
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `cd app && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Dans "Environment Variables", ajoutez :
     - `MONGODB_URI`: URI de connexion MongoDB Atlas
     - `SECRET_KEY`: Clé secrète pour JWT (générez une chaîne aléatoire)
     - `ALGORITHM`: HS256
     - `ACCESS_TOKEN_EXPIRE_MINUTES`: 30
     - `FRONTEND_URL`: URL de votre frontend (ex: https://carbonscope.vercel.app)
   - Cliquez sur "Create Web Service"

4. **Vérification du déploiement**
   - Une fois le déploiement terminé, Render fournira une URL (ex: https://carbonscope-api.onrender.com)
   - Vérifiez que l'API fonctionne correctement en accédant à l'URL + "/health" (ex: https://carbonscope-api.onrender.com/health)

## 3. Configuration CORS et connexion Frontend-Backend

1. **Mise à jour de la configuration CORS dans le backend**
   - Assurez-vous que le fichier `main.py` contient la configuration CORS correcte avec l'URL de votre frontend

2. **Mise à jour de l'URL de l'API dans le frontend**
   - Vérifiez que la variable d'environnement `NEXT_PUBLIC_API_URL` dans Vercel pointe vers votre API backend

## 4. Importation des données initiales

1. **Préparation du script d'importation**
   ```python
   # Créez un script Python pour importer les données du CSV dans MongoDB
   import pandas as pd
   from pymongo import MongoClient
   
   # Connexion à MongoDB
   client = MongoClient("votre-uri-mongodb")
   db = client.carbonscope
   
   # Lecture du CSV
   df = pd.read_csv("final_llm_carbon_dataset_filled.csv")
   
   # Conversion en liste de dictionnaires
   models = df.to_dict("records")
   
   # Insertion dans MongoDB
   db.models.insert_many(models)
   
   print(f"Importation réussie de {len(models)} modèles")
   ```

2. **Exécution du script d'importation**
   - Exécutez le script localement pour importer les données dans MongoDB Atlas

## 5. Vérification finale

1. **Test complet de l'application**
   - Accédez à l'URL de votre frontend (ex: https://carbonscope.vercel.app)
   - Testez toutes les fonctionnalités principales :
     - Inscription et connexion
     - Dashboard et filtres
     - Visualisations
     - Simulateur
     - Scores carbone
     - Profil utilisateur

2. **Configuration du domaine personnalisé (optionnel)**
   - Si vous possédez un nom de domaine, vous pouvez le configurer dans Vercel et Render
   - Suivez les instructions spécifiques à chaque plateforme pour la configuration DNS

## 6. Maintenance et mises à jour

Pour les futures mises à jour :

1. **Frontend**
   - Modifiez le code localement
   - Committez et poussez les changements vers GitHub
   - Vercel déploiera automatiquement les mises à jour

2. **Backend**
   - Modifiez le code localement
   - Committez et poussez les changements vers GitHub
   - Render déploiera automatiquement les mises à jour

## 7. Surveillance et analyse

- Utilisez les outils de surveillance intégrés de Vercel et Render pour suivre les performances
- Configurez des alertes pour être notifié en cas de problème
- Analysez les journaux pour identifier et résoudre les problèmes

---

Ces instructions vous permettront de déployer l'application CarbonScope AI de manière permanente et de la maintenir facilement à l'avenir.
