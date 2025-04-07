# Rapport de développement - CarbonScope AI

## Résumé du projet

CarbonScope AI est une application web complète permettant d'analyser, visualiser et simuler l'impact environnemental des modèles d'intelligence artificielle. L'application offre un dashboard interactif, des visualisations avancées, un simulateur d'impact personnalisé, un système de score carbone et des fonctionnalités d'export de rapports.

## Architecture technique

### Frontend
- **Framework** : React.js avec Next.js
- **Styles** : Tailwind CSS
- **Visualisations** : Recharts
- **Cartographie** : Mapbox
- **Authentification** : JWT avec contexte React

### Backend
- **Framework** : FastAPI (Python)
- **Base de données** : MongoDB
- **Authentification** : JWT avec hachage bcrypt
- **Exports** : PDF (fpdf2) et Excel (openpyxl)

### Déploiement
- **Frontend** : Vercel
- **Backend** : Render
- **Base de données** : MongoDB Atlas (cloud)

## Fonctionnalités implémentées

### 1. Dashboard interactif
- Filtres dynamiques (architecture, type, taille, score carbone, date)
- Tableau de données paginé avec tri
- Actions rapides (détails, comparaison)
- Indicateurs visuels de performance environnementale

### 2. Visualisations avancées
- Graphiques d'évolution temporelle des émissions
- Comparaisons par architecture et type de modèle
- Corrélations entre taille, performance et émissions
- Carte d'impact géographique

### 3. Simulateur d'impact
- Interface en 3 étapes (sélection du modèle, paramètres, résultats)
- Calcul personnalisé selon la région, fréquence et durée d'utilisation
- Équivalents visuels (km en voiture, arbres, charges de smartphone)
- Export des résultats en PDF

### 4. Score carbone
- Système de notation écologique (A+, A, B, C, D)
- Benchmark par rapport aux modèles similaires
- Recommandations de modèles alternatifs plus écologiques
- Détail des critères d'évaluation

### 5. Système d'authentification
- Inscription et connexion par email
- Profil utilisateur personnalisable
- Gestion des favoris et historique
- Préférences utilisateur (thème, vue par défaut)

### 6. Exports et rapports
- Génération de rapports PDF détaillés
- Export des données en format Excel
- Partage de résultats par email
- Sauvegarde des scénarios de simulation

## Analyse des données

Le jeu de données contient 4577 modèles d'IA avec les caractéristiques suivantes :
- Forte corrélation (0.72) entre taille des modèles et émissions CO2
- Corrélation plus faible (0.20) entre performance et émissions
- Données manquantes gérées avec des indicateurs visuels
- Pics d'émissions identifiés en janvier 2025

## Instructions de déploiement

### Déploiement du frontend (Vercel)
1. Créer un compte sur Vercel (https://vercel.com)
2. Connecter votre dépôt GitHub contenant le code frontend
3. Configurer les variables d'environnement :
   - `NEXT_PUBLIC_API_URL` : URL de l'API backend déployée
4. Lancer le déploiement

### Déploiement du backend (Render)
1. Créer un compte sur Render (https://render.com)
2. Créer un nouveau service Web
3. Connecter votre dépôt GitHub contenant le code backend
4. Configurer les variables d'environnement :
   - `MONGODB_URI` : URI de connexion à MongoDB Atlas
   - `SECRET_KEY` : Clé secrète pour JWT (générer une clé aléatoire)
   - `FRONTEND_URL` : URL du frontend déployé
5. Lancer le déploiement

### Configuration de la base de données (MongoDB Atlas)
1. Créer un compte sur MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Créer un nouveau cluster
3. Configurer les utilisateurs et les règles de réseau
4. Obtenir l'URI de connexion et l'utiliser dans les variables d'environnement du backend

## Structure du projet

```
carbonscope/
├── frontend/               # Application React/Next.js
│   ├── components/         # Composants réutilisables
│   ├── pages/              # Pages de l'application
│   ├── styles/             # Styles CSS
│   ├── public/             # Fichiers statiques
│   ├── utils/              # Fonctions utilitaires
│   ├── next.config.js      # Configuration Next.js
│   └── vercel.json         # Configuration Vercel
│
├── backend/                # API FastAPI
│   ├── app/                # Code principal
│   │   ├── models/         # Modèles de données
│   │   ├── routers/        # Routes API
│   │   ├── services/       # Services métier
│   │   ├── core/           # Configuration centrale
│   │   └── utils/          # Utilitaires
│   ├── tests/              # Tests unitaires
│   ├── requirements.txt    # Dépendances Python
│   └── render.yaml         # Configuration Render
│
├── database/               # Scripts de base de données
│
├── docs/                   # Documentation
│
└── resultats/              # Résultats d'analyse
    └── figures/            # Visualisations générées
```

## Captures d'écran

Les captures d'écran des principales interfaces sont disponibles dans le dossier `/screenshots` :
- `dashboard.png` : Dashboard interactif avec filtres et tableau de données
- `simulateur.png` : Interface du simulateur d'impact en 3 étapes
- `visualisations.png` : Graphiques interactifs d'analyse des émissions

## Prochaines étapes

1. **Optimisation des performances** : Mise en cache des requêtes fréquentes
2. **Fonctionnalités avancées** : 
   - Comparaison côte à côte de plusieurs modèles
   - Prédiction d'impact futur avec apprentissage automatique
   - Intégration avec des APIs externes de données environnementales
3. **Internationalisation** : Support de langues supplémentaires
4. **Application mobile** : Version React Native pour iOS et Android
5. **Rôle administrateur** : Interface de gestion des utilisateurs et des données

## Conclusion

CarbonScope AI offre une solution complète pour analyser l'impact environnemental des modèles d'IA, avec une interface intuitive et des fonctionnalités avancées. L'application est prête à être déployée en production et peut être facilement étendue avec de nouvelles fonctionnalités à l'avenir.
