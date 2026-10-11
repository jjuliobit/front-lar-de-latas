import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "../__root";
import { LostPetsListPage } from "@/features/lostPets/LostPetsListPage";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/perdidos/",
  component: LostPetsListPage,
});