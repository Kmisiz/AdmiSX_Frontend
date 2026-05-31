import { createRoute, redirect } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import NotificationDetailPage from "../pages/notificationDetail";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/notifications/$id",
  component: NotificationDetailPage,
  beforeLoad: () => {
    if (!localStorage.getItem("candidate_token")) {
      throw redirect({ to: "/", replace: true });
    }
  },
});
