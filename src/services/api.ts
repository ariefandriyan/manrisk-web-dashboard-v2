import axios from 'axios';
import type { ApiResponse, DataItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard API
export const dashboardApi = {
  getDashboardData: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard');
    return response.data;
  },
  
  getChartData: async (chartType: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/dashboard/charts/${chartType}`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getAllData: async () => {
    const response = await apiClient.get<ApiResponse<DataItem[]>>('/admin/data');
    return response.data;
  },
  
  createData: async (data: Omit<DataItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<ApiResponse<DataItem>>('/admin/data', data);
    return response.data;
  },
  
  updateData: async (id: number, data: Partial<DataItem>) => {
    const response = await apiClient.put<ApiResponse<DataItem>>(`/admin/data/${id}`, data);
    return response.data;
  },
  
  deleteData: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/data/${id}`);
    return response.data;
  },
};

export default apiClient;
