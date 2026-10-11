import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adoptionsService,
  AdoptionWithRelations,
  CompleteAdoptionResponse,
  CreateAdoptionPayload,
  RejectAdoptionResponse,
} from '@/services';
import { getErrorMessage } from '@/services/api';
import { Adoption } from '@/types';
import { animalKeys } from './useAnimals';

// Keys para cache do React Query
export const adoptionKeys = {
  all: ['adoptions'] as const,
  received: () => [...adoptionKeys.all, 'received'] as const,
  sent: () => [...adoptionKeys.all, 'sent'] as const,
  details: () => [...adoptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...adoptionKeys.details(), id] as const,
};

/**
 * Hook para buscar adoções recebidas (onde o usuário é dono do pet).
 * Atualiza automaticamente a cada 10 segundos para mostrar novas solicitações.
 */
export function useReceivedAdoptions() {
  return useQuery<AdoptionWithRelations[], Error>({
    queryKey: adoptionKeys.received(),
    queryFn: () => adoptionsService.getReceived(),
    refetchInterval: 10000, // Refetch a cada 10 segundos
    refetchOnWindowFocus: true, // Refetch quando voltar para a aba
  });
}

/**
 * Hook para buscar adoções enviadas (onde o usuário é o solicitante).
 * Atualiza automaticamente a cada 10 segundos para mostrar mudanças de status.
 */
export function useSentAdoptions() {
  return useQuery<AdoptionWithRelations[], Error>({
    queryKey: adoptionKeys.sent(),
    queryFn: () => adoptionsService.getSent(),
    refetchInterval: 10000, // Refetch a cada 10 segundos
    refetchOnWindowFocus: true, // Refetch quando voltar para a aba
  });
}

/**
 * Hook para solicitar a adoção de um pet.
 *
 * POST /api/adoption — só funciona autenticado; quem não tiver sessão recebe
 * 401 (o interceptor de api.ts manda para o login).
 */
export function useCreateAdoption() {
  const queryClient = useQueryClient();

  return useMutation<Adoption, unknown, CreateAdoptionPayload>({
    mutationFn: (payload: CreateAdoptionPayload) => adoptionsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adoptionKeys.all });
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
    onError: (error) => {
      console.error('Erro ao solicitar adoção:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para concluir uma adoção.
 *
 * Como a rota também muda o status do pet para "Adotado", invalidamos o cache
 * do animal afetado.
 */
export function useCompleteAdoption() {
  const queryClient = useQueryClient();

  return useMutation<CompleteAdoptionResponse, unknown, string>({
    mutationFn: (id: string) => adoptionsService.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adoptionKeys.all });
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(data.pet.id) });
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
    onError: (error) => {
      console.error('Erro ao concluir adoção:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para rejeitar uma solicitação de adoção.
 */
export function useRejectAdoption() {
  const queryClient = useQueryClient();

  return useMutation<RejectAdoptionResponse, unknown, string>({
    mutationFn: (id: string) => adoptionsService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adoptionKeys.all });
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
    onError: (error) => {
      console.error('Erro ao rejeitar adoção:', getErrorMessage(error));
    },
  });
}
