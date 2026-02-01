import type { Metadata } from "next";
import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider, UserButton } from "@neondatabase/auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shittter — Find a bathroom you can trust",
  description: "Crowdsourced, anonymous, honest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <NeonAuthUIProvider authClient={authClient} redirectTo="/account/settings" emailOTP>
          <header className="flex items-center justify-end gap-4 border-b border-slate-200 bg-white px-4 py-2">
            <UserButton size="icon" />
          </header>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
