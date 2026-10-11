import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "../__root";
import { LostPetRegisterPage } from "@/features/lostPets/LostPetRegisterPage";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/perdidos/cadastrar",
  beforeLoad: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/perdidos/cadastrar",
        },
      });
    }
  },
  component: LostPetRegisterPage,
});