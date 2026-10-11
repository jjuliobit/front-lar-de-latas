import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsService } from '@/services';
import {
  AnimalFilters,
  CreateAnimalDTO,
  UpdateAnimalDTO,
  PaginacaoParams,
} from '@/types';
import { getErrorMessage } from '@/services/api';
import { useSessionUser } from './useAuth';

// Keys para cache do React Query
export const animalKeys = {
  all: ['animals'] as const,
  lists: () => [...animalKeys.all, 'list'] as const,
  list: (pagination?: PaginacaoParams) => [...animalKeys.lists(), { pagination }] as const,
  filtered: (filters: AnimalFilters, pagination?: PaginacaoParams) =>
    [...animalKeys.lists(), { filters, pagination }] as const,
  details: () => [...animalKeys.all, 'detail'] as const,
  detail: (id: string) => [...animalKeys.details(), id] as const,
  myAnimals: (userId?: string) => [...animalKeys.all, 'my-animals', { userId }] as const,
};

/**
 * Hook para buscar lista paginada de pets
 *
 * Retorna `{ data, meta }`. A paginação é do servidor (GET /api/pet?page=&limit=).
 */
export function useAnimals(pagination?: PaginacaoParams) {
  return useQuery({
    queryKey: animalKeys.list(pagination),
    queryFn: () => animalsService.getAll(pagination),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar todos os pets, percorrendo todas as páginas
 *
 * Use quando a tela precisa do conjunto completo, por exemplo para resolver
 * adoption.petId -> pet. Para listagem paginada, prefira useAnimals.
 */
export function useAllAnimals() {
  return useQuery({
    queryKey: [...animalKeys.all, 'all-pages'] as const,
    queryFn: () => animalsService.getEveryPage(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar pets com filtros da tela
 *
 * Os filtros não existem no backend e são aplicados no cliente sobre a página
 * atual. Com filtros ativos, a meta continua sendo a do servidor.
 */
export function useFilteredAnimals(
  filters: AnimalFilters,
  pagination?: PaginacaoParams
) {
  return useQuery({
    queryKey: animalKeys.filtered(filters, pagination),
    queryFn: () => animalsService.getFiltered(filters, pagination),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar pet por ID
 */
export function useAnimal(id: string) {
  return useQuery({
    queryKey: animalKeys.detail(id),
    queryFn: () => animalsService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar pets do usuário logado
 *
 * Depende do id da sessão: sem ele não há como filtrar, porque o backend não
 * expõe uma rota de "meus pets".
 */
export function useMyAnimals(filters?: AnimalFilters) {
  const { data: sessionUser } = useSessionUser();
  const userId = sessionUser?.id;

  return useQuery({
    queryKey: animalKeys.myAnimals(userId),
    queryFn: () => animalsService.getMyAnimals(userId!, filters),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para criar novo pet
 */
export function useCreateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnimalDTO) => animalsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
    onError: (error) => {
      console.error('Erro ao criar pet:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para atualizar pet
 */
export function useUpdateAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnimalDTO }) =>
      animalsService.update(id, data),
    onSuccess: (pet) => {
      queryClient.invalidateQueries({ queryKey: animalKeys.detail(pet.id) });
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
    onError: (error) => {
      console.error('Erro ao atualizar pet:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para deletar pet
 *
 * Só o dono do pet deve chamar isso — a interface esconde o botão para os
 * demais (ver useIsOwner), mas quem valida a regra é o backend.
 *
 * `animalKeys.all` é prefixo de todas as outras keys de pet, então invalidar
 * só ele já limpa listas, "meus animais" e o detalhe do pet removido.
 */
export function useDeleteAnimal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => animalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    },
    onError: (error) => {
      console.error('Erro ao deletar pet:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para atualizar status do pet
 *
 * Removido de propósito: o backend rejeita "status" no PATCH /pet/:id com 400
 * (UpdatePetDto = PartialType(CreatePetDto) + ValidationPipe com whitelist).
 * Não reintroduzir sem uma rota de status no backend.
 */