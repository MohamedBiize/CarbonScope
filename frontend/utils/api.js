// frontend/utils/api.js

const API_BASE_URL = 'http://localhost:8000';

export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  
    const headers = {
    ...options.headers,
    };
  
    if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
      if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      throw new Error('Unauthorized');
        }
    const error = await response.json();
    throw new Error(error.detail || 'An error occurred');
      }
  
      return response.json();
  }
  