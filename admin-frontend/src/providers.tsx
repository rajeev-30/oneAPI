"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store, persistor } from "@/store";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="bottom-right" toastOptions={{ style: { background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: "13px" } }} />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
