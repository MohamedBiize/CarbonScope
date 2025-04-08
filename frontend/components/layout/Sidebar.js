import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CogIcon, 
  DocumentReportIcon,
  LightningBoltIcon,
  StarIcon,
  CollectionIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);

  const isActive = (path) => {
    return router.pathname === path;
  };

  const navItems = [
    { name: 'Accueil', path: '/', icon: HomeIcon },
    { name: 'Dashboard', path: '/dashboard', icon: ChartBarIcon },
    { name: 'Visualisations', path: '/visualisations', icon: CollectionIcon },
    { name: 'Simulateur', path: '/simulateur', icon: LightningBoltIcon },
    { name: 'Scores Carbone', path: '/scores', icon: StarIcon },
    { name: 'Rapports', path: '/rapports', icon: DocumentReportIcon },
    { name: 'Paramètres', path: '/parametres', icon: CogIcon },
  ];

  return (
    <div className={`bg-white shadow-md ${expanded ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
      <div className="h-screen sticky top-0 flex flex-col justify-between">
        <div>
          <div className="p-4 flex justify-between items-center">
            {expanded && <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>}
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {expanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link href={item.path} key={item.name}>
                  <span className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer
                    ${isActive(item.path) 
                      ? 'bg-green-100 text-green-800' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <item.icon className={`mr-3 h-6 w-6 ${isActive(item.path) ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    {expanded && item.name}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="p-4 mb-6">
          {expanded && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Conseil écologique</h3>
              <p className="mt-2 text-xs text-green-700">
                Saviez-vous qu'utiliser un modèle plus petit peut réduire l'empreinte carbone de 70% tout en maintenant des performances similaires ?
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
