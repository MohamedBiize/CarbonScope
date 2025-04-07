import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  LightningBoltIcon, 
  LocationMarkerIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  SaveIcon,
  DocumentReportIcon
} from '@heroicons/react/outline';

// Données fictives pour le développement
const MOCK_MODELS = [
  { id: '1', model_name: 'GPT-4', parameters_billions: 1000, architecture: 'Transformer', model_type: '💬 chat models', training_co2_kg: 5000, overall_score: 90, cloud_provider: 'Microsoft (Azure)' },
  { id: '2', model_name: 'LLaMA-3', parameters_billions: 70, architecture: 'LlamaForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 1200, overall_score: 75, cloud_provider: null },
  { id: '3', model_name: 'Mistral-7B', parameters_billions: 7, architecture: 'MistralForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 800, overall_score: 65, cloud_provider: null },
  { id: '4', model_name: 'BLOOM-176B', parameters_billions: 176, architecture: 'BloomForCausalLM', model_type: '🟢 pretrained', training_co2_kg: 3200, overall_score: 70, cloud_provider: 'Hugging Face' },
  { id: '5', model_name: 'Claude-3', parameters_billions: 120, architecture: 'Transformer', model_type: '💬 chat models', training_co2_kg: 2800, overall_score: 85, cloud_provider: null },
];

const REGIONS = [
  { id: 'europe', name: 'Europe', co2_factor: 0.276, description: 'Moyenne européenne' },
  { id: 'north_america', name: 'Amérique du Nord', co2_factor: 0.385, description: 'Moyenne nord-américaine' },
  { id: 'asia_pacific', name: 'Asie-Pacifique', co2_factor: 0.555, description: 'Moyenne Asie-Pacifique' },
  { id: 'france', name: 'France', co2_factor: 0.052, description: 'Principalement énergie nucléaire' },
  { id: 'sweden', name: 'Suède', co2_factor: 0.013, description: 'Principalement hydroélectricité et nucléaire' },
  { id: 'china', name: 'Chine', co2_factor: 0.681, description: 'Principalement charbon' },
];

export default function Simulateur() {
  const [models, setModels] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [simulationParams, setSimulationParams] = useState({
    frequency_per_day: 100,
    duration_days: 30
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState([]);

  // Simuler le chargement des données depuis l'API
  useEffect(() => {
    // Dans une vraie application, nous ferions un appel API ici
    setTimeout(() => {
      setModels(MOCK_MODELS);
      setFilteredModels(MOCK_MODELS);
      setRegions(REGIONS);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrer les modèles en fonction du terme de recherche
  useEffect(() => {
    if (models.length === 0) return;

    if (searchTerm) {
      const filtered = models.filter(model => 
        model.model_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredModels(filtered);
    } else {
      setFilteredModels(models);
    }
  }, [models, searchTerm]);

  // Fonction pour exécuter la simulation
  const runSimulation = () => {
    if (!selectedModel || !selectedRegion) {
      setError("Veuillez sélectionner un modèle et une région pour la simulation.");
      return;
    }

    setLoading(true);
    
    // Simuler un appel API avec un délai
    setTimeout(() => {
      // Calculer l'impact carbone (simulation simplifiée)
      const energyPerInferenceKwh = selectedModel.parameters_billions * 0.0001;
      const totalEnergyKwh = energyPerInferenceKwh * simulationParams.frequency_per_day * simulationParams.duration_days;
      const totalCo2Kg = totalEnergyKwh * selectedRegion.co2_factor;
      
      // Calculer les équivalents
      const equivalentCarKm = totalCo2Kg / 0.17; // 0.17 kg CO2 par km en voiture
      const equivalentTreesNeeded = Math.ceil(totalCo2Kg / 25); // 25 kg CO2 absorbé par arbre par an
      const equivalentSmartphoneCharges = Math.ceil(totalCo2Kg / 0.005); // 0.005 kg CO2 par charge
      
      const result = {
        model_id: selectedModel.id,
        model_name: selectedModel.model_name,
        region_id: selectedRegion.id,
        region_name: selectedRegion.name,
        frequency_per_day: simulationParams.frequency_per_day,
        duration_days: simulationParams.duration_days,
        total_energy_kwh: totalEnergyKwh.toFixed(2),
        total_co2_kg: totalCo2Kg.toFixed(2),
        equivalent_car_km: equivalentCarKm.toFixed(2),
        equivalent_trees_needed: equivalentTreesNeeded,
        equivalent_smartphone_charges: equivalentSmartphoneCharges,
        timestamp: new Date().toISOString()
      };
      
      setSimulationResult(result);
      setShowResults(true);
      setLoading(false);
    }, 1500);
  };

  // Fonction pour sauvegarder une simulation
  const saveSimulation = () => {
    if (!simulationResult) return;
    
    // Ajouter la simulation à la liste des simulations sauvegardées
    setSavedSimulations([...savedSimulations, simulationResult]);
    
    // Afficher un message de confirmation (dans une vraie application, nous utiliserions un toast)
    alert("Simulation sauvegardée avec succès !");
  };

  // Fonction pour générer un rapport
  const generateReport = () => {
    if (!simulationResult) return;
    
    // Dans une vraie application, nous générerions un PDF ou un fichier Excel
    alert("Génération de rapport (fonctionnalité simulée)");
  };

  return (
    <div>
      <Head>
        <title>Simulateur d'impact - CarbonScope AI</title>
        <meta name="description" content="Simulateur d'impact environnemental des modèles d'IA" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Simulateur d'impact</h1>
          <p className="mt-2 text-sm text-gray-700">
            Calculez l'impact environnemental de l'utilisation d'un modèle d'IA selon vos paramètres.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne 1: Sélection du modèle */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="bg-green-100 p-2 rounded-full mr-2">
                      <ChartBarIcon className="h-5 w-5 text-green-600" />
                    </span>
                    Étape 1: Sélectionner un modèle
                  </h2>
                  
                  <div className="mb-4">
                    <label htmlFor="search" className="sr-only">Rechercher un modèle</label>
                    <input
                      type="text"
                      id="search"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Rechercher un modèle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner"></div>
                      <p className="mt-2 text-sm text-gray-500">Chargement des modèles...</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {filteredModels.length === 0 ? (
                        <p className="text-center py-4 text-sm text-gray-500">
                          Aucun modèle ne correspond à votre recherche.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {filteredModels.map((model) => (
                            <div
                              key={model.id}
                              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                                selectedModel && selectedModel.id === model.id
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                              }`}
                              onClick={() => setSelectedModel(model)}
                            >
                              <h3 className="font-medium text-gray-900">{model.model_name}</h3>
                              <div className="mt-1 flex justify-between text-sm">
                                <span className="text-gray-500">{model.architecture}</span>
                                <span className="text-gray-500">{model.parameters_billions}B params</span>
                              </div>
                              <div className="mt-1 flex justify-between text-sm">
                                <span className="text-gray-500">{model.model_type}</span>
                                <span className="text-gray-500">{model.training_co2_kg} kg CO2</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Colonne 2: Paramètres de simulation */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="bg-green-100 p-2 rounded-full mr-2">
                      <LightningBoltIcon className="h-5 w-5 text-green-600" />
                    </span>
                    Étape 2: Configurer les paramètres
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                        Région d'utilisation
                      </label>
                      <select
                        id="region"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={selectedRegion ? selectedRegion.id : ''}
                        onChange={(e) => {
                          const region = regions.find(r => r.id === e.target.value);
                          setSelectedRegion(region || null);
                        }}
                      >
                        <option value="">Sélectionner une région</option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.name} ({region.co2_factor} kg CO2/kWh)
                          </option>
                        ))}
                      </select>
                      {selectedRegion && (
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedRegion.description}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                        Fréquence d'utilisation (requêtes par jour)
                      </label>
                      <input
                        type="number"
                        id="frequency"
                        min="1"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={simulationParams.frequency_per_day}
                        onChange={(e) => setSimulationParams({
                          ...simulationParams,
                          frequency_per_day: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Durée d'utilisation (jours)
                      </label>
                      <input
                        type="number"
                        id="duration"
                        min="1"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        value={simulationParams.duration_days}
                        onChange={(e) => setSimulationParams({
                          ...simulationParams,
                          duration_days: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    
                    <button
                      type="button"
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={runSimulation}
                      disabled={!selectedModel || !selectedRegion || loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-sm mr-2"></span>
                          Calcul en cours...
                        </>
                      ) : (
                        <>
                          Calculer l'impact
                          <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                    
                    {error && (
                      <p className="text-sm text-red-600 mt-2">{error}</p>
                    )}
                  </div>
                </div>
                
                {/* Colonne 3: Résultats */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="bg-green-100 p-2 rounded-full mr-2">
                      <LocationMarkerIcon className="h-5 w-5 text-green-600" />
                    </span>
                    Étape 3: Résultats
                  </h2>
                  
                  {showResults && simulationResult ? (
                    <div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <h3 className="font-medium text-gray-900 mb-2">Impact environnemental</h3>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Modèle:</span>
                            <span className="text-sm font-medium">{simulationResult.model_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Région:</span>
                            <span className="text-sm font-medium">{simulationResult.region_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Fréquence:</span>
                            <span className="text-sm font-medium">{simulationResult.frequency_per_day} requêtes/jour</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Durée:</span>
                            <span className="text-sm font-medium">{simulationResult.duration_days} jours</span>
                          </div>
                          
                          <div className="border-t border-gray-200 my-2 pt-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Énergie totale:</span>
                              <span className="text-sm font-medium">{simulationResult.total_energy_kwh} kWh</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Émissions CO2:</span>
                              <span className="text-sm font-medium text-red-600">{simulationResult.total_co2_kg} kg</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <h3 className="font-medium text-gray-900 mb-2">Équivalents visuels</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex-shrink-0 mr-3">
                              <span role="img" aria-label="voiture" className="text-2xl">🚗</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{simulationResult.equivalent_car_km} km en voiture</p>
                              <p className="text-xs text-gray-500">Distance parcourue en voiture diesel</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex-shrink-0 mr-3">
                              <span role="img" aria-label="arbre" className="text-2xl">🌳</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{simulationResult.equivalent_trees_needed} arbres pendant un an</p>
                              <p className="text-xs text-gray-500">Arbres nécessaires pour absorber ce CO2</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex-shrink-0 mr-3">
                              <span role="img" aria-label="téléphone" className="text-2xl">📱</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{simulationResult.equivalent_smartphone_charges} charges de smartphone</p>
                              <p className="text-xs text-gray-500">Nombre de charges complètes de smartphone</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={saveSimulation}
                        >
                          <SaveIcon className="mr-2 h-4 w-4" />
                          Sauvegarder
                        </button>
                        
                        <button
                          type="button"
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={generateReport}
                        >
                          <DocumentReportIcon className="mr-2 h-4 w-4" />
                          Rapport
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center h-64">
                      <LightningBoltIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-center text-gray-500">
                        Sélectionnez un modèle et configurez les paramètres pour calculer l'impact environnemental.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Simulations sauvegardées */}
              {savedSimulations.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Simulations sauvegardées</h2>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {savedSimulations.map((sim, index) => (
                        <li key={index}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-green-600 truncate">
                                  {sim.model_name}
                                </p>
                                <p className="ml-2 flex-shrink-0 text-xs text-gray-500">
                                  {new Date(sim.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  {sim.total_co2_kg} kg CO2
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  {sim.region_name}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  {sim.frequency_per_day} requêtes/jour
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  {sim.duration_days} jours
                                </p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
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
        
        .spinner-sm {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid #ffffff;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
