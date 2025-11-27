import { stopConnection } from "./signalRService";

const API_URL = "https://localhost:7087/api";

export const getToken = () => localStorage.getItem("token");

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = async () => {
  console.log(" Logging out...");
  
  // Stop SignalR connection before clearing storage
  try {
    await stopConnection();
    console.log("✅ SignalR connection stopped");
  } catch (error) {
    console.warn("Error stopping SignalR connection:", error);
  }
  
  // Clear all authentication data
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("✅ Tokens cleared");
  
  // Redirect to login
  window.location.href = "/";
};

export const setUserData = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// API client with authentication
const api = {
  async request(url, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Request failed with status ${response.status}`);
    }
    
    return response.json();
  },
  
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  },
  
  post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  },
};

export default api;
