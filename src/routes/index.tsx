import { createRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/home/HomePage";
import { Route as RootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: HomePage,
});