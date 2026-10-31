import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import routes from "./app/routes.tsx";
import Toaster from "./components/ui/toast.tsx";
import "./index.css";
import "./i18n";

// The app runs entirely on mock data, so the Service Worker is started in every
// environment (including the production build on Vercel), not just in dev.
async function enableMocking() {
  const { worker } = await import("./mocks/browser.ts");

  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: !import.meta.env.DEV,
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      options: { scope: import.meta.env.BASE_URL },
    },
  });
}

function render() {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={routes} />
      {/* Outside the router so toasts survive navigation and also show on
          the standalone auth screens, which render outside <Layout />. */}
      <Toaster />
    </React.StrictMode>,
  );
}

// Never block the app on the worker: if registration fails we still render.
enableMocking()
  .catch((error) => console.error("[msw] failed to start:", error))
  .finally(render);
