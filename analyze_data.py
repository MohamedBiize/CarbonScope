#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script d'analyse des données pour le projet CarbonScope AI
Ce script analyse le jeu de données des modèles d'IA et leur empreinte carbone
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os
from datetime import datetime

# Configuration pour les graphiques
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 12
sns.set_palette('viridis')

# Création du dossier pour les résultats
os.makedirs('resultats', exist_ok=True)
os.makedirs('resultats/figures', exist_ok=True)

# Chargement des données
print("Chargement du jeu de données...")
df = pd.read_csv('/home/ubuntu/upload/final_llm_carbon_dataset_filled.csv')

# Affichage des informations de base
print(f"Dimensions du jeu de données: {df.shape}")
print("\nAperçu des premières lignes:")
print(df.head())

# Analyse des types de données
print("\nTypes de données:")
print(df.dtypes)

# Vérification des valeurs manquantes
print("\nValeurs manquantes par colonne:")
missing_values = df.isnull().sum()
missing_percentage = (df.isnull().sum() / len(df)) * 100
missing_info = pd.DataFrame({
    'Nombre de valeurs manquantes': missing_values,
    'Pourcentage (%)': missing_percentage
})
print(missing_info)

# Statistiques descriptives pour les colonnes numériques
print("\nStatistiques descriptives pour les colonnes numériques:")
numeric_stats = df.describe().T
print(numeric_stats)

# Analyse des modèles par architecture
print("\nRépartition des modèles par architecture:")
architecture_counts = df['Architecture'].value_counts()
print(architecture_counts)

# Analyse des modèles par type
print("\nRépartition des modèles par type:")
model_type_counts = df['Model Type'].value_counts()
print(model_type_counts)

# Analyse des fournisseurs cloud
print("\nRépartition des modèles par fournisseur cloud:")
cloud_provider_counts = df['Cloud Provider'].value_counts(dropna=False)
print(cloud_provider_counts)

# Analyse temporelle des soumissions
df['Date Submitted'] = pd.to_datetime(df['Date Submitted'], errors='coerce')
print("\nRépartition temporelle des soumissions:")
df['Year_Month'] = df['Date Submitted'].dt.strftime('%Y-%m')
submissions_by_month = df['Year_Month'].value_counts().sort_index()
print(submissions_by_month)

# Analyse de la relation entre la taille des modèles et les émissions de CO2
print("\nAnalyse de la corrélation entre la taille des modèles et les émissions de CO2:")
correlation = df['Parameters (B)'].corr(df['Training CO2 (kg)'])
print(f"Coefficient de corrélation: {correlation:.4f}")

# Analyse de la relation entre les scores de performance et les émissions de CO2
print("\nAnalyse de la corrélation entre les scores de performance et les émissions de CO2:")
performance_correlation = df['Overall Score'].corr(df['Training CO2 (kg)'])
print(f"Coefficient de corrélation: {performance_correlation:.4f}")

# Création d'un résumé des statistiques clés
summary = {
    "nombre_total_modeles": len(df),
    "taille_moyenne_modeles": df['Parameters (B)'].mean(),
    "emission_co2_moyenne": df['Training CO2 (kg)'].mean(),
    "score_moyen": df['Overall Score'].mean(),
    "architectures_principales": architecture_counts.head(5).to_dict(),
    "types_modeles_principaux": model_type_counts.head(5).to_dict(),
    "correlation_taille_co2": correlation,
    "correlation_performance_co2": performance_correlation,
    "pourcentage_donnees_manquantes": {
        "Training Energy (MWh)": missing_percentage['Training Energy (MWh)'],
        "Reported CO2 (t)": missing_percentage['Reported CO2 (t)'],
        "Cloud Provider": missing_percentage['Cloud Provider'],
        "Water Use (Million Liters)": missing_percentage['Water Use (Million Liters)']
    }
}

# Sauvegarde du résumé en JSON
with open('resultats/resume_statistiques.json', 'w', encoding='utf-8') as f:
    json.dump(summary, f, ensure_ascii=False, indent=4)

print("\nRésumé des statistiques sauvegardé dans 'resultats/resume_statistiques.json'")

# Création de visualisations

# 1. Distribution de la taille des modèles
plt.figure(figsize=(12, 6))
sns.histplot(df['Parameters (B)'], bins=30, kde=True)
plt.title('Distribution de la taille des modèles (en milliards de paramètres)')
plt.xlabel('Nombre de paramètres (milliards)')
plt.ylabel('Nombre de modèles')
plt.tight_layout()
plt.savefig('resultats/figures/distribution_taille_modeles.png')

# 2. Distribution des émissions de CO2
plt.figure(figsize=(12, 6))
sns.histplot(df['Training CO2 (kg)'], bins=30, kde=True)
plt.title('Distribution des émissions de CO2 pour l\'entraînement (kg)')
plt.xlabel('Émissions de CO2 (kg)')
plt.ylabel('Nombre de modèles')
plt.tight_layout()
plt.savefig('resultats/figures/distribution_emissions_co2.png')

# 3. Relation entre la taille des modèles et les émissions de CO2
plt.figure(figsize=(12, 8))
sns.scatterplot(x='Parameters (B)', y='Training CO2 (kg)', data=df, alpha=0.6, hue='Architecture')
plt.title('Relation entre la taille des modèles et les émissions de CO2')
plt.xlabel('Nombre de paramètres (milliards)')
plt.ylabel('Émissions de CO2 (kg)')
plt.tight_layout()
plt.savefig('resultats/figures/relation_taille_emissions.png')

# 4. Relation entre les scores de performance et les émissions de CO2
plt.figure(figsize=(12, 8))
sns.scatterplot(x='Overall Score', y='Training CO2 (kg)', data=df, alpha=0.6, hue='Architecture')
plt.title('Relation entre les scores de performance et les émissions de CO2')
plt.xlabel('Score global de performance')
plt.ylabel('Émissions de CO2 (kg)')
plt.tight_layout()
plt.savefig('resultats/figures/relation_performance_emissions.png')

# 5. Émissions moyennes par architecture
emissions_by_architecture = df.groupby('Architecture')['Training CO2 (kg)'].mean().sort_values(ascending=False)
plt.figure(figsize=(14, 8))
emissions_by_architecture.plot(kind='bar')
plt.title('Émissions moyennes de CO2 par architecture')
plt.xlabel('Architecture')
plt.ylabel('Émissions moyennes de CO2 (kg)')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('resultats/figures/emissions_moyennes_par_architecture.png')

# 6. Émissions moyennes par type de modèle
emissions_by_type = df.groupby('Model Type')['Training CO2 (kg)'].mean().sort_values(ascending=False)
plt.figure(figsize=(14, 8))
emissions_by_type.plot(kind='bar')
plt.title('Émissions moyennes de CO2 par type de modèle')
plt.xlabel('Type de modèle')
plt.ylabel('Émissions moyennes de CO2 (kg)')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('resultats/figures/emissions_moyennes_par_type.png')

# 7. Évolution temporelle des émissions de CO2
df_with_date = df.dropna(subset=['Date Submitted'])
df_with_date['Year_Month'] = df_with_date['Date Submitted'].dt.strftime('%Y-%m')
emissions_by_month = df_with_date.groupby('Year_Month')['Training CO2 (kg)'].mean()

plt.figure(figsize=(14, 8))
emissions_by_month.plot(kind='line', marker='o')
plt.title('Évolution temporelle des émissions moyennes de CO2')
plt.xlabel('Année-Mois')
plt.ylabel('Émissions moyennes de CO2 (kg)')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('resultats/figures/evolution_temporelle_emissions.png')

# 8. Top 10 des modèles les plus émetteurs de CO2
top_emitters = df.nlargest(10, 'Training CO2 (kg)')
plt.figure(figsize=(14, 8))
sns.barplot(x='Training CO2 (kg)', y='Model Name', data=top_emitters)
plt.title('Top 10 des modèles les plus émetteurs de CO2')
plt.xlabel('Émissions de CO2 (kg)')
plt.ylabel('Nom du modèle')
plt.tight_layout()
plt.savefig('resultats/figures/top10_modeles_emetteurs.png')

# 9. Top 10 des modèles les plus performants
top_performers = df.nlargest(10, 'Overall Score')
plt.figure(figsize=(14, 8))
sns.barplot(x='Overall Score', y='Model Name', data=top_performers)
plt.title('Top 10 des modèles les plus performants')
plt.xlabel('Score global de performance')
plt.ylabel('Nom du modèle')
plt.tight_layout()
plt.savefig('resultats/figures/top10_modeles_performants.png')

# 10. Efficacité carbone (score/émissions) des modèles
df['Carbon_Efficiency'] = df['Overall Score'] / df['Training CO2 (kg)']
top_efficient = df.nlargest(10, 'Carbon_Efficiency')
plt.figure(figsize=(14, 8))
sns.barplot(x='Carbon_Efficiency', y='Model Name', data=top_efficient)
plt.title('Top 10 des modèles les plus efficaces en termes de carbone (Score/Émissions)')
plt.xlabel('Efficacité carbone (Score/kg CO2)')
plt.ylabel('Nom du modèle')
plt.tight_layout()
plt.savefig('resultats/figures/top10_modeles_efficaces.png')

# Préparation des données pour l'application
# Création d'un fichier JSON avec les données nettoyées pour l'application
print("\nPréparation des données pour l'application...")

# Sélection des colonnes pertinentes
app_data = df.copy()

# Conversion des dates en format string pour JSON
app_data['Date Submitted'] = app_data['Date Submitted'].dt.strftime('%Y-%m-%d')

# Remplacement des NaN par None pour JSON
app_data = app_data.where(pd.notnull(app_data), None)

# Conversion en dictionnaire pour JSON
app_data_dict = app_data.to_dict(orient='records')

# Sauvegarde en JSON
with open('resultats/donnees_application.json', 'w', encoding='utf-8') as f:
    json.dump(app_data_dict, f, ensure_ascii=False, indent=2)

print("Données préparées et sauvegardées dans 'resultats/donnees_application.json'")

# Création d'un fichier de métadonnées pour l'application
metadata = {
    "nombre_total_modeles": len(df),
    "colonnes": list(df.columns),
    "date_analyse": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    "architectures_disponibles": list(df['Architecture'].unique()),
    "types_modeles_disponibles": list(df['Model Type'].unique()),
    "fournisseurs_cloud_disponibles": list(df['Cloud Provider'].dropna().unique()),
    "plage_dates": {
        "min": df['Date Submitted'].min().strftime('%Y-%m-%d') if not pd.isna(df['Date Submitted'].min()) else None,
        "max": df['Date Submitted'].max().strftime('%Y-%m-%d') if not pd.isna(df['Date Submitted'].max()) else None
    },
    "statistiques": {
        "taille_min": float(df['Parameters (B)'].min()),
        "taille_max": float(df['Parameters (B)'].max()),
        "taille_moyenne": float(df['Parameters (B)'].mean()),
        "emission_co2_min": float(df['Training CO2 (kg)'].min()),
        "emission_co2_max": float(df['Training CO2 (kg)'].max()),
        "emission_co2_moyenne": float(df['Training CO2 (kg)'].mean()),
        "score_min": float(df['Overall Score'].min()),
        "score_max": float(df['Overall Score'].max()),
        "score_moyen": float(df['Overall Score'].mean())
    }
}

# Sauvegarde des métadonnées en JSON
with open('resultats/metadonnees.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f, ensure_ascii=False, indent=4)

print("Métadonnées sauvegardées dans 'resultats/metadonnees.json'")
print("\nAnalyse des données terminée avec succès!")
