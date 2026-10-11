import { Adoption, Animal } from '@/types';
import api from './api';

/**
 * Resposta de PATCH /api/adoption/:id/complete.
 * O service do backend devolve a adoção e o pet já atualizados.
 */
export interface CompleteAdoptionResponse {
  message: string;
  adoption: Adoption;
  pet: Animal;
}

/**
 * Resposta de PATCH /api/adoption/:id/reject.
 */
export interface RejectAdoptionResponse {
  message: string;
  adoption: Adoption;
}

/** Corpo de POST /api/adoption. O solicitante vem da sessão no backend. */
export interface CreateAdoptionPayload {
  petId: string;
  observacoes?: string;
}

/**
 * Adoção com dados populados de pet e usuário.
 */
export interface AdoptionWithRelations extends Adoption {
  pet: Animal & {
    user?: {
      id: string;
      nome: string;
      sobrenome: string;
      email: string;
      telefone: string | null;
      foto: string | null;
    };
  };
  user?: {
    id: string;
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string | null;
    foto: string | null;
  };
}

class AdoptionsService {
  private readonly baseURL = '/adoption';

  /**
   * Criar uma solicitação de adoção.
   *
   * POST /api/adoption — exige sessão (o dono da solicitação sai do cookie).
   * Devolve a adoção recém-criada com status "Enviado".
   */
  async create(payload: CreateAdoptionPayload): Promise<Adoption> {
    const response = await api.post<Adoption>(this.baseURL, payload);
    return response.data;
  }

  /**
   * Listar adoções recebidas (onde o usuário é dono do pet).
   *
   * GET /api/adoption/received
   */
  async getReceived(): Promise<AdoptionWithRelations[]> {
    const response = await api.get<AdoptionWithRelations[]>(
      `${this.baseURL}/received`
    );
    return response.data;
  }

  /**
   * Listar adoções enviadas (onde o usuário é o solicitante).
   *
   * GET /api/adoption/sent
   */
  async getSent(): Promise<AdoptionWithRelations[]> {
    const response = await api.get<AdoptionWithRelations[]>(
      `${this.baseURL}/sent`
    );
    return response.data;
  }

  /**
   * Concluir uma adoção.
   *
   * PATCH /api/adoption/:id/complete
   * Marca a adoção como "Concluido", o pet como "Adotado" e rejeita as
   * demais solicitações pendentes do mesmo pet.
   */
  async complete(id: string): Promise<CompleteAdoptionResponse> {
    const response = await api.patch<CompleteAdoptionResponse>(
      `${this.baseURL}/${id}/complete`
    );
    return response.data;
  }

  /**
   * Rejeitar uma solicitação de adoção.
   *
   * PATCH /api/adoption/:id/reject
   */
  async reject(id: string): Promise<RejectAdoptionResponse> {
    const response = await api.patch<RejectAdoptionResponse>(
      `${this.baseURL}/${id}/reject`
    );
    return response.data;
  }
}

export const adoptionsService = new AdoptionsService();
