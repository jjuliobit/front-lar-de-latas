import api from './api';
import type { SessionUser } from './auth.service';

export interface UpdateUserDTO {
  nome?: string;
  sobrenome?: string;
  idade?: number;
  foto?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

class UsersService {
  // O controller do backend é @Controller('user') — no singular
  private readonly baseURL = '/user';

  /**
   * Buscar perfil do usuário logado
   * Usa GET /auth/me, que valida o cookie de sessão e devolve
   * exatamente o usuário da sessão — não existe endpoint dedicado de perfil.
   */
  async getProfile() {
    const response = await api.get<{ user: SessionUser }>('/auth/me');
    return response.data.user;
  }

  /**
   * Atualizar dados do usuário
   * O backend expõe PATCH /user/:id (singular).
   */
  async update(id: string, data: UpdateUserDTO) {
    const response = await api.patch<{ user: SessionUser }>(`${this.baseURL}/${id}`, data);

    // Atualiza localStorage para os layouts refletirem a mudança
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data.user;
  }

  /**
   * Deletar conta
   */
  async deleteAccount(id: string) {
    await api.delete(`${this.baseURL}/${id}`);

    localStorage.removeItem('user');
  }

  /**
   * Buscar usuário por ID
   */
  async getById(id: string) {
    const response = await api.get<{ user: SessionUser }>(`${this.baseURL}/${id}`);
    return response.data.user;
  }
}

export const usersService = new UsersService();
