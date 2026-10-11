import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * A tela de login lê essa marca depois do reload. O toast não sobrevive ao
 * window.location, então o aviso precisa atravessar a navegação.
 */
export const SESSION_EXPIRED_KEY = 'auth:session-expired';

// Criar instância do Axios
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANTE: Envia cookies automaticamente
});

// Interceptor de requisição - não precisa adicionar token manualmente
// Os cookies são enviados automaticamente pelo navegador
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Com session + cookie, não precisamos adicionar nada manualmente
    // O navegador já envia o cookie JSESSIONID automaticamente
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - trata erros globalmente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Trata erros de autenticação
    if (error.response?.status === 401) {
      // Login, cadastro e logout devolvem 401 por outro motivo (senha errada
      // ou sessão já encerrada de propósito). Não tratar isso como expiração.
      const requestUrl = error.config?.url ?? '';
      const isAuthAttempt = ['/auth/login', '/auth/register', '/auth/logout'].some(
        (path) => requestUrl.includes(path)
      );

      // Redirecionar só quando existia sessão. Em /animais e /perdidos o 401
      // significa "visitante sem login", não "sessão expirada": expulsar para
      // /login tiraria do visitante o acesso público a essas telas.
      const hadSession = !!localStorage.getItem('user');

      if (hadSession && !isAuthAttempt) {
        localStorage.removeItem('user');
        sessionStorage.setItem(SESSION_EXPIRED_KEY, '1');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Trata erro de rede
    if (!error.response) {
      console.error('Erro de rede: Não foi possível conectar à API');
    }
    
    return Promise.reject(error);
  }
);

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Funções auxiliares para tratamento de erros
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Erro desconhecido';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro desconhecido';
};

export default api;
