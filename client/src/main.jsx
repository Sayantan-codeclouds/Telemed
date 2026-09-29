import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
  // Lets any query/mutation opt into a toast via `meta: { onError: (err) => ... }`
  // or `meta: { errorMessage: "..." }`, instead of repeating boilerplate per hook.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.onError) query.meta.onError(error);
      else if (query.meta?.errorMessage) toast.error(query.meta.errorMessage);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.onError) mutation.meta.onError(error);
      else if (mutation.meta?.errorMessage) toast.error(mutation.meta.errorMessage);
    },
  }),
});

/**
 * Global avatar fallback safety net.
 *
 * Uploaded profile images live on the API server's local disk, so a stored
 * filename can outlive the file itself (an ephemeral filesystem wipes uploads
 * on every deploy/restart). When that happens the browser renders a broken
 * image icon. `error` events don't bubble, but they do propagate during the
 * capture phase, so this single listener catches any avatar that fails to load
 * and swaps in the generated initials avatar — including images rendered by
 * components that don't wire up their own onError.
 *
 * Scoped to uploaded avatars only, so genuinely broken assets elsewhere (logos,
 * icons) still fail loudly instead of being silently papered over.
 */
document.addEventListener(
  "error",
  (event) => {
    const el = event.target;
    if (!(el instanceof HTMLImageElement)) return;
    if (!el.src.includes("/uploads/profile-images/")) return;
    if (el.dataset.avatarFallbackApplied) return;

    el.dataset.avatarFallbackApplied = "true";
    const name = encodeURIComponent(el.alt?.trim() || "User");
    el.src = `https://ui-avatars.com/api/?name=${name}&background=2563eb&color=fff&size=200`;
  },
  true // capture phase — image error events do not bubble
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>
);