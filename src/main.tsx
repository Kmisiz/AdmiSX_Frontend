import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { Route as dashboardRoute } from "./routes/dashboard";
import { Route as profileRoute } from "./routes/profile";
import { Route as admissionsRoute } from "./routes/admissions";
import { Route as documentsRoute } from "./routes/documents";
import { Route as notificationsRoute } from "./routes/notifications";
import { Route as notificationDetailRoute } from "./routes/notificationDetail";
import { Route as contactRoute } from "./routes/contact";
import { ThemeProvider } from "./components/ThemeProvider";
import { useAuthStore, initAuthFromUrl } from "./store/auth";
import { authApi } from "./apis/auth";
import "./index.css";

const loginToken = initAuthFromUrl();

if (loginToken) {
  useAuthStore.setState({
    token: loginToken,
    isAuthenticated: true,
    isLoading: true,
  });
  authApi
    .getProfile()
    .then((res) => {
      if (res.success) {
        useAuthStore.getState().setAuth(res.data, loginToken);
      }
    })
    .catch(() => {
      useAuthStore.setState({ isLoading: false });
    });
}

if (loginToken) {
  window.history.replaceState(null, "", "/dashboard");
}

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  profileRoute,
  admissionsRoute,
  documentsRoute,
  notificationsRoute,
  notificationDetailRoute,
  contactRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
