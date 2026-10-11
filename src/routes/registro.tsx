import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";
import { RegisterPage } from "@/features/auth/RegisterPage";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/registro",
  component: RegisterPage,
});
