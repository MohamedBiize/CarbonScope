import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  StarIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowSmRightIcon,
  LightningBoltIcon
} from '@heroicons/react/24/outline';

// Données fictives pour le développement
const MOCK_MODELS = [
  { id: '1', model_name: 'GPT-4', parameters_billions: 1000, architecture: 'Transformer', model_type: '💬 chat models', training_co2_kg: 5000, overall_score: 90, carbon_score: 95, carbon_category: 'A+', efficiency_ratio: 0.018, rank_percentile: 95 },
  { id: '2', model_name: 'LLaMA-3', parameters_billions: 70, architecture: 'LlamaForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 1200, overall_score: 75, carbon_score: 85, carbon_category: 'A', efficiency_ratio: 0.0625, rank_percentile: 85 },
  { id: '3', model_name: 'Mistral-7B', parameters_billions: 7, architecture: 'MistralForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 800, overall_score: 65, carbon_score: 75, carbon_category: 'B', efficiency_ratio: 0.0813, rank_percentile: 75 },
  { id: '4', model_name: 'BLOOM-176B', parameters_billions: 176, architecture: 'BloomForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 3200, overall_score: 70, carbon_score: 65, carbon_category: 'C', efficiency_ratio: 0.0219, rank_percentile: 65 },
  { id: '5', model_name: 'Claude-3', parameters_billions: 120, architecture: 'Transformer', model_type: '💬 chat models', training_co2_kg: 2800, overall_score: 85, carbon_score: 70, carbon_category: 'B', efficiency_ratio: 0.0304, rank_percentile: 70 },
  { id: '6', model_name: 'Gemma-7B', parameters_billions: 7, architecture: 'Gemma2ForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 750, overall_score: 60, carbon_score: 80, carbon_category: 'A', efficiency_ratio: 0.08, rank_percentile: 80 },
  { id: '7', model_name: 'Falcon-40B', parameters_billions: 40, architecture: 'FalconForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 1800, overall_score: 68, carbon_score: 60, carbon_category: 'C', efficiency_ratio: 0.0378, rank_percentile: 60 },
  { id: '8', model_name: 'Phi-2', parameters_billions: 2.7, architecture: 'PhiForCausalLM', model_type: '🔶 fine-tuned', training_co2_kg: 350, overall_score: 55, carbon_score: 90, carbon_category: 'A+', efficiency_ratio: 0.1571, rank_percentile: 90 },
];

// Catégories de score carbone
const CARBON_CATEGORIES = {
  'A+': { min_score: 90, color: '#1a9850', description: 'Impact environnemental extrêmement faible' },
  'A': { min_score: 80, color: '#66bd63', description: 'Impact environnemental très faible' },
  'B': { min_score: 70, color: '#a6d96a', description: 'Impact environnemental faible' },
  'C': { min_score: 50, color: '#fee08b', description: 'Impact environnemental modéré' },
  'D': { min_score: 30, color: '#fdae61', description: 'Impact environnemental élevé' },
  'E': { min_score: 10, color: '#f46d43', description: 'Impact environnemental très élevé' },
  'F': { min_score: 0, color: '#d73027', description: 'Impact environnemental extrêmement élevé' }
};

export default function Scores() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'carbon_score', direction: 'descending' });
  const [selectedModel, setSelectedModel] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Simuler le chargement des données depuis l'API
  useEffect(() => {
    // Dans une vraie application, nous ferions un appel API ici
    setTimeout(() => {
      setModels(MOCK_MODELS);
      setLoading(false);
    }, 1000);
  }, []);

  // Fonction pour gérer le tri
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Trier les modèles
  const sortedModels = React.useMemo(() => {
    if (!models.length) return [];
    
    let sortableModels = [...models];
    if (sortConfig.key) {
      sortableModels.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableModels;
  }, [models, sortConfig]);

  // Fonction pour afficher les détails d'un modèle
  const showModelDetails = (model) => {
    setSelectedModel(model);
    
    // Simuler un appel API pour obtenir des recommandations
    setTimeout(() => {
      // Générer des recommandations fictives
      const modelRecommendations = models
        .filter(m => m.id !== model.id && m.carbon_score > model.carbon_score)
        .slice(0, 3)
        .map(m => ({
          original_model_id: model.id,
          original_model_name: model.model_name,
          recommended_model_id: m.id,
          recommended_model_name: m.model_name,
          co2_savings_kg: model.training_co2_kg - m.training_co2_kg,
          performance_difference_percent: ((m.overall_score - model.overall_score) / model.overall_score) * 100,
          similarity_score: Math.random() * 0.5 + 0.5, // Score de similarité fictif entre 0.5 et 1
          recommendation_reason: m.overall_score > model.overall_score 
            ? "Modèle plus écologique et plus performant" 
            : m.overall_score > model.overall_score * 0.9 
              ? "Modèle plus écologique avec des performances similaires" 
              : "Modèle plus écologique mais moins performant"
        }));
      
      setRecommendations(modelRecommendations);
      setShowRecommendations(true);
    }, 500);
  };

  // Fonction pour obtenir la couleur de fond en fonction de la catégorie
  const getCategoryBackgroundColor = (category) => {
    return CARBON_CATEGORIES[category]?.color || '#d73027';
  };

  // Fonction pour obtenir la couleur de texte en fonction de la catégorie
  const getCategoryTextColor = (category) => {
    // Pour les catégories claires (A+, A, B), utiliser du texte foncé
    if (['A+', 'A', 'B'].includes(category)) {
      return 'text-gray-900';
    }
    // Pour les catégories foncées (C, D, E, F), utiliser du texte clair
    return 'text-white';
  };

  return (
    <div>
      <Head>
        <title>Scores Carbone - CarbonScope AI</title>
        <meta name="description" content="Scores carbone et recommandations pour les modèles d'IA" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Scores Carbone</h1>
          <p className="mt-2 text-sm text-gray-700">
            Évaluez l'efficacité environnementale des modèles d'IA et découvrez des alternatives plus écologiques.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Explication des catégories */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Comprendre les scores carbone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Le score carbone évalue l'efficacité environnementale d'un modèle d'IA en fonction de son empreinte carbone 
              et de ses performances. Plus le score est élevé, plus le modèle est écologique.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {Object.entries(CARBON_CATEGORIES).map(([category, data]) => (
                <div 
                  key={category}
                  className={`rounded-lg p-3 text-center ${getCategoryTextColor(category)}`}
                  style={{ backgroundColor: data.color }}
                >
                  <div className="text-xl font-bold mb-1">{category}</div>
                  <div className="text-xs">{data.min_score}+ points</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tableau des scores */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Classement des modèles
                </h2>
              </div>
              
              {loading ? (
                <div className="text-center py-10">
                  <div className="spinner"></div>
                  <p className="mt-2 text-sm text-gray-500">Chargement des données...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <ExclamationCircleIcon className="h-10 w-10 text-red-500 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Erreur lors du chargement des données.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('model_name')}
                        >
                          <div className="flex items-center">
                            Modèle
                            {sortConfig.key === 'model_name' && (
                              sortConfig.direction === 'ascending' 
                                ? <ChevronUpIcon className="h-4 w-4 ml-1" />
                                : <ChevronDownIcon className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('carbon_score')}
                        >
                          <div className="flex items-center">
                            Score carbone
                            {sortConfig.key === 'carbon_score' && (
                              sortConfig.direction === 'ascending' 
                                ? <ChevronUpIcon className="h-4 w-4 ml-1" />
                                : <ChevronDownIcon className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('carbon_category')}
                        >
                          <div className="flex items-center">
                            Catégorie
                            {sortConfig.key === 'carbon_category' && (
                              sortConfig.direction === 'ascending' 
                                ? <ChevronUpIcon className="h-4 w-4 ml-1" />
                                : <ChevronDownIcon className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => requestSort('efficiency_ratio')}
                        >
                          <div className="flex items-center">
                            Efficacité
                            {sortConfig.key === 'efficiency_ratio' && (
                              sortConfig.direction === 'ascending' 
                                ? <ChevronUpIcon className="h-4 w-4 ml-1" />
                                : <ChevronDownIcon className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedModels.map((model) => (
                        <tr key={model.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {model.model_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="h-2.5 rounded-full" 
                                  style={{ 
                                    width: `${model.carbon_score}%`,
                                    backgroundColor: getCategoryBackgroundColor(model.carbon_category)
                                  }}
                                ></div>
                              </div>
                              <span>{model.carbon_score}/100</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryTextColor(model.carbon_category)}`}
                              style={{ backgroundColor: getCategoryBackgroundColor(model.carbon_category) }}
                            >
                              {model.carbon_category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {model.efficiency_ratio.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-green-600 hover:text-green-900"
                              onClick={() => showModelDetails(model)}
                            >
                              Détails
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Détails du modèle et recommandations */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedModel ? 'Détails du modèle' : 'Sélectionnez un modèle'}
                </h2>
              </div>
              
              {selectedModel ? (
                <div className="px-4 py-5 sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedModel.model_name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Architecture</p>
                        <p className="font-medium">{selectedModel.architecture}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{selectedModel.model_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Paramètres</p>
                        <p className="font-medium">{selectedModel.parameters_billions} milliards</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Émissions CO2</p>
                        <p className="font-medium">{selectedModel.training_co2_kg} kg</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">Score carbone</h4>
                        <span 
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryTextColor(selectedModel.carbon_category)}`}
                          style={{ backgroundColor: getCategoryBackgroundColor(selectedModel.carbon_category) }}
                        >
                          {selectedModel.carbon_category}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                          className="h-4 rounded-full" 
                          style={{ 
                            width: `${selectedModel.carbon_score}%`,
                            backgroundColor: getCategoryBackgroundColor(selectedModel.carbon_category)
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600">
                        Ce modèle se situe dans le top {100 - Math.floor(selectedModel.rank_percentile)}% des modèles les plus écologiques.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Facteurs d'évaluation</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Efficacité carbone</span>
                            <span className="font-medium">{selectedModel.efficiency_ratio.toFixed(4)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-green-500" 
                              style={{ width: `${Math.min(selectedModel.efficiency_ratio * 500, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Performance</span>
                            <span className="font-medium">{selectedModel.overall_score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-blue-500" 
                              style={{ width: `${selectedModel.overall_score}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Empreinte CO2</span>
                            <span className="font-medium">{selectedModel.training_co2_kg} kg</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-red-500" 
                              style={{ width: `${Math.min(selectedModel.training_co2_kg / 50, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recommandations */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Alternatives recommandées
                    </h3>
                    
                    {showRecommendations ? (
                      recommendations.length > 0 ? (
                        <div className="space-y-4">
                          {recommendations.map((rec, index) => (
                            <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{rec.recommended_model_name}</h4>
                                  <p className="text-sm text-green-600 mt-1">
                                    {rec.co2_savings_kg.toFixed(0)} kg CO2 économisés ({((rec.co2_savings_kg / selectedModel.training_co2_kg) * 100).toFixed(0)}%)
                                  </p>
                                </div>
                                <span 
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    rec.performance_difference_percent >= 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {rec.performance_difference_percent >= 0 
                                    ? `+${rec.performance_difference_percent.toFixed(1)}% perf` 
                                    : `${rec.performance_difference_percent.toFixed(1)}% perf`}
                                </span>
                              </div>
                              
                              <div className="mt-3 text-sm text-gray-500">
                                <p>{rec.recommendation_reason}</p>
                                <p className="mt-1">Similarité: {(rec.similarity_score * 100).toFixed(0)}%</p>
                              </div>
                              
                              <button className="mt-3 inline-flex items-center text-sm font-medium text-green-600 hover:text-green-500">
                                Voir les détails
                                <ArrowSmRightIcon className="ml-1 h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto mb-2" />
                          <p className="text-gray-500">
                            Ce modèle est déjà parmi les plus écologiques !
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <div className="spinner"></div>
                        <p className="mt-2 text-sm text-gray-500">Recherche d'alternatives...</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Sélectionnez un modèle dans le tableau pour voir ses détails et obtenir des recommandations d'alternatives plus écologiques.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Conseils pour réduire l'impact */}
          <div className="bg-green-50 shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <LightningBoltIcon className="h-5 w-5 text-green-600 mr-2" />
              Conseils pour réduire l'impact environnemental
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-2">Choisir des modèles plus petits</h3>
                <p className="text-sm text-gray-500">
                  Les modèles plus petits consomment généralement moins d'énergie tout en offrant des performances 
                  suffisantes pour de nombreuses tâches.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-2">Optimiser la fréquence d'utilisation</h3>
                <p className="text-sm text-gray-500">
                  Réduisez le nombre d'appels API et mettez en cache les résultats lorsque c'est possible pour 
                  minimiser l'empreinte carbone.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-2">Choisir des régions à faible émission</h3>
                <p className="text-sm text-gray-500">
                  Déployez vos applications dans des régions où l'électricité provient principalement de sources 
                  renouvelables ou à faible émission de carbone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #10B981;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
