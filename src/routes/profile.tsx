import { createRoute, redirect } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import ProfilePage from "../pages/profile";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/profile",
  component: ProfilePage,
  beforeLoad: () => {
    if (!localStorage.getItem("candidate_token")) {
      throw redirect({ to: "/", replace: true });
    }
  },
});
