import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, LoginDTO, RegisterDTO } from '@/services';
import { getErrorMessage } from '@/services/api';
import { useNavigate } from '@tanstack/react-router';

/**
 * Hook para login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginDTO) => authService.login(data),
    onSuccess: async (data) => {
      // Garante que os dados estão salvos no localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Redireciona imediatamente - o dashboard vai limpar as queries antigas
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      console.error('Erro ao fazer login:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para registro
 *
 * O backend abre sessão no próprio cadastro, então dá para ir direto
 * ao dashboard como no login.
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterDTO) => authService.register(data),
    onSuccess: async (data) => {
      // Garante que os dados estão salvos no localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Redireciona imediatamente - o dashboard vai limpar as queries antigas
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      console.error('Erro ao fazer registro:', getErrorMessage(error));
    },
  });
}

/**
 * Hook para logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(), // Agora é assíncrono
    onSuccess: () => {
      // Limpa cache e redireciona
      queryClient.clear();
      navigate({ to: '/login' });
    },
  });
}

/**
 * Hook para buscar o usuário logado em /auth/me
 * Única fonte de verdade do perfil — o cookie de sessão é quem autoriza.
 *
 * `enabled: false` segura a requisição. Necessário em telas públicas: o
 * interceptor de 401 em services/api.ts redireciona para /login, então um
 * /auth/me disparado por um visitante anônimo expulsaria quem só está
 * navegando.
 */
export function useSessionUser(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.me(),
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false,
  });
}

/**
 * Usuário da sessão, mas somente quando o navegador indica que há sessão.
 *
 * Use em telas que todo mundo vê (listagem e detalhe de animal) e que precisam
 * personalizar a interface para o dono: para quem não tem sessão o hook
 * simplesmente não pergunta nada ao servidor e devolve undefined.
 */
export function useOptionalSessionUser() {
  return useSessionUser({ enabled: authService.isAuthenticated() });
}

/**
 * Diz se o usuário da sessão é o dono do recurso.
 *
 * É a base das permissões de escrita da interface: quem não é dono não vê
 * botões de edição/exclusão. O id do localStorage é usado como fallback para
 * o botão não piscar antes do /auth/me responder.
 *
 * Isso é só a camada visual: quem garante a regra é o backend, que precisa
 * recusar o DELETE de um pet que não pertence a quem pediu.
 */
export function useIsOwner(ownerId?: string | null): boolean {
  const { data: sessionUser } = useOptionalSessionUser();
  const currentId = sessionUser?.id ?? authService.getCurrentUser()?.id ?? null;

  if (!currentId || !ownerId) return false;
  return currentId === ownerId;
}

/**
 * Hook para verificar se está autenticado
 */
export function useIsAuthenticated() {
  return authService.isAuthenticated();
}

/**
 * Hook para obter usuário atual
 */
export function useCurrentUser() {
  return authService.getCurrentUser();
}
