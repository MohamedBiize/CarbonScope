import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';
import {
  FunnelIcon,           // Anciennement FilterIcon
  BarsArrowUpIcon,      // Anciennement BarsArrowUpIcon
  ArrowDownTrayIcon,    // Anciennement ArrowDownTrayIcon
  MagnifyingGlassIcon,  // Anciennement MagnifyingGlassIcon
  ExclamationCircleIcon // Correct
} from '@heroicons/react/24/outline';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { fetchWithAuth } from '../utils/api'; // Ajustez le chemin si nécessaire

// Données fictives pour le développement

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function Dashboard() {
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    minParams: '',
    maxParams: '',
    architecture: '',
    modelType: '',
    minScore: '',
    maxScore: '',
    minCO2: '',
    maxCO2: '',
    cloudProvider: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'model_name',
    direction: 'ascending'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated } = useAuth();

  // Charger les données initiales depuis l'API au montage OU quand l'auth change
  useEffect(() => {
    const loadModels = async () => {
      console.log("Dashboard effect running. isAuthenticated:", isAuthenticated);
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        
        // Ajouter les filtres
        if (filters.minParams) queryParams.append('min_parameters', filters.minParams);
        if (filters.maxParams) queryParams.append('max_parameters', filters.maxParams);
        if (filters.architecture) queryParams.append('architecture', filters.architecture);
        if (filters.modelType) queryParams.append('model_type', filters.modelType);
        if (filters.minScore) queryParams.append('min_score', filters.minScore);
        if (filters.maxScore) queryParams.append('max_score', filters.maxScore);
        if (filters.minCO2) queryParams.append('min_co2', filters.minCO2);
        if (filters.maxCO2) queryParams.append('max_co2', filters.maxCO2);
        if (filters.cloudProvider) queryParams.append('cloud_provider', filters.cloudProvider);
        
        // Ajouter la recherche
        if (searchTerm) queryParams.append('model_name', searchTerm);
        
        // Ajouter le tri
        if (sortConfig.key) {
          queryParams.append('sort_by', sortConfig.key);
          queryParams.append('sort_order', sortConfig.direction === 'ascending' ? 'asc' : 'desc');
        }

        // Ajouter la pagination
        queryParams.append('page', pagination.currentPage);
        queryParams.append('page_size', pagination.pageSize);

        const response = await fetchWithAuth(`/api/v1/models/?${queryParams.toString()}`);
        console.log("Dashboard: API Response:", response);

        if (response && response.items) {
          setModels(response.items);
          setFilteredModels(response.items);
          setPagination(prev => ({
            ...prev,
            totalItems: response.total,
            totalPages: Math.ceil(response.total / pagination.pageSize)
          }));
        } else {
          console.log("Dashboard: No items found in response.");
          setModels([]);
          setFilteredModels([]);
          setPagination(prev => ({
            ...prev,
            totalItems: 0,
            totalPages: 0
          }));
        }
      } catch (err) {
        console.error("Dashboard: Erreur lors de la récupération des modèles:", err);
        setError(err.message || "Impossible de charger les modèles.");
        setModels([]);
        setFilteredModels([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      console.log("Dashboard: User authenticated, calling loadModels().");
      loadModels();
    } else {
      console.log("Dashboard: User not authenticated, clearing models and stopping loading.");
      setModels([]);
      setFilteredModels([]);
      setLoading(false);
    }
  }, [isAuthenticated, searchTerm, filters, sortConfig, pagination.currentPage, pagination.pageSize]);

  // Fonction pour gérer le tri
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      minParams: '',
      maxParams: '',
      architecture: '',
      modelType: '',
      minScore: '',
      maxScore: '',
      minCO2: '',
      maxCO2: '',
      cloudProvider: ''
    });
    setSortConfig({
      key: 'model_name',
      direction: 'ascending'
    });
  };

  // Fonction pour changer de page
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // Fonction pour changer la taille de la page
  const handlePageSizeChange = (newSize) => {
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1 // Reset to first page when changing page size
    }));
  };

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    // Données pour le graphique à barres (CO2 vs Score)
    const barChartData = filteredModels.slice(0, 5).map(model => ({
      name: model.model_name,
      co2: model.training_co2_kg,
      score: model.overall_score
    }));

    // Données pour le graphique circulaire (répartition par architecture)
    const architectureCounts = {};
    filteredModels.forEach(model => {
      if (architectureCounts[model.architecture]) {
        architectureCounts[model.architecture]++;
      } else {
        architectureCounts[model.architecture] = 1;
      }
    });

    const pieChartData = Object.keys(architectureCounts).map(key => ({
      name: key,
      value: architectureCounts[key]
    }));

    return { barChartData, pieChartData };
  };

  const { barChartData, pieChartData } = prepareChartData();

  // Liste des architectures et types de modèles uniques pour les filtres
  const architectures = [...new Set(models.map(model => model.architecture))];
  const modelTypes = [...new Set(models.map(model => model.model_type))];
  const cloudProviders = [...new Set(models.filter(model => model.cloud_provider).map(model => model.cloud_provider))];

  return (
    <div>
      <Head>
        <title>Dashboard - CarbonScope AI</title>
        <meta name="description" content="Dashboard interactif pour explorer l'empreinte carbone des modèles d'IA" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Explorez et comparez l'empreinte carbone des modèles d'IA générative.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Barre de recherche et filtres */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 mb-4 md:mb-0 md:mr-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Rechercher un modèle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Filtres
                </button>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            {/* Panneau de filtres */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="minParams" className="block text-sm font-medium text-gray-700">
                    Paramètres min (milliards)
                  </label>
                  <input
                    type="number"
                    id="minParams"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.minParams}
                    onChange={(e) => setFilters({...filters, minParams: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="maxParams" className="block text-sm font-medium text-gray-700">
                    Paramètres max (milliards)
                  </label>
                  <input
                    type="number"
                    id="maxParams"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.maxParams}
                    onChange={(e) => setFilters({...filters, maxParams: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="architecture" className="block text-sm font-medium text-gray-700">
                    Architecture
                  </label>
                  <select
                    id="architecture"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.architecture}
                    onChange={(e) => setFilters({...filters, architecture: e.target.value})}
                  >
                    <option value="">Toutes</option>
                    {architectures.map((arch) => (
                      <option key={arch} value={arch}>{arch}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="modelType" className="block text-sm font-medium text-gray-700">
                    Type de modèle
                  </label>
                  <select
                    id="modelType"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.modelType}
                    onChange={(e) => setFilters({...filters, modelType: e.target.value})}
                  >
                    <option value="">Tous</option>
                    {modelTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="minScore" className="block text-sm font-medium text-gray-700">
                    Score min
                  </label>
                  <input
                    type="number"
                    id="minScore"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.minScore}
                    onChange={(e) => setFilters({...filters, minScore: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700">
                    Score max
                  </label>
                  <input
                    type="number"
                    id="maxScore"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.maxScore}
                    onChange={(e) => setFilters({...filters, maxScore: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="minCO2" className="block text-sm font-medium text-gray-700">
                    CO2 min (kg)
                  </label>
                  <input
                    type="number"
                    id="minCO2"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.minCO2}
                    onChange={(e) => setFilters({...filters, minCO2: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="maxCO2" className="block text-sm font-medium text-gray-700">
                    CO2 max (kg)
                  </label>
                  <input
                    type="number"
                    id="maxCO2"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.maxCO2}
                    onChange={(e) => setFilters({...filters, maxCO2: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="cloudProvider" className="block text-sm font-medium text-gray-700">
                    Fournisseur cloud
                  </label>
                  <select
                    id="cloudProvider"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={filters.cloudProvider}
                    onChange={(e) => setFilters({...filters, cloudProvider: e.target.value})}
                  >
                    <option value="">Tous</option>
                    {cloudProviders.map((provider) => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">CO2 vs Performance (Top 5)</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="co2" name="CO2 (kg)" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="score" name="Score" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Répartition par architecture</h2>
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

          {/* Tableau des modèles */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Modèles d'IA ({filteredModels.length})
              </h2>
              <button
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-1 text-gray-500" />
                Exporter
              </button>
            </div>
            <div className="overflow-x-auto">
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
              ) : filteredModels.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-500">Aucun modèle ne correspond aux critères de recherche.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('model_name')}
                      >
                        <div className="flex items-center">
                          Nom du modèle
                          {sortConfig.key === 'model_name' && (
                            <BarsArrowUpIcon className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('parameters_billions')}
                      >
                        <div className="flex items-center">
                          Paramètres (B)
                          {sortConfig.key === 'parameters_billions' && (
                            <BarsArrowUpIcon className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('architecture')}
                      >
                        <div className="flex items-center">
                          Architecture
                          {sortConfig.key === 'architecture' && (
                            <BarsArrowUpIcon className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('model_type')}
                      >
                        <div className="flex items-center">
                          Type
                          {sortConfig.key === 'model_type' && (
                            <BarsArrowUpIcon className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('training_co2_kg')}
                      >
                        <div className="flex items-center">
                          CO2 (kg)
                          {sortConfig.key === 'training_co2_kg' && (
                            <BarsArrowUpIcon className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('overall_score')}
                      >
                        <div className="flex items-center">
                          Score
                          {sortConfig.key === 'overall_score' && (
                            <BarsArrowUpIcon className="h-4 w-4 ml-1" />
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
                    {filteredModels.map((model) => (
                      <tr key={model.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {model.model_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {model.parameters_billions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {model.architecture}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {model.model_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {model.training_co2_kg}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {model.overall_score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-green-600 hover:text-green-900 mr-3">
                            Détails
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            Simuler
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Ajouter la pagination en bas du tableau */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Affichage de {((pagination.currentPage - 1) * pagination.pageSize) + 1} à{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} sur{' '}
                {pagination.totalItems} résultats
              </span>
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="ml-2 rounded-md border-gray-300 py-1 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
              >
                <option value={10}>10 par page</option>
                <option value={20}>20 par page</option>
                <option value={50}>50 par page</option>
                <option value={100}>100 par page</option>
              </select>
            </div>
            <div className="flex">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
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
