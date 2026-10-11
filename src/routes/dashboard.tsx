import { createRoute, redirect } from "@tanstack/react-router";
import { Route as RootRoute } from "./__root";
import { DashboardPage } from "@/features/dashboard/DashboardPage";

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    const userStr = localStorage.getItem("user");
    
    if (!userStr) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/dashboard",
        },
      });
    }
  },
  component: DashboardPage,
});