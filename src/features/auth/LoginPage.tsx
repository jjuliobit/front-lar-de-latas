"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Input, Button, Card, CardBody, Divider } from "@heroui/react";
import { PublicLayout } from "@/layouts";
import { useLogin, useToast } from "@/hooks";
import { SESSION_EXPIRED_KEY } from "@/services/api";

const TEST_ACCOUNT = {
  email: "teste@gmail.com",
  senha: "@Teste123",
};

export function LoginPage() {
  const loginMutation = useLogin();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_EXPIRED_KEY) !== "1") return;
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);
    toastRef.current.error(
      "Sessão expirada",
      "Faça login novamente para continuar.",
      6000
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Chamar a API de autenticação
    loginMutation.mutate({
      email: formData.email,
      senha: formData.senha,
    });
  };

  const isFormValid = formData.email && formData.senha;
  const isLoading = loginMutation.isPending;

  // Função para obter mensagem de erro amigável
  const getErrorMessage = () => {
    if (!loginMutation.error) return "";

    const error = loginMutation.error as any;

    // Erro de conexão (não conseguiu conectar na API)
    if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
      return `Não foi possível conectar ao servidor. Verifique se a API está rodando em ${import.meta.env.VITE_API_BASE_URL}`;
    }

    // Erro 401 - Credenciais inválidas
    if (error.response?.status === 401) {
      return "E-mail ou senha incorretos. Verifique suas credenciais.";
    }

    // Erro 500 - Erro no servidor
    if (error.response?.status >= 500) {
      return "Erro no servidor. Tente novamente mais tarde.";
    }

    // Mensagem do backend (se existir)
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Fallback
    return error.message || "Erro ao fazer login. Tente novamente.";
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-3xl">
          <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h1>
            <p className="text-gray-600">Entre com sua conta para continuar</p>
          </div>

          <Card>
            <CardBody className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isRequired
                  autoComplete="email"
                />

                <Input
                  type={showPassword ? "text" : "password"}
                  label="Senha"
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  isRequired
                  autoComplete="current-password"
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  }
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline focus:outline-none"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full font-semibold"
                  isDisabled={!isFormValid || isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>

                {loginMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{getErrorMessage()}</span>
                    </div>
                  </div>
                )}
              </form>

              <Divider className="my-6" />


              <p className="text-center text-sm text-gray-600">
                Ainda não tem uma conta?{" "}
                <Link to="/registro" className="text-primary font-semibold hover:underline">
                  Criar conta
                </Link>
              </p>
            </CardBody>
          </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
            <Card className="h-full border border-gray-200 shadow-sm">
              <CardBody className="flex h-full flex-row items-start gap-3 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    A API pode demorar um pouco
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    Na primeira tentativa, o servidor pode levar alguns instantes para
                    responder devido à hospedagem. Aguarde o carregamento e, se necessário,
                    tente novamente.
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="h-full border border-gray-200 shadow-sm">
              <CardBody className="flex h-full flex-col gap-4 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Conta para testes
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      Use estas credenciais para explorar o sistema sem criar uma conta.
                    </p>
                  </div>
                </div>

                <dl className="mt-auto space-y-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500">E-mail</dt>
                    <dd className="font-medium text-gray-900">{TEST_ACCOUNT.email}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-gray-500">Senha</dt>
                    <dd className="font-mono font-medium text-gray-900">{TEST_ACCOUNT.senha}</dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
