"use client";

import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useLogout, useReceivedAdoptions } from "@/hooks";
import type { SessionUser } from "@/services/auth.service";

interface NavbarProps {
  isAuthenticated?: boolean;
  user?: SessionUser | null;
}

export function Navbar({ isAuthenticated = false, user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const logoutMutation = useLogout();

  // Buscar adoções recebidas para mostrar badge de notificação
  const { data: receivedAdoptions } = useReceivedAdoptions();
  const pendingAdoptionsCount = receivedAdoptions?.filter(
    (adoption) => ["Enviado", "Analisando"].includes(adoption.status)
  ).length ?? 0;

  // O login só devolve um payload parcial; o nome completo vem de /auth/me
  const fullName = user
    ? [user.nome, user.sobrenome].filter(Boolean).join(" ").trim() || undefined
    : undefined;

  const publicMenuItems = [
    { label: "Início", path: "/" },
    { label: "Animais", path: "/animais" },
    { label: "Perdidos", path: "/perdidos" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <HeroNavbar
      maxWidth="xl"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="bg-white border-b border-gray-200"
      isBordered
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-primary"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span className="font-bold text-xl text-primary">Lar de Latas</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        {publicMenuItems.map((item) => (
          <NavbarItem key={item.path} isActive={isActive(item.path)}>
            <Link
              to={item.path}
              className={`${
                isActive(item.path)
                  ? "text-primary font-semibold"
                  : "text-gray-700 hover:text-primary"
              } transition-colors`}
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        {!isAuthenticated ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <Button
                as={Link}
                to="/login"
                variant="light"
                color="primary"
              >
                Entrar
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link}
                to="/registro"
                color="primary"
              >
                Cadastrar
              </Button>
            </NavbarItem>
          </>
        ) : (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="relative cursor-pointer">
                {pendingAdoptionsCount > 0 && (
                  <span className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white text-xs font-bold">
                    {pendingAdoptionsCount}
                  </span>
                )}
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={fullName}
                  size="sm"
                  src={user?.foto ?? undefined}
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Conectado como</p>
                <p className="font-semibold">{user?.email}</p>
              </DropdownItem>
              <DropdownItem key="dashboard" as={Link} to="/dashboard">
                Dashboard
              </DropdownItem>
              <DropdownItem key="profile_page" as={Link} to="/perfil">
                Meu Perfil
              </DropdownItem>
              <DropdownItem key="adoptions" as={Link} to="/adocoes">
                <div className="flex items-center justify-between w-full">
                  <span>Minhas Adoções</span>
                  {pendingAdoptionsCount > 0 && (
                    <span className="ml-2 bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingAdoptionsCount}
                    </span>
                  )}
                </div>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onPress={() => logoutMutation.mutate()}
                isDisabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </NavbarContent>

      <NavbarMenu>
        {publicMenuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.path}-${index}`}>
            <Link
              to={item.path}
              className={`w-full ${
                isActive(item.path) ? "text-primary font-semibold" : "text-gray-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        {!isAuthenticated ? (
          <>
            <NavbarMenuItem>
              <Link
                to="/login"
                className="w-full text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/registro"
                className="w-full text-primary font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Cadastrar
              </Link>
            </NavbarMenuItem>
          </>
        ) : (
          <>
            <NavbarMenuItem>
              <Link
                to="/dashboard"
                className="w-full text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/perfil"
                className="w-full text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Meu Perfil
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/adocoes"
                className="w-full text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Minhas Adoções
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="w-full text-left text-red-600 disabled:opacity-50"
              >
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </button>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </HeroNavbar>
  );
}
