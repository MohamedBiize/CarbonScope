import React, { useState, useEffect, createContext, useContext } from 'react';
import { fetchWithAuth } from '../../utils/api';

// Créer un contexte pour l'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Faire un appel API pour vérifier le token
          const response = await fetchWithAuth('/api/v1/auth/me');
          if (response) {
            setUser(response);
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    console.log("Attempting login for:", email);
    setLoading(true);
    setError(null);
    
    try {
      // Convertir les données au format attendu par le backend
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Identifiants incorrects');
      }
      
      const data = await response.json();
      
      // Stocker le token dans localStorage
      localStorage.setItem('auth_token', data.access_token);
      
      // Récupérer les informations de l'utilisateur
      const userResponse = await fetchWithAuth('/api/v1/auth/me');
      if (userResponse) {
        setUser(userResponse);
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Une erreur s\'est produite lors de la connexion');
      console.error("Login error caught:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'inscription');
      }
      
      const data = await response.json();
      
      // Stocker le token dans localStorage
      localStorage.setItem('auth_token', data.access_token);
      
      // Mettre à jour l'état utilisateur
      setUser(data.user);
      
      return true;
    } catch (err) {
      setError(err.message || 'Une erreur s\'est produite lors de l\'inscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('auth_token');
    
    // Réinitialiser l'état utilisateur
    setUser(null);
  };

  // Valeur du contexte
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// HOC pour protéger les routes qui nécessitent une authentification
export const withAuth = (Component) => {
  const WithAuth = (props) => {
    const { user, loading, isAuthenticated } = useAuth();
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        setRedirecting(true);
        // Rediriger vers la page de connexion
        window.location.href = '/auth/login';
      }
    }, [loading, isAuthenticated]);

    if (loading || redirecting) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
          <p className="ml-2 text-gray-500">
            {redirecting ? 'Redirection vers la page de connexion...' : 'Chargement...'}
          </p>
        </div>
      );
    }

    return <Component {...props} user={user} />;
  };

  return WithAuth;
};

// Styles pour le spinner
export const AuthStyles = () => (
  <style jsx global>{`
    .spinner {
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 3px solid #10B981;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      display: inline-block;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>
);
