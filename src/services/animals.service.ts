import axios from 'axios';
import {
  Animal,
  AnimalFilters,
  CreateAnimalDTO,
  UpdateAnimalDTO,
  PaginacaoParams,
  PaginatedPets,
} from '@/types';
import api from './api';

/**
 * Formatos de resposta do PetController.
 *
 * findAll devolve `{ data, meta }` (paginado).
 * findOne e remove devolvem `{ pets }` com um único objeto dentro.
 * create e update devolvem `{ pet, mensagem }`.
 */
interface PetListResponse {
  data: Animal[];
  meta: PaginatedPets['meta'];
}

interface PetSingleResponse {
  pets: Animal;
}

interface PetCreateResponse {
  pet: Animal;
  mensagem: string;
}

interface PetUpdateResponse {
  pet: Animal;
  mensagem: string;
}

/** Limite aceito pelo @Max(100) do PaginationQueryDto. */
const MAX_LIMIT = 100;

class AnimalsService {
  private readonly baseURL = '/pet';

  /**
   * Buscar pets paginados
   *
   * GET /api/pet?page=&limit= devolve `{ data, meta }`.
   *
   * A paginação é do servidor, mas os filtros da tela (busca, espécie, sexo,
   * status, idade) não existem no backend: são aplicados no cliente sobre a
   * página atual. Por isso a paginação e os filtros não podem ser misturados
   * sem cuidado — filtrar só a página atual subnotifica o total.
   */
  async getAll(pagination?: PaginacaoParams): Promise<PaginatedPets> {
    const params = {
      page: pagination?.page ?? 1,
      // O backend rejeita com 400 qualquer limit fora de [1, 100].
      limit: Math.min(Math.max(pagination?.limit ?? 10, 1), MAX_LIMIT),
    };

    const response = await api.get<PetListResponse>(this.baseURL, { params });

    return {
      data: response.data?.data ?? [],
      meta: response.data?.meta ?? {
        page: params.page,
        limit: params.limit,
        totalItems: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  /**
   * Buscar uma página de pets já filtrada no cliente.
   *
   * Usado pelas telas com filtros. Como o filtro roda depois da paginação, a
   * meta devolvida reflete a página do servidor, não o total filtrado — a
   * tela trata isso exibindo "resultados na página atual".
   */
  async getFiltered(
    filters: AnimalFilters,
    pagination?: PaginacaoParams
  ): Promise<PaginatedPets> {
    const page = await this.getAll(pagination);
    return {
      data: this.applyFilters(page.data, filters),
      meta: page.meta,
    };
  }

  private applyFilters(pets: Animal[], filters?: AnimalFilters): Animal[] {
    if (!filters) return pets;

    const search = filters.busca?.trim().toLowerCase();

    return pets.filter((pet) => {
      if (search) {
        const alvo = [pet.nome, pet.raca, pet.localizacao]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!alvo.includes(search)) return false;
      }

      if (filters.especie && filters.especie !== 'todos' && pet.especie !== filters.especie) {
        return false;
      }

      if (filters.sexo && filters.sexo !== 'todos' && pet.sexo !== filters.sexo) {
        return false;
      }

      if (filters.status && filters.status !== 'todos' && pet.status !== filters.status) {
        return false;
      }

      if (filters.localizacao && pet.localizacao !== filters.localizacao) return false;

      if (filters.idadeMinima !== undefined && pet.idade < filters.idadeMinima) return false;
      if (filters.idadeMaxima !== undefined && pet.idade > filters.idadeMaxima) return false;

      return true;
    });
  }

  /**
   * Buscar pet por ID
   */
  async getById(id: string): Promise<Animal | null> {
    try {
      const response = await api.get<PetSingleResponse>(`${this.baseURL}/${id}`);
      return response.data?.pets ?? null;
    } catch (error) {
      // O backend lança NotFoundException para id inválido
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  }

  /**
   * Criar novo pet
   *
   * O endpoint é multipart: os campos de texto vão como string e a foto vai
   * no campo "foto". É importante sobrescrever o Content-Type da instância,
   * que é application/json — com ele o axios converte o FormData para JSON e
   * o arquivo se perde silenciosamente.
   */
  async create(data: CreateAnimalDTO): Promise<Animal> {
    const form = new FormData();

    form.append("nome", data.nome);
    form.append("idade", String(data.idade));
    form.append("sexo", data.sexo);
    form.append("especie", data.especie);
    form.append("userId", data.userId);

    if (data.raca?.trim()) form.append("raca", data.raca.trim());
    if (data.cor?.trim()) form.append("cor", data.cor.trim());
    if (data.descricao?.trim()) form.append("descricao", data.descricao.trim());
    if (data.localizacao?.trim())
      form.append("localizacao", data.localizacao.trim());
    if (data.foto instanceof File && data.foto.size > 0) {
      form.append("foto", data.foto, data.foto.name);
    }

    const response = await api.post<PetCreateResponse>(this.baseURL, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.pet;
  }

  /**
   * Atualizar pet existente
   * O backend usa PATCH, não PUT.
   */
  async update(id: string, data: UpdateAnimalDTO): Promise<Animal> {
    const response = await api.patch<PetUpdateResponse>(`${this.baseURL}/${id}`, data);
    return response.data.pet;
  }

  /**
   * Deletar pet
   */
  async delete(id: string): Promise<void> {
    await api.delete<PetSingleResponse>(`${this.baseURL}/${id}`);
  }

/**
 * Buscar todos os pets, percorrendo todas as páginas.
 *
 * Use apenas quando a tela precisa do conjunto completo (por exemplo, para
 * resolver adoption.petId -> pet). Para listagem paginada, use getAll.
 */
async getEveryPage(): Promise<Animal[]> {
  const all: Animal[] = [];
  let page = 1;

  // Teto de segurança para não girar infinitamente se totalPages vier errado.
  for (let request = 0; request < 50; request += 1) {
    const result = await this.getAll({ page, limit: MAX_LIMIT });
    all.push(...result.data);

    if (!result.meta.hasNextPage) break;
    page += 1;
  }

  return all;
}

/**
 * Buscar pets do usuário logado
 *
 * Não existe rota "meus pets" no backend, então o filtro por userId roda no
 * cliente. Como findAll é paginado, percorremos todas as páginas — senão só
 * veríamos os pets do usuário que caíssem na primeira página.
 */
async getMyAnimals(userId: string, filters?: AnimalFilters): Promise<Animal[]> {
  const mine = (await this.getEveryPage()).filter((pet) => pet.userId === userId);
  return this.applyFilters(mine, filters);
}
}

export const animalsService = new AnimalsService();