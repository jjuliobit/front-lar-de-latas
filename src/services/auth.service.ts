import { SexoUsuario } from '@/types';
import api from './api';

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface RegisterAddressDTO {
  cep?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
}

/**
 * Espelha CreateUserDto do backend. `sexo` e `address` são obrigatórios lá,
 * então mandá-los no mesmo formato evita o 400 do ValidationPipe.
 */
export interface RegisterDTO {
  nome: string;
  sobrenome: string;
  telefone?: string;
  idade: number;
  sexo: SexoUsuario;
  email: string;
  cpf: string;
  password: string;
  address: RegisterAddressDTO;
}

export interface AuthResponse {
  user: SessionUser;
  mensagem?: string;
}

/**
 * Usuário retornado por GET /auth/me (e por PATCH /user/:id).
 * A API devolve os mesmos campos do schema do banco.
 */
export interface SessionUser {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string | null;
  idade: number;
  sexo: string;
  cpf: string;
  foto: string | null;
  createdAt?: string;
}

class AuthService {
  private readonly baseURL = '/auth';

  /**
   * Fazer login
   * O backend retorna um cookie HttpOnly (JSESSIONID) automaticamente
   */
  async login(data: LoginDTO) {
    const response = await api.post<AuthResponse>(`${this.baseURL}/login`, data);
    
    // Salvar dados do usuário no localStorage
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Fazer registro
   *
   * O backend emite o cookie de sessão junto com o cadastro, então o usuário
   * já entra autenticado. Salvamos no localStorage para o guarda de rota liberar.
   */
  async register(data: RegisterDTO) {
    const response = await api.post<AuthResponse>(`${this.baseURL}/register`, data);

    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  }

  /**
   * Buscar o usuário da sessão atual em GET /auth/me
   * É a fonte de verdade do perfil: o cookie de sessão é o que autoriza a chamada.
   */
  async me(): Promise<SessionUser> {
    const response = await api.get<{ user: SessionUser }>(`${this.baseURL}/me`);
    const user = response.data.user;

    // Mantém o localStorage em sincronia com o servidor
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  /**
   * Fazer logout
   * Chama o endpoint de logout no backend para invalidar a sessão
   */
  async logout() {
    try {
      // Chama endpoint de logout no backend para limpar a sessão
      await api.post(`${this.baseURL}/logout`);
    } catch (error) {
      // Uma sessão já expirada não impede o logout no cliente
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Remove dados do usuário do localStorage
      localStorage.removeItem('user');
    }
  }

  /**
   * Verificar se usuário está autenticado
   * Como usamos session cookie, verificamos se há dados do usuário no localStorage
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  /**
   * Obter usuário logado do localStorage
   * Preferir sempre authService.me() — o localStorage pode ter o
   * payload parcial devolvido pelo login.
   */
  getCurrentUser(): SessionUser | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
