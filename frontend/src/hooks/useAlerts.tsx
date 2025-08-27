
import { useState, useCallback, useEffect } from 'react';
import { CitizenAlert, AlertCategory, CreateAlertRequest, AlertFilters, AlertState } from "@/types/alerts";

export const useAlerts = () => {
  const [state, setState] = useState<AlertState>({
    alerts: [],
    categories: [],
    recipients: [],
    isLoading: false,
    error: null
  });

  // Fetch alert categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const categories: AlertCategory[] = await response.json();
      setState(prev => ({ ...prev, categories }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch categories'
      }));
    }
  }, []);

  // Fetch alerts with filters
  const fetchAlerts = useCallback(async (filters: AlertFilters = {}, page = 1) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });
      
      const response = await fetch(`/api/alerts/alerts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      
      const alerts: CitizenAlert[] = await response.json();
      setState(prev => ({ ...prev, alerts, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch alerts',
        isLoading: false 
      }));
    }
  }, []);

  // Create new alert
  const createAlert = useCallback(async (alertData: CreateAlertRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/alerts/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertData)
      });

      if (!response.ok) throw new Error('Failed to create alert');
      
      const newAlert: CitizenAlert = await response.json();
      setState(prev => ({
        ...prev,
        alerts: [newAlert, ...prev.alerts],
        isLoading: false
      }));

      return newAlert;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create alert',
        isLoading: false 
      }));
      throw error;
    }
  }, []);

  // Fetch user's alerts (for citizens)
  const fetchMyAlerts = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/alerts/my-alerts');
      if (!response.ok) throw new Error('Failed to fetch my alerts');
      
      const alerts: CitizenAlert[] = await response.json();
      setState(prev => ({ ...prev, alerts, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch my alerts',
        isLoading: false 
      }));
    }
  }, []);

  // Mark alert as read
  const markAsRead = useCallback(async (alertId: number) => {
    try {
      const response = await fetch(`/api/alerts/alerts/${alertId}/mark-read`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to mark alert as read');
      
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert =>
          alert.id === alertId 
            ? { ...alert, is_read: true, read_at: new Date().toISOString() }
            : alert
        )
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to mark alert as read'
      }));
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts/statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      return await response.json();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch statistics'
      }));
      return null;
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    ...state,
    fetchAlerts,
    fetchMyAlerts,
    createAlert,
    markAsRead,
    fetchStatistics,
    fetchCategories
  };
};
