import { createRoute, redirect } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import UploadGuidePage from "../pages/uploadGuide";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/upload-guide",
  component: UploadGuidePage,
  beforeLoad: () => {
    if (!localStorage.getItem("candidate_token")) {
      throw redirect({ to: "/", replace: true });
    }
  },
});
