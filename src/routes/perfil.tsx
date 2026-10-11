import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";
import { ProfilePage } from "@/features/profile/ProfilePage";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/perfil",
  beforeLoad: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/perfil",
        },
      });
    }
  },
  component: ProfilePage,
});