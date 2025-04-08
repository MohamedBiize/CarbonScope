import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  GlobeIcon,
  ArrowsExpandIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  ScatterChart, 
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

// Données fictives pour le développement
const MOCK_DATA = [
  { id: '1', model_name: 'GPT-4', parameters_billions: 1000, architecture: 'Transformer', model_type: '💬 chat models', training_co2_kg: 5000, overall_score: 90, cloud_provider: 'Microsoft (Azure)' },
  { id: '2', model_name: 'LLaMA-3', parameters_billions: 70, architecture: 'LlamaForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 1200, overall_score: 75, cloud_provider: null },
  { id: '3', model_name: 'Mistral-7B', parameters_billions: 7, architecture: 'MistralForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 800, overall_score: 65, cloud_provider: null },
  { id: '4', model_name: 'BLOOM-176B', parameters_billions: 176, architecture: 'BloomForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 3200, overall_score: 70, cloud_provider: 'Hugging Face' },
  { id: '5', model_name: 'Claude-3', parameters_billions: 120, architecture: 'Transformer', model_type: '💬 chat models', training_co2_kg: 2800, overall_score: 85, cloud_provider: null },
  { id: '6', model_name: 'Gemma-7B', parameters_billions: 7, architecture: 'Gemma2ForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 750, overall_score: 60, cloud_provider: 'Google Cloud' },
  { id: '7', model_name: 'Falcon-40B', parameters_billions: 40, architecture: 'FalconForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 1800, overall_score: 68, cloud_provider: null },
  { id: '8', model_name: 'Phi-2', parameters_billions: 2.7, architecture: 'PhiForCausalLM', model_type: '🔶 fine-tuned', training_co2_kg: 350, overall_score: 55, cloud_provider: 'Microsoft (Azure)' },
];

// Données temporelles fictives
const TIME_DATA = [
  { month: '2024-06', avg_co2: 1200, count: 5 },
  { month: '2024-07', avg_co2: 1500, count: 8 },
  { month: '2024-08', avg_co2: 1800, count: 12 },
  { month: '2024-09', avg_co2: 2200, count: 15 },
  { month: '2024-10', avg_co2: 2500, count: 18 },
  { month: '2024-11', avg_co2: 2800, count: 22 },
  { month: '2024-12', avg_co2: 3100, count: 25 },
  { month: '2025-01', avg_co2: 3500, count: 30 },
  { month: '2025-02', avg_co2: 3200, count: 28 },
  { month: '2025-03', avg_co2: 2900, count: 24 },
];

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function Visualisations() {
  const [activeTab, setActiveTab] = useState('tendances');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [expandedChart, setExpandedChart] = useState(null);

  // Simuler le chargement des données depuis l'API
  useEffect(() => {
    // Dans une vraie application, nous ferions un appel API ici
    setTimeout(() => {
      setModels(MOCK_DATA);
      setLoading(false);
    }, 1000);
  }, []);

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    // Données pour le graphique de corrélation (taille vs CO2)
    const scatterData = models.map(model => ({
      x: model.parameters_billions,
      y: model.training_co2_kg,
      z: model.overall_score,
      name: model.model_name
    }));

    // Données pour le graphique à barres (CO2 par architecture)
    const architectureCO2 = {};
    const architectureCount = {};
    
    models.forEach(model => {
      if (architectureCO2[model.architecture]) {
        architectureCO2[model.architecture] += model.training_co2_kg;
        architectureCount[model.architecture]++;
      } else {
        architectureCO2[model.architecture] = model.training_co2_kg;
        architectureCount[model.architecture] = 1;
      }
    });
    
    const barChartData = Object.keys(architectureCO2).map(key => ({
      name: key,
      co2: architectureCO2[key],
      avg: architectureCO2[key] / architectureCount[key]
    }));

    // Données pour le graphique circulaire (répartition par type)
    const typeCounts = {};
    models.forEach(model => {
      if (typeCounts[model.model_type]) {
        typeCounts[model.model_type]++;
      } else {
        typeCounts[model.model_type] = 1;
      }
    });

    const pieChartData = Object.keys(typeCounts).map(key => ({
      name: key,
      value: typeCounts[key]
    }));

    return { scatterData, barChartData, pieChartData };
  };

  const { scatterData, barChartData, pieChartData } = prepareChartData();

  // Fonction pour basculer l'expansion d'un graphique
  const toggleChartExpansion = (chartId) => {
    if (expandedChart === chartId) {
      setExpandedChart(null);
    } else {
      setExpandedChart(chartId);
    }
  };

  // Fonction pour télécharger les données du graphique
  const downloadChartData = (chartId, data) => {
    // Dans une vraie application, nous générerions un fichier CSV ou Excel
    console.log(`Téléchargement des données pour ${chartId}`, data);
    alert(`Téléchargement des données pour ${chartId} (fonctionnalité simulée)`);
  };

  return (
    <div>
      <Head>
        <title>Visualisations - CarbonScope AI</title>
        <meta name="description" content="Visualisations interactives de l'empreinte carbone des modèles d'IA" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Visualisations</h1>
          <p className="mt-2 text-sm text-gray-700">
            Explorez les données d'empreinte carbone des modèles d'IA à travers des visualisations interactives.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Onglets de navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('tendances')}
                className={`${
                  activeTab === 'tendances'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Tendances et évolution
              </button>
              <button
                onClick={() => setActiveTab('comparaisons')}
                className={`${
                  activeTab === 'comparaisons'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Comparaisons
              </button>
              <button
                onClick={() => setActiveTab('correlations')}
                className={`${
                  activeTab === 'correlations'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Corrélations
              </button>
              <button
                onClick={() => setActiveTab('carte')}
                className={`${
                  activeTab === 'carte'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Carte d'impact
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="mt-6">
            {loading ? (
              <div className="text-center py-10">
                <div className="spinner"></div>
                <p className="mt-2 text-sm text-gray-500">Chargement des visualisations...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-sm text-red-500">Erreur lors du chargement des données.</p>
              </div>
            ) : (
              <>
                {/* Onglet Tendances et évolution */}
                {activeTab === 'tendances' && (
                  <div className="space-y-6">
                    <div className={`bg-white shadow rounded-lg p-4 ${expandedChart === 'evolution' ? 'col-span-2' : ''}`}>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Évolution des émissions CO2 au fil du temps</h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleChartExpansion('evolution')}
                            className="p-1 rounded-md hover:bg-gray-100"
                            title="Agrandir/Réduire"
                          >
                            <ArrowsExpandIcon className="h-5 w-5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => downloadChartData('evolution', TIME_DATA)}
                            className="p-1 rounded-md hover:bg-gray-100"
                            title="Télécharger les données"
                          >
                            <DownloadIcon className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      <div className={expandedChart === 'evolution' ? 'h-[600px]' : 'h-80'}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={TIME_DATA}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="avg_co2" name="CO2 moyen (kg)" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line yAxisId="right" type="monotone" dataKey="count" name="Nombre de modèles" stroke="#82ca9d" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Ce graphique montre l'évolution des émissions moyennes de CO2 et du nombre de modèles d'IA au fil du temps.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white shadow rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-medium text-gray-900">Émissions CO2 par architecture</h2>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleChartExpansion('architecture')}
                              className="p-1 rounded-md hover:bg-gray-100"
                              title="Agrandir/Réduire"
                            >
                              <ArrowsExpandIcon className="h-5 w-5 text-gray-500" />
                            </button>
                            <button
                              onClick={() => downloadChartData('architecture', barChartData)}
                              className="p-1 rounded-md hover:bg-gray-100"
                              title="Télécharger les données"
                            >
                              <DownloadIcon className="h-5 w-5 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={barChartData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="co2" name="CO2 total (kg)" fill="#8884d8" />
                              <Bar dataKey="avg" name="CO2 moyen (kg)" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white shadow rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-medium text-gray-900">Répartition par type de modèle</h2>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleChartExpansion('type')}
                              className="p-1 rounded-md hover:bg-gray-100"
                              title="Agrandir/Réduire"
                            >
                              <ArrowsExpandIcon className="h-5 w-5 text-gray-500" />
                            </button>
                            <button
                              onClick={() => downloadChartData('type', pieChartData)}
                              className="p-1 rounded-md hover:bg-gray-100"
                              title="Télécharger les données"
                            >
                              <DownloadIcon className="h-5 w-5 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Onglet Comparaisons */}
                {activeTab === 'comparaisons' && (
                  <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-4">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Comparaison des modèles</h2>
                      <p className="text-sm text-gray-500 mb-4">
                        Sélectionnez jusqu'à 5 modèles pour les comparer.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {models.slice(0, 6).map((model) => (
                          <div 
                            key={model.id}
                            className={`border rounded-lg p-3 cursor-pointer ${
                              selectedModels.includes(model.id) ? 'border-green-500 bg-green-50' : 'border-gray-200'
                            }`}
                            onClick={() => {
                              if (selectedModels.includes(model.id)) {
                                setSelectedModels(selectedModels.filter(id => id !== model.id));
                              } else if (selectedModels.length < 5) {
                                setSelectedModels([...selectedModels, model.id]);
                              }
                            }}
                          >
                            <h3 className="font-medium text-gray-900">{model.model_name}</h3>
                            <p className="text-sm text-gray-500">{model.architecture}</p>
                            <div className="mt-2 flex justify-between">
                              <span className="text-sm text-gray-500">{model.parameters_billions}B params</span>
                              <span className="text-sm text-gray-500">{model.training_co2_kg} kg CO2</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedModels.length > 0 ? (
                        <div className="h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={models.filter(model => selectedModels.includes(model.id)).map(model => ({
                                name: model.model_name,
                                co2: model.training_co2_kg,
                                score: model.overall_score,
                                params: model.parameters_billions
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                              <Tooltip />
                              <Legend />
                              <Bar yAxisId="left" dataKey="co2" name="CO2 (kg)" fill="#8884d8" />
                              <Bar yAxisId="left" dataKey="params" name="Paramètres (B)" fill="#82ca9d" />
                              <Bar yAxisId="right" dataKey="score" name="Score" fill="#ffc658" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">Sélectionnez des modèles pour les comparer</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Onglet Corrélations */}
                {activeTab === 'correlations' && (
                  <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Corrélation entre taille et émissions CO2</h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleChartExpansion('correlation')}
                            className="p-1 rounded-md hover:bg-gray-100"
                            title="Agrandir/Réduire"
                          >
                            <ArrowsExpandIcon className="h-5 w-5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => downloadChartData('correlation', scatterData)}
                            className="p-1 rounded-md hover:bg-gray-100"
                            title="Télécharger les données"
                          >
                            <DownloadIcon className="h-5 w-5 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      <div className={expandedChart === 'correlation' ? 'h-[600px]' : 'h-96'}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart
                            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              type="number" 
                              dataKey="x" 
                              name="Paramètres (milliards)" 
                              label={{ value: 'Paramètres (milliards)', position: 'insideBottomRight', offset: -5 }} 
                            />
                            <YAxis 
                              type="number" 
                              dataKey="y" 
                              name="CO2 (kg)" 
                              label={{ value: 'CO2 (kg)', angle: -90, position: 'insideLeft' }} 
                            />
                            <Tooltip 
                              cursor={{ strokeDasharray: '3 3' }} 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                                      <p className="font-medium">{payload[0].payload.name}</p>
                                      <p className="text-sm">Paramètres: {payload[0].payload.x} milliards</p>
                                      <p className="text-sm">CO2: {payload[0].payload.y} kg</p>
                                      <p className="text-sm">Score: {payload[0].payload.z}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Scatter 
                              name="Modèles" 
                              data={scatterData} 
                              fill="#8884d8"
                              shape={(props) => {
                                const { cx, cy, fill } = props;
                                const size = props.payload.z / 10; // Taille basée sur le score
                                return (
                                  <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={size} 
                                    fill={fill} 
                                    stroke="#8884d8"
                                  />
                                );
                              }}
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Ce graphique montre la corrélation entre la taille des modèles (en milliards de paramètres) et leurs émissions de CO2.
                        La taille des points représente le score de performance du modèle.
                      </p>
                    </div>
                  </div>
                )}

                {/* Onglet Carte d'impact */}
                {activeTab === 'carte' && (
                  <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-4">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Carte d'impact environnemental</h2>
                      <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <GlobeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            Carte interactive des centres de données et de leur impact environnemental.
                            <br />
                            <span className="text-sm">(Cette fonctionnalité sera implémentée avec Mapbox)</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
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
