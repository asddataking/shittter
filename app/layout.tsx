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
      <body className="antialiased min-h-screen text-slate-900">
        <NeonAuthUIProvider authClient={authClient} redirectTo="/account/settings" emailOTP>
          {/* Floating user button */}
          <div className="fixed top-3 right-3 z-50">
            <UserButton size="icon" />
          </div>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
