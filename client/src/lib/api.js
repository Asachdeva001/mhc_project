// API configuration for connecting to the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' },
  };

  // Add auth token if exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// API functions (ONLY MOOD)
export const api = {
  mood: {
    logMood: async (moodData) => {
      return apiCall('/api/mood/log', {
        method: 'POST',
        body: JSON.stringify(moodData),
      });
    },

    getMoodEntries: async (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      return apiCall(`/api/mood/entries${queryParams ? `?${queryParams}` : ''}`);
    },

    getMoodInsights: async (days = 7) => {
      return apiCall(`/api/mood/insights?days=${days}`);
    },

    getTodayMood: async () => {
      return apiCall('/api/mood/today');
    },
  },

  healthCheck: async () => {
    return apiCall('/health');
  },
};

export default api;
