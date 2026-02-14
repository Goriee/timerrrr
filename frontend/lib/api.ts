import axios from 'axios';
import { Boss, UpdateBossInput } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bossApi = {
  // Get all bosses
  getAllBosses: async (server: string = 'M5'): Promise<Boss[]> => {
    const response = await api.get<Boss[]>('/api/bosses', { params: { server } });
    return response.data;
  },

  // Get single boss
  getBoss: async (id: number): Promise<Boss> => {
    const response = await api.get<Boss>(`/api/bosses/${id}`);
    return response.data;
  },

  // Update boss
  updateBoss: async (
    id: number,
    password: string,
    updates: UpdateBossInput
  ): Promise<Boss> => {
    const response = await api.post<Boss>(`/api/bosses/${id}/update`, {
      password,
      updates,
    });
    return response.data;
  },

  // Mark boss as killed
  killBoss: async (id: number, password: string): Promise<Boss> => {
    const response = await api.post<Boss>(`/api/bosses/${id}/kill`, {
      password,
    });
    return response.data;
  },

  // Validate password
  checkPassword: async (password: string): Promise<boolean> => {
    const response = await api.post<{ valid: boolean }>('/api/auth/check', {
      password,
    });
    return response.data.valid;
  },
};

export default api;
