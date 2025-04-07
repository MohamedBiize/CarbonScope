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
