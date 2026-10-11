import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "../__root";
import { LostPetEditPage } from "@/features/lostPets/LostPetEditPage";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/perdidos/editar/$petId",
  beforeLoad: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/perdidos",
        },
      });
    }
  },
  component: LostPetEditPage,
});