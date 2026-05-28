import { createRootRoute, Outlet } from "@tanstack/react-router";
import RootLayout from "../layouts/RootLayout";

export const Route = createRootRoute({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
});
