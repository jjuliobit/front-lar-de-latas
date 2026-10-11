import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lostPetsService } from '@/services';
import { LostPetFilters, CreateLostPetDTO, UpdateLostPetDTO } from '@/types';
import { getErrorMessage } from '@/services/api';
import { useSessionUser } from './useAuth';

// Keys para cache do React Query
export const lostPetKeys = {
  all: ['lostPets'] as const,
  lists: () => [...lostPetKeys.all, 'list'] as const,
  list: (filters?: LostPetFilters) => [...lostPetKeys.lists(), { filters }] as const,
  details: () => [...lostPetKeys.all, 'detail'] as const,
  detail: (id: string) => [...lostPetKeys.details(), id] as const,
  myLostPets: (userId?: string) => [...lostPetKeys.all, 'my-lost-pets', { userId }] as const,
};

/**
 * Hook para buscar lista de pets perdidos
 *
 * O backend não pagina nem filtra: devolve o array completo e a service
 * aplica os filtros no cliente. Por isso o cache é por filtros, não por página.
 */
export function useLostPets(filters?: LostPetFilters) {
  return useQuery({
    queryKey: lostPetKeys.list(filters),
    queryFn: () => lostPetsService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar pet perdido por ID
 */
export function useLostPet(id: string) {
  return useQuery({
    queryKey: lostPetKeys.detail(id),
    queryFn: () => lostPetsService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar pets perdidos do usuário logado
 *
 * Depende do id da sessão: sem ele não há como filtrar, porque o backend não
 * expõe uma rota de "meus perdidos".
 */
export function useMyLostPets() {
  const { data: sessionUser } = useSessionUser();
  const userId = sessionUser?.id;

  return useQuery({
    queryKey: lostPetKeys.myLostPets(userId),
    queryFn: () => lostPetsService.getMyLostPets(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para criar registro de pet perdido
 */
export function useCreateLostPet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLostPetDTO) => lostPetsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostPetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lostPetKeys.myLostPets() });
    },
    onError: (error) => {
      console.error('Erro ao criar pet perdido:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para atualizar pet perdido
 */
export function useUpdateLostPet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLostPetDTO }) =>
      lostPetsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: lostPetKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: lostPetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lostPetKeys.myLostPets() });
    },
    onError: (error) => {
      console.error('Erro ao atualizar pet perdido:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para deletar pet perdido
 */
export function useDeleteLostPet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lostPetsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostPetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lostPetKeys.myLostPets() });
    },
    onError: (error) => {
      console.error('Erro ao deletar pet perdido:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para marcar pet como encontrado
 */
export function useMarkAsFound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lostPetsService.markAsFound(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostPetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lostPetKeys.myLostPets() });
    },
    onError: (error) => {
      console.error('Erro ao marcar como encontrado:', getErrorMessage(error));
    },
  });
}