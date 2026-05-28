import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import Dashboard from "../pages/index";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});
