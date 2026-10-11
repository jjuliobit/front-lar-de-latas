import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Hoje";
  if (diffInDays === 1) return "Ontem";
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;
  return `${Math.floor(diffInDays / 365)} anos atrás`;
}

export function maskCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function maskCPFPartial(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4");
}

/**
 * Máscara progressiva para digitação: aplica a pontuação conforme o usuário digita.
 * Útil em inputs de formulário, onde maskCPF só funciona com os 11 dígitos prontos.
 */
export function maskCPFInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d+)/, "$1.$2");
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return maskCPF(digits);
}

export function maskCepInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? digits.replace(/(\d{5})(\d+)/, "$1-$2") : digits;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * `foto` é opcional no schema do Pet, então pode vir null. Um SVG inline
 * evita <img src=""> quebrando o layout dos cards de pet sem foto.
 */
export const PLACEHOLDER_PET_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ccircle cx='200' cy='130' r='52' fill='%239ca3af'/%3E%3Ccircle cx='160' cy='110' r='22' fill='%239ca3af'/%3E%3Ccircle cx='240' cy='110' r='22' fill='%239ca3af'/%3E%3Ctext x='200' y='240' font-family='sans-serif' font-size='20' fill='%236b7280' text-anchor='middle'%3ESem foto%3C/text%3E%3C/svg%3E";

/**
 * A API devolve a foto como caminho relativo ("/uploads/pets/<uuid>.png"),
 * servido fora do prefixo /api. Um src relativo resolveria contra a porta do
 * front (5173) e quebraria, então(prefixa com a origem da API.
 */
export function resolveApiImageUrl(foto: string | null | undefined): string | null {
  if (!foto) return null;
  if (/^https?:\/\//i.test(foto)) return foto;

  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const origin = base.replace(/\/api\/?$/, "");
  return `${origin}${foto.startsWith("/") ? foto : `/${foto}`}`;
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

// Os enums chegam do backend em PascalCase, então as chaves aqui são os
// valores reais do Prisma. Fallback para o próprio valor caso venha algo novo.
export function getSpeciesLabel(species: string): string {
  const labels: Record<string, string> = {
    Cachorro: "Cachorro",
    Gato: "Gato",
    Passaro: "Pássaro",
    Outro: "Outro",
  };
  return labels[species] || species;
}

export function getSexLabel(sex: string): string {
  const labels: Record<string, string> = {
    Macho: "Macho",
    Femea: "Fêmea",
  };
  return labels[sex] || sex;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    Disponivel: "Disponível",
    EmProcesso: "Em processo",
    Adotado: "Adotado",
    Indisponivel: "Indisponível",
  };
  return labels[status] || status;
}

export function getAdoptionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    Enviado: "Solicitação enviada",
    Analisando: "Em análise",
    Aprovado: "Aprovada",
    Rejeitado: "Recusada",
    Concluido: "Concluída",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): "success" | "warning" | "default" | "danger" | "primary" {
  const colors: Record<string, "success" | "warning" | "default" | "danger" | "primary"> = {
    Disponivel: "success",
    EmProcesso: "warning",
    Adotado: "default",
    Indisponivel: "danger",
    Enviado: "primary",
    Analisando: "warning",
    Aprovado: "success",
    Rejeitado: "danger",
    Concluido: "success",
  };
  return colors[status] || "default";
}
