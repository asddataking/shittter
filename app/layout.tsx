import type { Metadata } from "next";
import { authClient } from "@/lib/auth/client";
import {
  NeonAuthUIProvider,
  UserButton,
  SignedOut,
} from "@neondatabase/auth/react";
import Link from "next/link";
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
        <NeonAuthUIProvider
          authClient={authClient}
          redirectTo="/account/settings"
          emailOTP
          credentials={{ forgotPassword: true }}
          signUp={{ fields: ["name"] }}
        >
          {/* Auth header: UserButton when signed in, Sign in/Sign up when signed out */}
          <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
            <UserButton size="icon" />
            <SignedOut>
              <Link
                href="/auth/sign-in"
                className="rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-200"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
              >
                Sign up
              </Link>
            </SignedOut>
          </div>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
