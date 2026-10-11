import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "../__root";

import { AnimalDetailPage } from "@/features/animals/AnimalDetailPage";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/animais/$id",
  component: AnimalDetailPage,
});