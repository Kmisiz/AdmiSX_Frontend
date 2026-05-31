import { createRoute, redirect } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import DocumentsPage from "../pages/documents";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/documents",
  component: DocumentsPage,
  beforeLoad: () => {
    if (!localStorage.getItem("candidate_token")) {
      throw redirect({ to: "/", replace: true });
    }
  },
});
