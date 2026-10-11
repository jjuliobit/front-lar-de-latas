// DTOs para comunicação com o backend
// Devem espelhar exatamente os DTOs do Spring Boot

import { Especie, Sexo, SexoPetPerdido, StatusAnimal, StatusAdocao } from "./index";

// ============================================
// DTOs DE ANIMAIS
// ============================================

export interface CriarAnimalDTO {
  nome: string;
  idade: number;
  sexo: Sexo;
  especie: Especie;
  raca?: string;
  cor?: string;
  /** Arquivo da foto: o POST /api/pet é multipart e monta a URL no backend. */
  foto?: File | null;
  descricao?: string;
  localizacao?: string;
  userId: string;
}

/**
 * O PATCH continua em JSON e não aceita foto: o campo saiu do UpdatePetDto,
 * então enviá-lo resultaria em 400 por causa do forbidNonWhitelisted.
 */
export type AtualizarAnimalDTO = Omit<Partial<CriarAnimalDTO>, "foto">;

/**
 * O status não entra aqui de propósito: CreatePetDto/UpdatePetDto não o
 * declaram e o ValidationPipe global usa forbidNonWhitelisted, então enviá-lo
 * resulta em 400. O banco aplica o @default(Disponivel) na criação.
 */

export interface RespostaAnimalDTO {
  id: string;
  userId: string;
  nome: string;
  idade: number;
  sexo: Sexo;
  especie: Especie;
  raca: string | null;
  cor: string | null;
  foto: string | null;
  descricao: string | null;
  localizacao: string | null;
  status: StatusAnimal;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DTOs DE USUÁRIOS
// ============================================

export interface CriarUsuarioDTO {
  email: string;
  senha: string;
  nome: string;
  cpf: string;
  telefone?: string;
}

export interface AtualizarUsuarioDTO {
  nome?: string;
  cpf?: string;
  telefone?: string;
  avatar?: string;
}

export interface RespostaUsuarioDTO {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  avatar?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

// ============================================
// DTOs DE AUTENTICAÇÃO
// ============================================

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface RegistroDTO {
  email: string;
  senha: string;
  nome: string;
  cpf: string;
  telefone?: string;
}

export interface RespostaAutenticacaoDTO {
  usuario: RespostaUsuarioDTO;
  // Cookie de sessão é enviado automaticamente pelo servidor
}

// ============================================
// DTOs DE ADOÇÕES
// ============================================

export interface CriarAdocaoDTO {
  idAnimal: string;
  observacoes?: string;
}

export interface AtualizarAdocaoDTO {
  status?: StatusAdocao;
  observacoes?: string;
}

export interface RespostaAdocaoDTO {
  id: string;
  petId: string;
  userId: string;
  status: StatusAdocao;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  // Relacionamentos populados
  pet?: RespostaAnimalDTO;
  user?: RespostaUsuarioDTO;
}

// ============================================
// DTOs DE ANIMAIS PERDIDOS
// ============================================

// Espelha o CreateLostPetDto do backend. Como o ValidationPipe global usa
// forbidNonWhitelisted, campos fora desta lista (ex.: urlImagem) resultam em
// 400 — o nome do campo de foto no banco/DTO é `foto`.
export interface CriarAnimalPerdidoDTO {
  nome: string;
  especie: Especie;
  sexo?: SexoPetPerdido;
  raca?: string;
  cor?: string;
  localizacao: string;
  /** Serializada em ISO 8601: o backend valida com @Type(() => Date) + @IsDate. */
  dataUltimaVez: string;
  descricao?: string;
  /** Arquivo da foto: o POST /lost-pets é multipart e monta a URL no backend. */
  foto?: File | null;
  encontrado?: boolean;
  nomeContato: string;
  telefoneContato: string;
  emailContato: string;
  userId: string;
}

/**
 * O PATCH continua em JSON e não aceita foto: o UpdateLostPetDto não declara
 * `foto` (nem lembra o @UseInterceptors do POST), então enviá-lo resultaria em
 * 400 por causa do forbidNonWhitelisted. Quem altera a foto é o POST.
 */
export interface AtualizarAnimalPerdidoDTO {
  nome?: string;
  especie?: Especie;
  sexo?: SexoPetPerdido;
  raca?: string;
  cor?: string;
  localizacao?: string;
  dataUltimaVez?: string;
  descricao?: string;
  encontrado?: boolean;
  nomeContato?: string;
  telefoneContato?: string;
  emailContato?: string;
}

export interface RespostaAnimalPerdidoDTO {
  id: string;
  userId: string;
  nome: string;
  especie: Especie;
  sexo: SexoPetPerdido | null;
  raca: string | null;
  cor: string | null;
  localizacao: string;
  dataUltimaVez: string;
  descricao: string | null;
  foto: string | null;
  encontrado: boolean;
  nomeContato: string;
  telefoneContato: string;
  emailContato: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string | null;
  };
}

// ============================================
// DTOs DE DASHBOARD
// ============================================

export interface EstatisticasDashboardDTO {
  totalAnimais: number;
  animaisDisponiveis: number;
  adocoesEmAndamento: number;
  adocoesConcluidas: number;
  animaisPerdidosRegistrados: number;
  animaisPerdidosEncontrados: number;
}

// ============================================
// ALIASES EM INGLÊS (para compatibilidade com código existente)
// ============================================

// Animais
export type CreateAnimalDTO = CriarAnimalDTO;
export type UpdateAnimalDTO = AtualizarAnimalDTO;
export type AnimalResponseDTO = RespostaAnimalDTO;

// Usuários
export type CreateUserDTO = CriarUsuarioDTO;
export type UpdateUserDTO = AtualizarUsuarioDTO;
export type UserResponseDTO = RespostaUsuarioDTO;

// Autenticação
export type RegisterDTO = RegistroDTO;
export type AuthResponseDTO = RespostaAutenticacaoDTO;

// Adoções
export type CreateAdoptionDTO = CriarAdocaoDTO;
export type UpdateAdoptionDTO = AtualizarAdocaoDTO;
export type AdoptionResponseDTO = RespostaAdocaoDTO;

// Animais Perdidos
export type CreateLostPetDTO = CriarAnimalPerdidoDTO;
export type UpdateLostPetDTO = AtualizarAnimalPerdidoDTO;
export type LostPetResponseDTO = RespostaAnimalPerdidoDTO;

// Dashboard
export type DashboardStatsDTO = EstatisticasDashboardDTO;

