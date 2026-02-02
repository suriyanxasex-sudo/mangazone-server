import axios from "axios";
import React, { useState } from "react";

// ✅ API Configuration
const getApiUrl = () => {
  // Priority: Environment variable > Production URL > Development URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Auto-detect environment
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:10000";
  }
  
  // Default production URL (Render)
  return "https://mangazone-api.onrender.com";
};

export const API_BASE_URL = getApiUrl();
export const API_URL = `${API_BASE_URL}/api`;

console.log(`🌐 API Configuration:
  Base URL: ${API_BASE_URL}
  API URL: ${API_URL}
  Environment: ${process.env.NODE_ENV}
  App Environment: ${process.env.REACT_APP_ENV || 'development'}
`);

// ✅ Axios instance with interceptors
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const authData = localStorage.getItem('MangaZone_Auth');
    if (authData) {
      try {
        const user = JSON.parse(authData);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    
    console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    const status = error.response?.status;
    
    console.error(`❌ API Error [${status}]:`, errorMessage);
    
    // Handle specific errors
    if (status === 401) {
      console.warn('Authentication required, redirecting to login...');
      localStorage.removeItem('MangaZone_Auth');
      window.location.href = '/login';
    } else if (status === 403) {
      console.warn('Access forbidden');
    } else if (status === 404) {
      console.warn('Resource not found');
    } else if (status >= 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// ✅ Utility: Check API Health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      healthy: true,
      data: response.data,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date()
    };
  }
};

// ✅ Utility: Image with fallback
export const ImageWithFallback = ({ src, alt, className, fallback, ...props }) => {
  const [error, setError] = useState(false);
  
  const handleError = () => {
    console.warn(`Image failed to load: ${src}`);
    setError(true);
  };
  
  const imageSrc = error || !src ? 
    (fallback || "https://placehold.co/400x600/1e1e1e/FFF?text=No+Cover") : 
    src;
  
  return (
    <img
      src={imageSrc}
      alt={alt || "Manga Cover"}
      className={className}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

// ✅ Utility: Time ago in Thai
export const timeAgo = (date) => {
  if (!date) return "";
  
  try {
    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now - past) / 1000);
    
    if (seconds < 0) return "ในอนาคต";
    if (seconds < 60) return "เพิ่งอ่าน";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} วันที่แล้ว`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} เดือนที่แล้ว`;
    
    const years = Math.floor(months / 12);
    return `${years} ปีที่แล้ว`;
  } catch (e) {
    console.error('Error calculating time ago:', e);
    return "";
  }
};

// ✅ Utility: Format number
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// ✅ Utility: Generate random ID
export const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

// ✅ Utility: Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};