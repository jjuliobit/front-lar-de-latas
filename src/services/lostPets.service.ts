import {
  LostPet,
  LostPetFilters,
  CreateLostPetDTO,
  UpdateLostPetDTO,
} from '@/types';
import api from './api';

class LostPetsService {
  private readonly baseURL = '/lost-pets';

  /**
   * Buscar todos os pets perdidos.
   *
   * GET /lost-pets devolve um array simples — não é paginado e não aceita
   * filtros. Os filtros da tela (busca, espécie, localização) são aplicados
   * aqui no cliente, como no AnimalsService.
   */
  async getAll(filters?: LostPetFilters): Promise<LostPet[]> {
    const response = await api.get<LostPet[]>(this.baseURL);
    return this.applyFilters(response.data ?? [], filters);
  }

  /**
   * Buscar pet perdido por ID
   */
  async getById(id: string): Promise<LostPet> {
    const response = await api.get<LostPet>(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Criar novo registro de pet perdido
   *
   * O endpoint é multipart: os campos de texto vão como string e a foto vai
   * no campo "foto". É importante sobrescrever o Content-Type da instância,
   * que é application/json — com ele o axios converte o FormData para JSON e
   * o arquivo se perde silenciosamente.
   */
  async create(data: CreateLostPetDTO): Promise<LostPet> {
    const form = new FormData();

    form.append("nome", data.nome);
    form.append("especie", data.especie);
    form.append("localizacao", data.localizacao);
    form.append("dataUltimaVez", data.dataUltimaVez);
    form.append("nomeContato", data.nomeContato);
    form.append("telefoneContato", data.telefoneContato);
    form.append("emailContato", data.emailContato);
    form.append("userId", data.userId);

    if (data.sexo?.trim()) form.append("sexo", data.sexo);
    if (data.raca?.trim()) form.append("raca", data.raca.trim());
    if (data.cor?.trim()) form.append("cor", data.cor.trim());
    if (data.descricao?.trim()) form.append("descricao", data.descricao.trim());
    if (data.foto instanceof File && data.foto.size > 0) {
      form.append("foto", data.foto, data.foto.name);
    }

    const response = await api.post<LostPet>(this.baseURL, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  /**
   * Atualizar registro de pet perdido
   *
   * O backend só expõe PATCH e devolve `{ lostPet, mensagem }`.
   */
  async update(id: string, data: UpdateLostPetDTO): Promise<LostPet> {
    const response = await api.patch<{ lostPet: LostPet; mensagem: string }>(
      `${this.baseURL}/${id}`,
      data
    );
    return response.data.lostPet;
  }

  /**
   * Deletar registro de pet perdido
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Buscar pets perdidos do usuário logado.
   *
   * O backend não tem rota "meus perdidos", então o filtro por userId roda no
   * cliente sobre a lista completa.
   */
  async getMyLostPets(userId: string): Promise<LostPet[]> {
    const all = await this.getAll();
    return all.filter((pet) => pet.userId === userId);
  }

  /**
   * Marcar pet como encontrado
   *
   * Não existe rota dedicada; `encontrado` é um campo do UpdateLostPetDto.
   */
  async markAsFound(id: string): Promise<LostPet> {
    return this.update(id, { encontrado: true });
  }

  private applyFilters(
    lostPets: LostPet[],
    filters?: LostPetFilters
  ): LostPet[] {
    if (!filters) return lostPets;

    const busca = filters.busca?.trim().toLowerCase();

    return lostPets.filter((pet) => {
      if (busca) {
        const alvo = [pet.nome, pet.raca, pet.localizacao, pet.descricao]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!alvo.includes(busca)) return false;
      }

      if (
        filters.especie &&
        filters.especie !== 'todos' &&
        pet.especie !== filters.especie
      ) {
        return false;
      }

      if (
        filters.localizacao &&
        !pet.localizacao
          .toLowerCase()
          .includes(filters.localizacao.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }
}

export const lostPetsService = new LostPetsService();