// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ---------------------------------------------
// TOKEN REFRESH HELPER
// ---------------------------------------------
const refreshAuthToken = async () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) throw new Error("No user data found");

    const userData = JSON.parse(storedUser);
    const newTimestamp = Date.now();
    const newToken = btoa(`${userData.uid}:${newTimestamp}`);

    localStorage.setItem("authToken", newToken);
    return newToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};

// ---------------------------------------------
// GENERAL API CALL HELPER
// ---------------------------------------------
const apiCall = async (endpoint, options = {}, isRetry = false) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: { "Content-Type": "application/json" },
  };

  // Attach token
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers, ...options.headers },
    });

    // Handle expired token (401)
    if (response.status === 401 && !isRetry) {
      try {
        await refreshAuthToken();
        return apiCall(endpoint, options, true);
      } catch (err) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        if (typeof window !== "undefined") {
          window.location.href = "/auth/signin";
        }

        throw new Error("Session expired. Please sign in again.");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Network error" }));
      throw new Error(errorData.error || "API request failed");
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
};

// ---------------------------------------------
// FULL API EXPORT (AUTH + CHAT + MOOD)
// ---------------------------------------------
export const api = {
  // ----------------------
  // AUTH
  // ----------------------
  auth: {
    signup: (userData) =>
      apiCall("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    signin: (credentials) =>
      apiCall("/api/auth/signin", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    getProfile: () => apiCall("/api/auth/profile"),

    updateProfile: (profileData) =>
      apiCall("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      }),
  },

  // ----------------------
  // CHAT
  // ----------------------
  chat: {
    saveConversation: (messages, sessionId = null) =>
      apiCall("/api/generate/save-conversation", {
        method: "POST",
        body: JSON.stringify({ messages, sessionId }),
      }),

    getConversations: (limit = 10) =>
      apiCall(`/api/generate/conversations?limit=${limit}`),

    getConversation: (sessionId) =>
      apiCall(`/api/generate/conversation/${sessionId}`),

    deleteConversation: (sessionId) =>
      apiCall(`/api/generate/conversation/${sessionId}`, {
        method: "DELETE",
      }),
  },

  // ----------------------
  // MOOD
  // ----------------------
  mood: {
    logMood: (moodData) =>
      apiCall("/api/mood/log", {
        method: "POST",
        body: JSON.stringify(moodData),
      }),

    getMoodEntries: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return apiCall(`/api/mood/entries${q ? `?${q}` : ""}`);
    },

    getMoodInsights: (days = 7) =>
      apiCall(`/api/mood/insights?days=${days}`),

    getTodayMood: () => apiCall("/api/mood/today"),
  },

  // ----------------------
  // HEALTH
  // ----------------------
  healthCheck: () => apiCall("/health"),
};

export default api;
