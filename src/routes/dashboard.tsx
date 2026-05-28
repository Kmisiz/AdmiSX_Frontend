import { createRoute, redirect } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import PrivateDashboard from "../pages/privateDashboard";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: PrivateDashboard,
  beforeLoad: () => {
    if (!localStorage.getItem("candidate_token")) {
      throw redirect({ to: "/", replace: true });
    }
  },
});
