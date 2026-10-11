import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "../__root";
import { AnimalRegisterPage } from "@/features/animals/AnimalRegisterPage";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/animais/cadastrar",
  beforeLoad: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/animais/cadastrar",
        },
      });
    }
  },
  component: AnimalRegisterPage,
});