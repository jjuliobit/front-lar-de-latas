import { createRouter, createRootRoute, createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";
import { Route as IndexRoute } from "./index";
import { Route as LoginRoute } from "./login";
import { Route as RegistroRoute } from "./registro";
import { Route as AdocoesRoute } from "./adocoes";
import { Route as DashboardRoute } from "./dashboard";
import { Route as PerfilRoute } from "./perfil";
import { Route as AnimaisIndexRoute } from "./animais/index";
import { Route as AnimaisIdRoute } from "./animais/$id";
import { Route as AnimaisCadastrarRoute } from "./animais/cadastrar";
import { Route as PerdidosIndexRoute } from "./perdidos/index";
import { Route as PerdidosCadastrarRoute } from "./perdidos/cadastrar";
import { Route as PerdidosEditarRoute } from "./perdidos/editar";

const routeTree = RootRoute.addChildren([
  IndexRoute,
  LoginRoute,
  RegistroRoute,
  AdocoesRoute,
  DashboardRoute,
  PerfilRoute,
  AnimaisIndexRoute,
  AnimaisIdRoute,
  AnimaisCadastrarRoute,
  PerdidosIndexRoute,
  PerdidosCadastrarRoute,
  PerdidosEditarRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
