// Centralized API URL configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function for API calls
export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_URL}${endpoint}`;
  return fetch(url, options);
};
