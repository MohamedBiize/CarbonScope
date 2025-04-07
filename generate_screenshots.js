// Création d'images de démonstration pour l'application CarbonScope AI
// Ce script génère des captures d'écran des principales interfaces de l'application

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Configuration
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');
const WIDTH = 1200;
const HEIGHT = 800;

// Fonction pour créer un canvas
function createNewCanvas() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

// Fonction pour dessiner le header commun
async function drawHeader(ctx) {
  // Fond du header
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, 70);
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 70, WIDTH, 1);
  
  // Logo et titre
  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('CarbonScope AI', 30, 45);
  
  // Menu de navigation
  ctx.fillStyle = '#4b5563';
  ctx.font = '16px Arial';
  const menuItems = ['Dashboard', 'Visualisations', 'Simulateur', 'Scores', 'Profil'];
  let xPos = 200;
  
  menuItems.forEach((item, index) => {
    ctx.fillStyle = index === 0 ? '#16a34a' : '#4b5563';
    ctx.fillText(item, xPos, 45);
    xPos += 130;
  });
  
  // Bouton de connexion
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(WIDTH - 120, 20, 100, 35);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 2;
  ctx.strokeRect(WIDTH - 120, 20, 100, 35);
  ctx.fillStyle = '#16a34a';
  ctx.font = '16px Arial';
  ctx.fillText('Connexion', WIDTH - 100, 42);
}

// Fonction pour dessiner le dashboard
async function drawDashboard() {
  const { canvas, ctx } = createNewCanvas();
  
  // Fond
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Header
  await drawHeader(ctx);
  
  // Titre de la page
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Dashboard', 30, 120);
  
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Arial';
  ctx.fillText('Explorez et analysez les données des modèles d\'IA et leur impact environnemental', 30, 150);
  
  // Section des filtres
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(30, 180, WIDTH - 60, 100);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 180, WIDTH - 60, 100);
  
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Filtres', 50, 210);
  
  // Filtres
  const filters = ['Architecture', 'Type de modèle', 'Taille (paramètres)', 'Score carbone', 'Date de publication'];
  let filterX = 50;
  
  filters.forEach(filter => {
    // Fond du filtre
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(filterX, 230, 200, 35);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(filterX, 230, 200, 35);
    
    // Texte du filtre
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.fillText(filter, filterX + 15, 252);
    
    // Icône de dropdown
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.moveTo(filterX + 170, 240);
    ctx.lineTo(filterX + 180, 240);
    ctx.lineTo(filterX + 175, 250);
    ctx.closePath();
    ctx.fill();
    
    filterX += 220;
  });
  
  // Tableau des modèles
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(30, 300, WIDTH - 60, 450);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 300, WIDTH - 60, 450);
  
  // En-tête du tableau
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(30, 300, WIDTH - 60, 50);
  
  const headers = ['Modèle', 'Architecture', 'Paramètres', 'Type', 'Score carbone', 'Émissions CO2', 'Actions'];
  let headerX = 50;
  
  headers.forEach(header => {
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(header, headerX, 330);
    headerX += (WIDTH - 100) / headers.length;
  });
  
  // Lignes du tableau
  const models = [
    { name: 'GPT-4', architecture: 'Transformer', params: '1000B', type: '💬 chat models', score: 'A+', emissions: '5000 kg' },
    { name: 'LLaMA-3', architecture: 'LlamaForCausalLM', params: '70B', type: '🟢 pretrained', score: 'A', emissions: '1200 kg' },
    { name: 'Mistral-7B', architecture: 'MistralForCausalLM', params: '7B', type: '🟢 pretrained', score: 'B', emissions: '800 kg' },
    { name: 'BLOOM-176B', architecture: 'BloomForCausalLM', params: '176B', type: '🟢 pretrained', score: 'C', emissions: '3200 kg' },
    { name: 'Claude-3', architecture: 'Transformer', params: '120B', type: '💬 chat models', score: 'B', emissions: '2800 kg' },
    { name: 'Gemma-7B', architecture: 'Gemma2ForCausalLM', params: '7B', type: '🟢 pretrained', score: 'A', emissions: '750 kg' }
  ];
  
  let rowY = 370;
  
  models.forEach((model, index) => {
    // Ligne alternée
    if (index % 2 === 0) {
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(31, rowY - 25, WIDTH - 62, 50);
    }
    
    let colX = 50;
    
    // Nom du modèle
    ctx.fillStyle = '#16a34a';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(model.name, colX, rowY);
    colX += (WIDTH - 100) / headers.length;
    
    // Architecture
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.fillText(model.architecture, colX, rowY);
    colX += (WIDTH - 100) / headers.length;
    
    // Paramètres
    ctx.fillText(model.params, colX, rowY);
    colX += (WIDTH - 100) / headers.length;
    
    // Type
    ctx.fillText(model.type, colX, rowY);
    colX += (WIDTH - 100) / headers.length;
    
    // Score carbone
    ctx.fillStyle = model.score === 'A+' || model.score === 'A' ? '#16a34a' : 
                   model.score === 'B' ? '#ca8a04' : '#dc2626';
    ctx.fillRect(colX, rowY - 15, 30, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(model.score, colX + 8, rowY);
    colX += (WIDTH - 100) / headers.length;
    
    // Émissions CO2
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.fillText(model.emissions, colX, rowY);
    colX += (WIDTH - 100) / headers.length;
    
    // Boutons d'action
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(colX, rowY - 15, 80, 25);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('Détails', colX + 20, rowY);
    
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 1;
    ctx.strokeRect(colX + 90, rowY - 15, 80, 25);
    ctx.fillStyle = '#16a34a';
    ctx.font = '12px Arial';
    ctx.fillText('Comparer', colX + 100, rowY);
    
    rowY += 50;
  });
  
  // Pagination
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(WIDTH - 250, HEIGHT - 50, 200, 30);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(WIDTH - 250, HEIGHT - 50, 200, 30);
  
  ctx.fillStyle = '#374151';
  ctx.font = '14px Arial';
  ctx.fillText('Page 1 sur 76', WIDTH - 180, HEIGHT - 30);
  
  // Enregistrer l'image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'dashboard.png'), buffer);
  
  console.log('Dashboard screenshot created');
}

// Fonction pour dessiner le simulateur
async function drawSimulator() {
  const { canvas, ctx } = createNewCanvas();
  
  // Fond
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Header
  await drawHeader(ctx);
  
  // Titre de la page
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Simulateur d\'impact', 30, 120);
  
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Arial';
  ctx.fillText('Calculez l\'impact environnemental de l\'utilisation d\'un modèle d\'IA selon vos paramètres', 30, 150);
  
  // Conteneur principal
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(30, 180, WIDTH - 60, 570);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 180, WIDTH - 60, 570);
  
  // Grille 3 colonnes
  const colWidth = (WIDTH - 120) / 3;
  
  // Colonne 1: Sélection du modèle
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(60, 210, colWidth - 30, 510);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 210, colWidth - 30, 510);
  
  // Titre de la colonne 1
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Étape 1: Sélectionner un modèle', 80, 240);
  
  // Barre de recherche
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80, 260, colWidth - 70, 40);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 260, colWidth - 70, 40);
  
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px Arial';
  ctx.fillText('Rechercher un modèle...', 100, 285);
  
  // Liste des modèles
  const models = [
    { name: 'GPT-4', architecture: 'Transformer', params: '1000B' },
    { name: 'LLaMA-3', architecture: 'LlamaForCausalLM', params: '70B' },
    { name: 'Mistral-7B', architecture: 'MistralForCausalLM', params: '7B' },
    { name: 'BLOOM-176B', architecture: 'BloomForCausalLM', params: '176B' }
  ];
  
  let modelY = 320;
  
  models.forEach((model, index) => {
    // Fond du modèle (le premier est sélectionné)
    ctx.fillStyle = index === 0 ? '#dcfce7' : '#ffffff';
    ctx.fillRect(80, modelY, colWidth - 70, 80);
    ctx.strokeStyle = index === 0 ? '#16a34a' : '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, modelY, colWidth - 70, 80);
    
    // Nom du modèle
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(model.name, 100, modelY + 30);
    
    // Architecture et paramètres
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText(model.architecture, 100, modelY + 55);
    ctx.fillText(model.params, colWidth - 50, modelY + 55);
    
    modelY += 100;
  });
  
  // Colonne 2: Paramètres
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(60 + colWidth, 210, colWidth - 30, 510);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(60 + colWidth, 210, colWidth - 30, 510);
  
  // Titre de la colonne 2
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Étape 2: Configurer les paramètres', 80 + colWidth, 240);
  
  // Sélection de région
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Région d\'utilisation', 80 + colWidth, 280);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80 + colWidth, 290, colWidth - 70, 40);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(80 + colWidth, 290, colWidth - 70, 40);
  
  ctx.fillStyle = '#111827';
  ctx.font = '14px Arial';
  ctx.fillText('France (0.052 kg CO2/kWh)', 100 + colWidth, 315);
  
  // Description de la région
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';
  ctx.fillText('Principalement énergie nucléaire', 80 + colWidth, 345);
  
  // Fréquence d'utilisation
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Fréquence d\'utilisation (requêtes par jour)', 80 + colWidth, 380);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80 + colWidth, 390, colWidth - 70, 40);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(80 + colWidth, 390, colWidth - 70, 40);
  
  ctx.fillStyle = '#111827';
  ctx.font = '14px Arial';
  ctx.fillText('100', 100 + colWidth, 415);
  
  // Durée d'utilisation
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('Durée d\'utilisation (jours)', 80 + colWidth, 450);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80 + colWidth, 460, colWidth - 70, 40);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(80 + colWidth, 460, colWidth - 70, 40);
  
  ctx.fillStyle = '#111827';
  ctx.font = '14px Arial';
  ctx.fillText('30', 100 + colWidth, 485);
  
  // Bouton de calcul
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(80 + colWidth, 530, colWidth - 70, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Calculer l\'impact', 130 + colWidth, 560);
  
  // Colonne 3: Résultats
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(60 + colWidth * 2, 210, colWidth - 30, 510);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(60 + colWidth * 2, 210, colWidth - 30, 510);
  
  // Titre de la colonne 3
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Étape 3: Résultats', 80 + colWidth * 2, 240);
  
  // Carte des résultats
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80 + colWidth * 2, 260, colWidth - 70, 200);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(80 + colWidth * 2, 260, colWidth - 70, 200);
  
  // Titre de la carte
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Impact environnemental', 100 + colWidth * 2, 290);
  
  // Détails du modèle
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.fillText('Modèle:', 100 + colWidth * 2, 320);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('GPT-4', 220 + colWidth * 2, 320);
  
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.fillText('Région:', 100 + colWidth * 2, 345);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('France', 220 + colWidth * 2, 345);
  
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.fillText('Fréquence:', 100 + colWidth * 2, 370);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('100 requêtes/jour', 220 + colWidth * 2, 370);
  
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.fillText('Durée:', 100 + colWidth * 2, 395);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('30 jours', 220 + colWidth * 2, 395);
  
  // Ligne de séparation
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100 + colWidth * 2, 415);
  ctx.lineTo(colWidth * 3 - 50, 415);
  ctx.stroke();
  
  // Résultats
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.fillText('Énergie totale:', 100 + colWidth * 2, 440);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('300 kWh', 220 + colWidth * 2, 440);
  
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.fillText('Émissions CO2:', 100 + colWidth * 2, 465);
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('15.6 kg', 220 + colWidth * 2, 465);
  
  // Carte des équivalents
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80 + colWidth * 2, 480, colWidth - 70, 180);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(80 + colWidth * 2, 480, colWidth - 70, 180);
  
  // Titre de la carte
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Équivalents visuels', 100 + colWidth * 2, 510);
  
  // Équivalent voiture
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('🚗', 100 + colWidth * 2, 540);
  ctx.fillText('91.8 km en voiture', 130 + colWidth * 2, 540);
  
  // Équivalent arbres
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('🌳', 100 + colWidth * 2, 570);
  ctx.fillText('1 arbre pendant un an', 130 + colWidth * 2, 570);
  
  // Équivalent smartphone
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('📱', 100 + colWidth * 2, 600);
  ctx.fillText('3120 charges de smartphone', 130 + colWidth * 2, 600);
  
  // Boutons d'action
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80 + colWidth * 2, 680, (colWidth - 70) / 2 - 5, 40);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(80 + colWidth * 2, 680, (colWidth - 70) / 2 - 5, 40);
  
  ctx.fillStyle = '#111827';
  ctx.font = '14px Arial';
  ctx.fillText('Sauvegarder', 100 + colWidth * 2, 705);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80 + colWidth * 2 + (colWidth - 70) / 2 + 5, 680, (colWidth - 70) / 2 - 5, 40);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(80 + colWidth * 2 + (colWidth - 70) / 2 + 5, 680, (colWidth - 70) / 2 - 5, 40);
  
  ctx.fillStyle = '#111827';
  ctx.font = '14px Arial';
  ctx.fillText('Rapport', 100 + colWidth * 2 + (colWidth - 70) / 2 + 25, 705);
  
  // Enregistrer l'image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'simulateur.png'), buffer);
  
  console.log('Simulator screenshot created');
}

// Fonction pour dessiner les visualisations
async function drawVisualizations() {
  const { canvas, ctx } = createNewCanvas();
  
  // Fond
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Header
  await drawHeader(ctx);
  
  // Titre de la page
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Visualisations', 30, 120);
  
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Arial';
  ctx.fillText('Explorez les données d\'empreinte carbone des modèles d\'IA à travers des visualisations interactives', 30, 150);
  
  // Onglets
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(30, 180, WIDTH - 60, 50);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 180, WIDTH - 60, 50);
  
  const tabs = ['Tendances et évolution', 'Comparaisons', 'Corrélations', 'Carte d\'impact'];
  let tabX = 50;
  
  tabs.forEach((tab, index) => {
    ctx.fillStyle = index === 0 ? '#16a34a' : '#6b7280';
    ctx.font = index === 0 ? 'bold 16px Arial' : '16px Arial';
    ctx.fillText(tab, tabX, 210);
    
    if (index === 0) {
      // Ligne verte sous l'onglet actif
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tabX, 225);
      ctx.lineTo(tabX + ctx.measureText(tab).width, 225);
      ctx.stroke();
    }
    
    tabX += 200;
  });
  
  // Graphique principal
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(30, 250, WIDTH - 60, 300);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 250, WIDTH - 60, 300);
  
  // Titre du graphique
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Évolution des émissions CO2 au fil du temps', 50, 280);
  
  // Icônes d'action
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.fillText('⬚', WIDTH - 100, 280);
  ctx.fillText('⬇', WIDTH - 70, 280);
  
  // Graphique d'évolution (ligne)
  const months = ['2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03'];
  const co2Values = [1200, 1500, 1800, 2200, 2500, 2800, 3100, 3500, 3200, 2900];
  const countValues = [5, 8, 12, 15, 18, 22, 25, 30, 28, 24];
  
  // Axes
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 500);
  ctx.lineTo(WIDTH - 100, 500);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(80, 300);
  ctx.lineTo(80, 500);
  ctx.stroke();
  
  // Étiquettes des axes X
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';
  let labelX = 80;
  const xStep = (WIDTH - 180) / months.length;
  
  months.forEach((month, index) => {
    if (index % 2 === 0) { // Afficher une étiquette sur deux pour éviter l'encombrement
      ctx.fillText(month, labelX - 20, 520);
    }
    labelX += xStep;
  });
  
  // Étiquettes des axes Y
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial';
  ctx.fillText('0', 60, 500);
  ctx.fillText('1000', 50, 450);
  ctx.fillText('2000', 50, 400);
  ctx.fillText('3000', 50, 350);
  ctx.fillText('4000', 50, 300);
  
  // Ligne CO2
  ctx.strokeStyle = '#8884d8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  labelX = 80;
  co2Values.forEach((value, index) => {
    const y = 500 - (value / 4000) * 200;
    
    if (index === 0) {
      ctx.moveTo(labelX, y);
    } else {
      ctx.lineTo(labelX, y);
    }
    
    labelX += xStep;
  });
  
  ctx.stroke();
  
  // Points sur la ligne CO2
  labelX = 80;
  co2Values.forEach(value => {
    const y = 500 - (value / 4000) * 200;
    
    ctx.fillStyle = '#8884d8';
    ctx.beginPath();
    ctx.arc(labelX, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    labelX += xStep;
  });
  
  // Ligne Count
  ctx.strokeStyle = '#82ca9d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  labelX = 80;
  countValues.forEach((value, index) => {
    const y = 500 - (value / 30) * 200;
    
    if (index === 0) {
      ctx.moveTo(labelX, y);
    } else {
      ctx.lineTo(labelX, y);
    }
    
    labelX += xStep;
  });
  
  ctx.stroke();
  
  // Points sur la ligne Count
  labelX = 80;
  countValues.forEach(value => {
    const y = 500 - (value / 30) * 200;
    
    ctx.fillStyle = '#82ca9d';
    ctx.beginPath();
    ctx.arc(labelX, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  
    labelX += xStep;
  });
  
  // Légende
  ctx.fillStyle = '#8884d8';
  ctx.fillRect(WIDTH - 250, 270, 15, 15);
  ctx.fillStyle = '#111827';
  ctx.font = '14px Arial';
  ctx.fillText('CO2 moyen (kg)', WIDTH - 230, 283);
  
  ctx.fillStyle = '#82ca9d';
  ctx.fillRect(WIDTH - 250, 300, 15, 15);
  ctx.fillStyle = '#111827';
  ctx.font = '14px Arial';
  ctx.fillText('Nombre de modèles', WIDTH - 230, 313);
  
  // Graphiques secondaires
  // Graphique à barres
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(30, 570, (WIDTH - 90) / 2, 200);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 570, (WIDTH - 90) / 2, 200);
  
  // Titre du graphique à barres
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Émissions CO2 par architecture', 50, 600);
  
  // Barres
  const architectures = ['Transformer', 'LlamaForCausalLM', 'MistralForCausalLM', 'BloomForCausalLM'];
  const co2ByArch = [7800, 1200, 800, 3200];
  const avgByArch = [3900, 600, 400, 1600];
  
  const barWidth = 40;
  let barX = 100;
  
  architectures.forEach((arch, index) => {
    // Barre CO2 total
    const totalHeight = (co2ByArch[index] / 8000) * 120;
    ctx.fillStyle = '#8884d8';
    ctx.fillRect(barX, 700 - totalHeight, barWidth, totalHeight);
    
    // Barre CO2 moyen
    const avgHeight = (avgByArch[index] / 4000) * 120;
    ctx.fillStyle = '#82ca9d';
    ctx.fillRect(barX + barWidth + 10, 700 - avgHeight, barWidth, avgHeight);
    
    // Étiquette
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.fillText(arch.substring(0, 8) + '...', barX, 720);
    
    barX += 130;
  });
  
  // Légende
  ctx.fillStyle = '#8884d8';
  ctx.fillRect(50, 740, 15, 15);
  ctx.fillStyle = '#111827';
  ctx.font = '14px Arial';
  ctx.fillText('CO2 total (kg)', 70, 753);
  
  ctx.fillStyle = '#82ca9d';
  ctx.fillRect(200, 740, 15, 15);
  ctx.fillStyle = '#111827';
  ctx.font = '14px Arial';
  ctx.fillText('CO2 moyen (kg)', 220, 753);
  
  // Graphique circulaire
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(30 + (WIDTH - 90) / 2 + 30, 570, (WIDTH - 90) / 2, 200);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(30 + (WIDTH - 90) / 2 + 30, 570, (WIDTH - 90) / 2, 200);
  
  // Titre du graphique circulaire
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Répartition par type de modèle', 50 + (WIDTH - 90) / 2 + 30, 600);
  
  // Cercle
  const centerX = 30 + (WIDTH - 90) / 2 + 30 + (WIDTH - 90) / 4;
  const centerY = 670;
  const radius = 80;
  
  // Segments
  const types = ['💬 chat models', '🟢 pretrained', '🔶 fine-tuned'];
  const typePercents = [0.3, 0.6, 0.1];
  const typeColors = ['#0088FE', '#00C49F', '#FFBB28'];
  
  let startAngle = 0;
  
  types.forEach((type, index) => {
    const endAngle = startAngle + typePercents[index] * 2 * Math.PI;
    
    ctx.fillStyle = typeColors[index];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    
    // Étiquette
    const labelAngle = startAngle + (typePercents[index] * Math.PI);
    const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
    const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${Math.round(typePercents[index] * 100)}%`, labelX - 15, labelY + 5);
    
    startAngle = endAngle;
  });
  
  // Légende
  let legendY = 600;
  
  types.forEach((type, index) => {
    ctx.fillStyle = typeColors[index];
    ctx.fillRect(centerX + 100, legendY, 15, 15);
    ctx.fillStyle = '#111827';
    ctx.font = '14px Arial';
    ctx.fillText(type, centerX + 120, legendY + 13);
    
    legendY += 25;
  });
  
  // Enregistrer l'image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'visualisations.png'), buffer);
  
  console.log('Visualizations screenshot created');
}

// Fonction principale
async function main() {
  try {
    // Créer le répertoire de captures d'écran s'il n'existe pas
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
    
    // Générer les captures d'écran
    await drawDashboard();
    await drawSimulator();
    await drawVisualizations();
    
    console.log('All screenshots created successfully!');
  } catch (error) {
    console.error('Error generating screenshots:', error);
  }
}

// Exécuter le script
main();
