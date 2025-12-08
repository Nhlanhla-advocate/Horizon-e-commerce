'use client';

import { useState, useEffect } from 'react';

// Backend base URL
const BASE_URL = 'http://localhost:5000';

/**
 * Formats a number as currency in South African Rand 
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount || 0);
};

/**
 * Formats a date string to a localized date format
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

/**
 * Custom hook for fetching analytics data with authentication
 * @param {string} endpoint - The endpoint to fetch from (relative path, e.g., '/dashboard/analytics/top-selling')
 * @param {Object} queryParams - Query parameters object
 * @param {Array} dependencies - Dependencies array for useEffect 
 * @param {string} errorMessage - Custom error message
 * @returns {Object} { data, loading, error, refetch }
 */
export const useAnalyticsFetch = (endpoint, queryParams = {}, dependencies = [], errorMessage = 'Failed to fetch data') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      // Construct full URL with base URL
      const fullEndpoint = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
      const url = params.toString() ? `${fullEndpoint}?${params}` : fullEndpoint;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorData = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        
        throw new Error(errorData.error || errorData.message || errorMessage);
      }

      const result = await response.json();
      
      // Handle both { success: true, data: [...] } and direct array responses
      if (result.success && result.data) {
        setData(result.data);
      } else if (Array.isArray(result.data)) {
        setData(result.data);
      } else if (Array.isArray(result)) {
        setData(result);
      } else {
        setData(result.data || result);
      }
    } catch (err) {
      setError(err.message || errorMessage);
      setData(null);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};
