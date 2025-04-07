import React, { useState, useEffect, createContext, useContext } from 'react';

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
    // Dans une vraie application, nous vérifierions le token JWT dans localStorage
    // et ferions un appel API pour valider la session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Simuler un appel API pour vérifier le token
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Simuler un utilisateur connecté
          setUser({
            id: '1',
            username: 'thomas_dupont',
            email: 'thomas.dupont@example.com',
            fullName: 'Thomas Dupont'
          });
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
    setLoading(true);
    setError(null);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans une vraie application, nous ferions un appel API ici
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      
      // if (!response.ok) {
      //   throw new Error('Identifiants incorrects');
      // }
      
      // const data = await response.json();
      
      // Simuler une réponse d'API
      const data = {
        token: 'fake_jwt_token_' + Math.random().toString(36).substring(2),
        user: {
          id: '1',
          username: 'thomas_dupont',
          email: email,
          fullName: 'Thomas Dupont'
        }
      };
      
      // Stocker le token dans localStorage
      localStorage.setItem('auth_token', data.token);
      
      // Mettre à jour l'état utilisateur
      setUser(data.user);
      
      return true;
    } catch (err) {
      setError(err.message || 'Une erreur s\'est produite lors de la connexion');
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
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans une vraie application, nous ferions un appel API ici
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Erreur lors de l\'inscription');
      // }
      
      // const data = await response.json();
      
      // Simuler une réponse d'API
      const data = {
        success: true,
        message: 'Inscription réussie'
      };
      
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
