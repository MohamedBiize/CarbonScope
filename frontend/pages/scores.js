import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../utils/api';
import {
  StarIcon, ChevronUpIcon, ChevronDownIcon, ExclamationCircleIcon, CheckCircleIcon,
  ArrowSmallRightIcon, BoltIcon, MagnifyingGlassIcon, FunnelIcon
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
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'carbon_score', direction: 'descending' });
  const [selectedModel, setSelectedModel] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: '',
    category: '',
    architecture: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [carbonCategories, setCarbonCategories] = useState({});
  const [efficiencyMetrics, setEfficiencyMetrics] = useState(null);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [rankingData, categoriesData, metricsData] = await Promise.all([
          fetchWithAuth('/api/v1/carbon-scores/ranking?limit=50'),
          fetchWithAuth('/api/v1/carbon-scores/categories'),
          fetchWithAuth('/api/v1/carbon-scores/efficiency-metrics')
        ]);
        
        setModels(rankingData);
        setCarbonCategories(categoriesData);
        setEfficiencyMetrics(metricsData);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrer et trier les modèles
  const filteredAndSortedModels = React.useMemo(() => {
    let result = [...models];
    
    // Appliquer les filtres
    if (searchTerm) {
      result = result.filter(model => 
        model.model_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.minScore) {
      result = result.filter(model => model.carbon_score >= Number(filters.minScore));
    }
    
    if (filters.maxScore) {
      result = result.filter(model => model.carbon_score <= Number(filters.maxScore));
    }
    
    if (filters.category) {
      result = result.filter(model => model.carbon_category === filters.category);
    }
    
    if (filters.architecture) {
      result = result.filter(model => model.architecture === filters.architecture);
    }
    
    // Appliquer le tri
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [models, searchTerm, filters, sortConfig]);

  // Fonction pour gérer le tri
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Fonction pour afficher les détails d'un modèle
  const showModelDetails = async (model) => {
    setSelectedModel(model);
    setLoading(true);
    
    try {
      const recommendationsData = await fetchWithAuth(`/api/v1/carbon-scores/recommendations/${model.id}?limit=3`);
      setRecommendations(recommendationsData);
      setShowRecommendations(true);
    } catch (err) {
      setError('Erreur lors du chargement des recommandations');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir la couleur de fond en fonction de la catégorie
  const getCategoryBackgroundColor = (category) => {
    return carbonCategories[category]?.color || '#d73027';
  };

  // Fonction pour obtenir la couleur de texte en fonction de la catégorie
  const getCategoryTextColor = (category) => {
    if (['A+', 'A', 'B'].includes(category)) {
      return 'text-gray-900';
    }
    return 'text-white';
  };

  // Fonction pour formater les nombres
  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toFixed(3);
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
          {/* Métriques globales */}
          {efficiencyMetrics && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Métriques globales</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Score carbone moyen</div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(efficiencyMetrics.average_score)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Ratio d'efficacité moyen</div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(efficiencyMetrics.average_efficiency)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Modèles évalués</div>
                  <div className="text-2xl font-bold text-gray-900">{efficiencyMetrics.total_models}</div>
                </div>
              </div>
            </div>
          )}

          {/* Explication des catégories */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Comprendre les scores carbone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Le score carbone évalue l'efficacité environnementale d'un modèle d'IA en fonction de son empreinte carbone 
              et de ses performances. Plus le score est élevé, plus le modèle est écologique.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {Object.entries(carbonCategories).map(([category, data]) => (
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

          {/* Barre de recherche et filtres */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un modèle..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filtres
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Score minimum</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.minScore}
                    onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Score maximum</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.maxScore}
                    onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">Toutes</option>
                    {Object.keys(carbonCategories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Architecture</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.architecture}
                    onChange={(e) => setFilters({ ...filters, architecture: e.target.value })}
                  >
                    <option value="">Toutes</option>
                    {[...new Set(models.map(m => m.architecture))].map(arch => (
                      <option key={arch} value={arch}>{arch}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tableau des scores */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Classement des modèles
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredAndSortedModels.length} modèles trouvés
                </span>
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
                            Score Carbone
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
                          onClick={() => requestSort('efficiency_ratio')}
                        >
                          <div className="flex items-center">
                            Ratio d'Efficacité
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
                          Catégorie
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedModels.map((model) => (
                        <tr
                          key={model.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => showModelDetails(model)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{model.model_name}</div>
                            <div className="text-sm text-gray-500">{model.architecture}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatNumber(model.carbon_score)}</div>
                            <div className="text-xs text-gray-500">Percentile: {formatNumber(model.rank_percentile)}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatNumber(model.efficiency_ratio)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryTextColor(model.carbon_category)}`}
                              style={{ backgroundColor: getCategoryBackgroundColor(model.carbon_category) }}
                            >
                              {model.carbon_category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Détails et recommandations */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedModel ? 'Détails et recommandations' : 'Sélectionnez un modèle'}
                </h2>
              </div>
              
              {selectedModel && (
                <div className="px-4 py-5 sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedModel.model_name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Score carbone</div>
                        <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedModel.carbon_score)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Ratio d'efficacité</div>
                        <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedModel.efficiency_ratio)}</div>
                      </div>
                    </div>
                  </div>

                  {showRecommendations && recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Recommandations alternatives</h4>
                      <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">{rec.recommended_model_name}</div>
                                <div className="text-sm text-gray-500">
                                  Économie de CO2: {formatNumber(rec.co2_savings_kg)} kg
                                </div>
                              </div>
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryTextColor(rec.carbon_category)}`}
                                style={{ backgroundColor: getCategoryBackgroundColor(rec.carbon_category) }}
                              >
                                {rec.carbon_category}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              {rec.recommendation_reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
