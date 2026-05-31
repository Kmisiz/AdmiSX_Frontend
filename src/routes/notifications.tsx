import { createRoute, redirect } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import NotificationsPage from "../pages/notifications";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/notifications",
  component: NotificationsPage,
  beforeLoad: () => {
    if (!localStorage.getItem("candidate_token")) {
      throw redirect({ to: "/", replace: true });
    }
  },
});
