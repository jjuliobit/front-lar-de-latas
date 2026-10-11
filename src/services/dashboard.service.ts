import { DashboardStats } from '@/types';
import api from './api';

class DashboardService {
  private readonly baseURL = '/dashboard';

  /**
   * Buscar estatísticas do dashboard
   */
  async getStats() {
    const response = await api.get<DashboardStats>(`${this.baseURL}/stats`);
    return response.data;
  }
}

export const dashboardService = new DashboardService();
