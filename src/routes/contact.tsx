import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import ContactPage from "../pages/contact";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});
