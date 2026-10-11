import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, UpdateUserDTO } from '@/services';
import { getErrorMessage } from '@/services/api';

// Keys para cache do React Query
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

/**
 * Hook para buscar o usuário da sessão em /auth/me
 */
export function useProfile() {
  return useQuery({
    queryKey: [...userKeys.all, 'me'],
    queryFn: () => usersService.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para atualizar dados do usuário
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) =>
      usersService.update(id, data),
    onSuccess: (data) => {
      // A sessão é a fonte de verdade do perfil
      queryClient.setQueryData([...userKeys.all, 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para deletar conta
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.deleteAccount(id),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('Erro ao deletar conta:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para buscar usuário por ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
