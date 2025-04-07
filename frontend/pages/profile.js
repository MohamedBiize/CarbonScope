import React, { useState, useEffect } from 'react';
import { useAuth, withAuth } from '../components/auth/AuthContext';
import Head from 'next/head';
import Link from 'next/link';
import { UserIcon, CogIcon, LogoutIcon, BookmarkIcon, ClockIcon } from '@heroicons/react/outline';

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    darkMode: false,
    notifications: true,
    defaultView: 'dashboard'
  });

  // Simuler le chargement des données utilisateur depuis l'API
  useEffect(() => {
    // Dans une vraie application, nous ferions un appel API ici
    setTimeout(() => {
      setFavorites([
        { id: '1', model_name: 'GPT-4', date_added: '2025-03-20', carbon_score: 95, carbon_category: 'A+' },
        { id: '3', model_name: 'Mistral-7B', date_added: '2025-03-15', carbon_score: 75, carbon_category: 'B' },
        { id: '8', model_name: 'Phi-2', date_added: '2025-03-10', carbon_score: 90, carbon_category: 'A+' }
      ]);
      
      setHistory([
        { id: '1', type: 'search', query: 'modèles < 10B paramètres', date: '2025-04-01T14:30:00Z' },
        { id: '2', type: 'simulation', model_name: 'GPT-4', region: 'France', co2: '120kg', date: '2025-03-28T10:15:00Z' },
        { id: '3', type: 'view', model_name: 'Mistral-7B', date: '2025-03-25T16:45:00Z' },
        { id: '4', type: 'search', query: 'modèles avec score > 80', date: '2025-03-22T09:20:00Z' },
        { id: '5', type: 'simulation', model_name: 'LLaMA-3', region: 'Europe', co2: '85kg', date: '2025-03-20T11:30:00Z' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour formater les dates avec heure
  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour supprimer un favori
  const removeFavorite = (id) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  // Fonction pour effacer l'historique
  const clearHistory = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tout votre historique ?')) {
      setHistory([]);
    }
  };

  // Fonction pour mettre à jour les préférences
  const updatePreference = (key, value) => {
    setUserPreferences({
      ...userPreferences,
      [key]: value
    });
  };

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <div>
      <Head>
        <title>Profil - CarbonScope AI</title>
        <meta name="description" content="Gérez votre profil et vos préférences sur CarbonScope AI" />
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Profil utilisateur</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez votre compte, vos favoris et vos préférences.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="spinner"></div>
              <p className="mt-2 text-sm text-gray-500">Chargement de votre profil...</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* En-tête du profil */}
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">{user?.fullName || user?.username}</h2>
                    <p className="text-sm text-gray-500">
                      {user?.email} · Membre depuis {formatDate(new Date().toISOString().split('T')[0])}
                    </p>
                  </div>
                </div>
              </div>

              {/* Onglets de navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`${
                      activeTab === 'profile'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <UserIcon className="h-5 w-5 mr-2" />
                    Profil
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`${
                      activeTab === 'favorites'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <BookmarkIcon className="h-5 w-5 mr-2" />
                    Favoris
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`${
                      activeTab === 'history'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Historique
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`${
                      activeTab === 'settings'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <CogIcon className="h-5 w-5 mr-2" />
                    Paramètres
                  </button>
                </nav>
              </div>

              {/* Contenu des onglets */}
              <div className="px-4 py-5 sm:p-6">
                {/* Onglet Profil */}
                {activeTab === 'profile' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                          <p className="font-medium">{user?.username}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nom complet</p>
                          <p className="font-medium">{user?.fullName || "Non renseigné"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{user?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date d'inscription</p>
                          <p className="font-medium">{formatDate(new Date().toISOString().split('T')[0])}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Modifier le profil
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Changer le mot de passe
                      </button>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques d'utilisation</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-500">Modèles favoris</p>
                          <p className="text-2xl font-bold text-green-600">{favorites.length}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-500">Simulations réalisées</p>
                          <p className="text-2xl font-bold text-green-600">
                            {history.filter(item => item.type === 'simulation').length}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-500">Recherches effectuées</p>
                          <p className="text-2xl font-bold text-green-600">
                            {history.filter(item => item.type === 'search').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Onglet Favoris */}
                {activeTab === 'favorites' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Modèles favoris</h3>
                      <span className="text-sm text-gray-500">{favorites.length} modèles</span>
                    </div>
                    
                    {favorites.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <BookmarkIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Vous n'avez pas encore de modèles favoris.</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Explorez le dashboard et ajoutez des modèles à vos favoris.
                        </p>
                        <Link href="/dashboard">
                          <button
                            type="button"
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Explorer les modèles
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {favorites.map((favorite) => (
                            <li key={favorite.id}>
                              <div className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <p className="truncate text-sm font-medium text-green-600">
                                        {favorite.model_name}
                                      </p>
                                      <span 
                                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          favorite.carbon_category === 'A+' || favorite.carbon_category === 'A' 
                                            ? 'bg-green-100 text-green-800' 
                                            : favorite.carbon_category === 'B' 
                                              ? 'bg-yellow-100 text-yellow-800'
                                              : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {favorite.carbon_category}
                                      </span>
                                    </div>
                                    <div className="ml-2 flex flex-shrink-0">
                                      <button
                                        onClick={() => removeFavorite(favorite.id)}
                                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                      >
                                        Supprimer
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                      <p className="flex items-center text-sm text-gray-500">
                                        Score carbone: {favorite.carbon_score}/100
                                      </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                      <p>
                                        Ajouté le {formatDate(favorite.date_added)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Onglet Historique */}
                {activeTab === 'history' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Historique d'activité</h3>
                      {history.length > 0 && (
                        <button
                          type="button"
                          onClick={clearHistory}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Effacer l'historique
                        </button>
                      )}
                    </div>
                    
                    {history.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <ClockIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Votre historique est vide.</p>
                      </div>
                    ) : (
                      <div className="flow-root">
                        <ul className="-mb-8">
                          {history.map((item, itemIdx) => (
                            <li key={item.id}>
                              <div className="relative pb-8">
                                {itemIdx !== history.length - 1 ? (
                                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span
                                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                        item.type === 'search' 
                                          ? 'bg-blue-100' 
                                          : item.type === 'simulation' 
                                            ? 'bg-green-100' 
                                            : 'bg-gray-100'
                                      }`}
                                    >
                                      {item.type === 'search' ? (
                                        <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                      ) : item.type === 'simulation' ? (
                                        <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        {item.type === 'search' && (
                                          <>Recherche : <span className="font-medium text-gray-900">{item.query}</span></>
                                        )}
                                        {item.type === 'simulation' && (
                                          <>Simulation du modèle <span className="font-medium text-gray-900">{item.model_name}</span> en <span className="font-medium text-gray-900">{item.region}</span> ({item.co2})</>
                                        )}
                                        {item.type === 'view' && (
                                          <>Consultation du modèle <span className="font-medium text-gray-900">{item.model_name}</span></>
                                        )}
                                      </p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                      <time dateTime={item.date}>{formatDateTime(item.date)}</time>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Onglet Paramètres */}
                {activeTab === 'settings' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences</h3>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Mode sombre</h4>
                            <p className="text-sm text-gray-500">
                              Activer le thème sombre pour l'interface
                            </p>
                          </div>
                          <button
                            type="button"
                            className={`${
                              userPreferences.darkMode ? 'bg-green-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                            onClick={() => updatePreference('darkMode', !userPreferences.darkMode)}
                          >
                            <span
                              className={`${
                                userPreferences.darkMode ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            >
                              <span
                                className={`${
                                  userPreferences.darkMode ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                  <path
                                    d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                              <span
                                className={`${
                                  userPreferences.darkMode ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 12 12">
                                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                </svg>
                              </span>
                            </span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Notifications</h4>
                            <p className="text-sm text-gray-500">
                              Recevoir des notifications par email
                            </p>
                          </div>
                          <button
                            type="button"
                            className={`${
                              userPreferences.notifications ? 'bg-green-600' : 'bg-gray-200'
                            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                            onClick={() => updatePreference('notifications', !userPreferences.notifications)}
                          >
                            <span
                              className={`${
                                userPreferences.notifications ? 'translate-x-5' : 'translate-x-0'
                              } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            >
                              <span
                                className={`${
                                  userPreferences.notifications ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                  <path
                                    d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                              <span
                                className={`${
                                  userPreferences.notifications ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 12 12">
                                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                </svg>
                              </span>
                            </span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Vue par défaut</h4>
                          <p className="text-sm text-gray-500 mb-4">
                            Choisissez la page qui s'affiche par défaut après la connexion
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                              type="button"
                              className={`${
                                userPreferences.defaultView === 'dashboard'
                                  ? 'bg-green-50 border-green-500 text-green-700'
                                  : 'bg-white border-gray-300 text-gray-700'
                              } border rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                              onClick={() => updatePreference('defaultView', 'dashboard')}
                            >
                              Dashboard
                            </button>
                            <button
                              type="button"
                              className={`${
                                userPreferences.defaultView === 'visualisations'
                                  ? 'bg-green-50 border-green-500 text-green-700'
                                  : 'bg-white border-gray-300 text-gray-700'
                              } border rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                              onClick={() => updatePreference('defaultView', 'visualisations')}
                            >
                              Visualisations
                            </button>
                            <button
                              type="button"
                              className={`${
                                userPreferences.defaultView === 'simulateur'
                                  ? 'bg-green-50 border-green-500 text-green-700'
                                  : 'bg-white border-gray-300 text-gray-700'
                              } border rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                              onClick={() => updatePreference('defaultView', 'simulateur')}
                            >
                              Simulateur
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Compte</h3>
                      
                      <div className="space-y-4">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <LogoutIcon className="h-4 w-4 mr-2" />
                          Se déconnecter
                        </button>
                        
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Supprimer mon compte
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
};

export default withAuth(Profile);
