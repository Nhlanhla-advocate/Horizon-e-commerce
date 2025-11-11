'use client';

import { useState, useEffect } from 'react';

/**
 * Formats a number as currency in South African Rand 
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

/**
 * Formats a date string to a localized date format
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Custom hook for fetching analytics data with authentication
 * @param {string} endpoint - The endpoint to fetch from
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
      
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const url = params.toString() ? `${endpoint}?${params}` : endpoint;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err.message);
      setData(null);
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
