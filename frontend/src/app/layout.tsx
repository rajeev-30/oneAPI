import type { Metadata } from "next";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "oneAPI — The Unified API for AI Models",
  description:
    "Access multiple AI models through a single API. Manage keys, track usage, compare pricing, and build with any LLM provider.",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ReduxProvider>
          <QueryProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border-primary)",
                  color: "var(--color-text-primary)",
                  fontSize: "13px",
                },
              }}
            />
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
