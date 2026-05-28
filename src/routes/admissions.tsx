import { createRoute, redirect } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import AdmissionsPage from "../pages/admissions";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/admissions",
  component: AdmissionsPage,
  beforeLoad: () => {
    if (!localStorage.getItem("candidate_token")) {
      throw redirect({ to: "/", replace: true });
    }
  },
});
