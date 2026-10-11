import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";
import { AdoptionsPage } from "@/features/adoptions/AdoptionsPage";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/adocoes",
  beforeLoad: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/adocoes",
        },
      });
    }
  },
  component: AdoptionsPage,
});