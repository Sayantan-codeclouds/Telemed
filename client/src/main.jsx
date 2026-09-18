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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>
);