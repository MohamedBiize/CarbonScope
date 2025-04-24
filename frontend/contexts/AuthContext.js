import { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchWithAuth('/api/v1/auth/me')
        .then(userData => {
          setUser(userData);
          setError(null);
        })
        .catch((err) => {
          console.error('Auth error:', err);
          setError(err.message);
          localStorage.removeItem('auth_token');
          setUser(null);
          // Redirect to login if we're not already there
          if (router.pathname !== '/auth/login') {
            router.push('/auth/login');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      // Redirect to login if we're not already there and not on a public page
      if (router.pathname !== '/auth/login' && router.pathname !== '/auth/register') {
        router.push('/auth/login');
      }
    }
  }, [router]);

  const login = async (email, password) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      
      const userData = await fetchWithAuth('/api/v1/auth/me');
      setUser(userData);
      router.push('/dashboard');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 