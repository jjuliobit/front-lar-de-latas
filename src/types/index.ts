// Tipos de dados principais

// ============================================
// ENUMS E TIPOS BASE
// ============================================

// Enums do Prisma. São PascalCase porque o backend valida com @IsEnum,
// então "cachorro" ou "disponivel" em minúsculas resultam em 400.
export type Especie = "Cachorro" | "Gato" | "Passaro" | "Outro";
export type Sexo = "Macho" | "Femea";
// O schema tem um enum separado para o pet perdido, mas com os mesmos valores.
export type SexoPetPerdido = "Macho" | "Femea";
export type StatusPet = "Disponivel" | "EmProcesso" | "Adotado" | "Indisponivel";
export type StatusAdocao = "Enviado" | "Analisando" | "Aprovado" | "Rejeitado" | "Concluido";

// Alias legado do enum de status do pet.
export type StatusAnimal = StatusPet;

// O enum Sexo do usuário é outro: 'Feminino' | 'Masculino'.
export type SexoUsuario = "Feminino" | "Masculino";

// Aliases em inglês para compatibilidade com código existente
export type Species = Especie;
export type Sex = Sexo;
export type AnimalStatus = StatusAnimal;
export type AdoptionStatus = StatusAdocao;

// Re-exportar todos os DTOs
export * from "./dtos";

// ============================================
// INTERFACES DE ENTIDADES
// ============================================

// Espelha o model Pet do Prisma. Os nomes são os do banco porque é isso
// que GET /api/pet devolve — sem camada de tradução no service.
export interface Animal {
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
  status: StatusPet;
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  avatar?: string;
  criadoEm: string;
}

export interface Adocao {
  id: string;
  petId: string;
  userId: string;
  status: StatusAdocao;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Espelha o model LostPet do Prisma. Sem camada de tradução: é isso que
// GET /lost-pets devolve (findAll inclui o `user` do anunciante).
export interface AnimalPerdido {
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
  /** Populado apenas pelo findAll. */
  user?: {
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string | null;
  };
}

// ============================================
// FILTROS
// ============================================

export interface FiltrosAnimal {
  busca?: string;
  especie?: Especie | "todos";
  idadeMinima?: number;
  idadeMaxima?: number;
  sexo?: Sexo | "todos";
  localizacao?: string;
  status?: StatusPet | "todos";
}

export interface FiltrosAnimalPerdido {
  busca?: string;
  especie?: Especie | "todos";
  localizacao?: string;
}

// ============================================
// PAGINAÇÃO (PaginationQueryDto do PetController)
// ============================================

export interface PetMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Parâmetros aceitos por GET /api/pet */
export interface PaginacaoParams {
  page?: number;
  /** O backend valida @Min(1) @Max(100); o default dele é 10. */
  limit?: number;
}

/** Retorno paginado de GET /api/pet */
export interface PaginatedPets {
  data: Animal[];
  meta: PetMeta;
}

export interface EstatisticasDashboard {
  totalAnimais: number;
  adocoesEmAndamento: number;
  adocoesConcluidas: number;
  animaisPerdidosRegistrados: number;
}

// ============================================
// ALIASES EM INGLÊS (para compatibilidade com código existente)
// ============================================

export type User = Usuario;
export type Adoption = Adocao;
export type LostPet = AnimalPerdido;
export type AnimalFilters = FiltrosAnimal;
export type LostPetFilters = FiltrosAnimalPerdido;
export type DashboardStats = EstatisticasDashboard;
