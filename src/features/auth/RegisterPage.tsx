"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
  Divider,
  Chip,
} from "@heroui/react";
import { PublicLayout } from "@/layouts";
import { useRegister } from "@/hooks";
import { maskCPFInput, maskCepInput, onlyDigits } from "@/lib/utils";
import type { SexoUsuario } from "@/types";

type FormState = {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  idade: string;
  sexo: SexoUsuario | "";
  cpf: string;
  password: string;
  confirmPassword: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const INITIAL_FORM: FormState = {
  nome: "",
  sobrenome: "",
  email: "",
  telefone: "",
  idade: "",
  sexo: "",
  cpf: "",
  password: "",
  confirmPassword: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

export function RegisterPage() {
  const registerMutation = useRegister();
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    registerMutation.mutate({
      nome: formData.nome.trim(),
      sobrenome: formData.sobrenome.trim(),
      email: formData.email.trim(),
      // Enviados sem máscara: o backend compara CPF com @unique, e
      // "123.456.789-01" e "12345678901" seriam usuários distintos.
      cpf: onlyDigits(formData.cpf),
      password: formData.password,
      idade: Number(formData.idade),
      sexo: formData.sexo as SexoUsuario,
      telefone: formData.telefone ? onlyDigits(formData.telefone) : undefined,
      address: {
        cep: onlyDigits(formData.cep) || undefined,
        logradouro: formData.logradouro.trim(),
        numero: formData.numero.trim(),
        complemento: formData.complemento.trim() || undefined,
        bairro: formData.bairro.trim() || undefined,
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim(),
      },
    });
  };

  const age = Number(formData.idade);
  const addressIsValid =
    formData.logradouro.trim() &&
    formData.numero.trim() &&
    formData.cidade.trim() &&
    formData.estado.trim();

  const isFormValid =
    formData.nome.trim() &&
    formData.sobrenome.trim() &&
    formData.email.trim() &&
    formData.sexo &&
    formData.idade !== "" &&
    Number.isInteger(age) &&
    age >= 0 &&
    onlyDigits(formData.cpf).length === 11 &&
    addressIsValid &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 8;

  const isLoading = registerMutation.isPending;

  // Função para obter mensagem de erro amigável
  const getErrorMessage = () => {
    if (!registerMutation.error) return "";

    const error = registerMutation.error as any;

    // Erro de conexão (não conseguiu conectar na API)
    if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
      return `Não foi possível conectar ao servidor. Verifique se a API está rodando em ${import.meta.env.VITE_API_BASE_URL}`;
    }

    // Erro 409 - Email/CPF já existe
    if (error.response?.status === 409) {
      return "Este e-mail ou CPF já está cadastrado.";
    }

    // Erro 400 - Dados inválidos. A API devolve message como array.
    if (error.response?.status === 400) {
      const message = error.response?.data?.message;
      return Array.isArray(message) ? message.join(" ") : message || "Dados inválidos. Verifique as informações.";
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
    return error.message || "Erro ao criar conta. Tente novamente.";
  };

  const passwordsMatch =
    !formData.confirmPassword || formData.password === formData.confirmPassword;

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: formData.password.length >= 8 },
    { label: "Letra maiúscula", met: /[A-Z]/.test(formData.password) },
    { label: "Letra minúscula", met: /[a-z]/.test(formData.password) },
    { label: "Número", met: /[0-9]/.test(formData.password) },
  ];

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h1>
            <p className="text-gray-600">
              Junte-se a nós e ajude animais a encontrarem um lar
            </p>
          </div>

          <Card>
            <CardBody className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Dados pessoais
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => set("nome", e.target.value)}
                    isRequired
                    autoComplete="given-name"
                  />

                  <Input
                    label="Sobrenome"
                    placeholder="Seu sobrenome"
                    value={formData.sobrenome}
                    onChange={(e) => set("sobrenome", e.target.value)}
                    isRequired
                    autoComplete="family-name"
                  />
                </div>

                <Input
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => set("email", e.target.value)}
                  isRequired
                  autoComplete="email"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => set("cpf", maskCPFInput(e.target.value))}
                    isRequired
                    autoComplete="off"
                    inputMode="numeric"
                  />

                  <Input
                    type="number"
                    label="Idade"
                    placeholder="Ex: 25"
                    value={formData.idade}
                    onChange={(e) => set("idade", e.target.value)}
                    min="0"
                    max="120"
                    isRequired
                  />

                  <Select
                    label="Sexo"
                    placeholder="Selecione"
                    selectedKeys={formData.sexo ? [formData.sexo] : []}
                    onChange={(e) => set("sexo", e.target.value as SexoUsuario)}
                    isRequired
                  >
                    <SelectItem key="Feminino">Feminino</SelectItem>
                    <SelectItem key="Masculino">Masculino</SelectItem>
                  </Select>
                </div>

                <Input
                  type="tel"
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  description="Opcional"
                  value={formData.telefone}
                  onChange={(e) => set("telefone", onlyDigits(e.target.value).slice(0, 11))}
                  inputMode="numeric"
                  autoComplete="tel"
                />

                <Divider className="my-2" />

                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Endereço
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => set("cep", maskCepInput(e.target.value))}
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />

                  <Input
                    label="Logradouro"
                    placeholder="Rua, avenida..."
                    value={formData.logradouro}
                    onChange={(e) => set("logradouro", e.target.value)}
                    isRequired
                    autoComplete="address-line1"
                  />

                  <Input
                    label="Número"
                    placeholder="123"
                    value={formData.numero}
                    onChange={(e) => set("numero", e.target.value)}
                    isRequired
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Complemento"
                    placeholder="Apto, bloco..."
                    description="Opcional"
                    value={formData.complemento}
                    onChange={(e) => set("complemento", e.target.value)}
                    autoComplete="address-line2"
                  />

                  <Input
                    label="Bairro"
                    placeholder="Centro"
                    description="Opcional"
                    value={formData.bairro}
                    onChange={(e) => set("bairro", e.target.value)}
                  />

                  <Input
                    label="Cidade"
                    placeholder="São Paulo"
                    value={formData.cidade}
                    onChange={(e) => set("cidade", e.target.value)}
                    isRequired
                    autoComplete="address-level2"
                  />
                </div>

                <Input
                  label="Estado"
                  placeholder="UF"
                  value={formData.estado}
                  onChange={(e) => set("estado", e.target.value.toUpperCase())}
                  maxLength={2}
                  isRequired
                  autoComplete="address-level1"
                />

                <Divider className="my-2" />

                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Segurança
                </h2>

                <Input
                  type={showPassword ? "text" : "password"}
                  label="Senha"
                  placeholder="Crie uma senha forte"
                  value={formData.password}
                  onChange={(e) => set("password", e.target.value)}
                  isRequired
                  autoComplete="new-password"
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

                {formData.password && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Requisitos da senha:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {passwordRequirements.map((req, index) => (
                        <Chip
                          key={index}
                          color={req.met ? "success" : "default"}
                          variant="flat"
                          size="sm"
                          startContent={
                            req.met ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : undefined
                          }
                        >
                          {req.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirmar senha"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  isRequired
                  autoComplete="new-password"
                  isInvalid={!passwordsMatch}
                  errorMessage={!passwordsMatch && "As senhas não coincidem"}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none"
                      aria-label={
                        showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showConfirmPassword ? (
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

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full font-semibold mt-6"
                  isDisabled={!isFormValid || isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar minha conta"}
                </Button>

                {registerMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mt-2">
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
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Fazer login
                </Link>
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}