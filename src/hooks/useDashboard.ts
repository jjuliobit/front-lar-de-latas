import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services';

// Keys para cache do React Query
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

/**
 * Hook para buscar estatísticas do dashboard
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
