import { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    cpf: "123.456.789-00",
    avatar: "https://i.pravatar.cc/150?img=1",
    createdAt: "2023-12-01T10:00:00Z",
  },
  {
    id: "user2",
    name: "João Santos",
    email: "joao.santos@email.com",
    cpf: "987.654.321-00",
    avatar: "https://i.pravatar.cc/150?img=12",
    createdAt: "2023-11-15T14:30:00Z",
  },
  {
    id: "user3",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    cpf: "456.789.123-00",
    avatar: "https://i.pravatar.cc/150?img=5",
    createdAt: "2024-01-10T09:15:00Z",
  },
];

// Usuário atual mockado (simulando autenticação)
export const currentUser: User = mockUsers[0];
