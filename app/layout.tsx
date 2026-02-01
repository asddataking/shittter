import type { Metadata, Viewport } from "next";
import { authClient } from "@/lib/auth/client";
import {
  NeonAuthUIProvider,
  UserButton,
  SignedOut,
} from "@neondatabase/auth/react";
import Link from "next/link";
import "./globals.css";
import { getBaseUrl } from "@/lib/seo-utils";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Shittter — Find a bathroom you can trust",
  description: "Crowdsourced, anonymous, honest.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen text-slate-900 bg-slate-200 app-shell-body">
        <NeonAuthUIProvider
          authClient={authClient}
          redirectTo="/account/settings"
          emailOTP
          credentials={{ forgotPassword: true }}
          signUp={{ fields: ["name"] }}
        >
          {/* App frame: phone-width on desktop, full width on mobile */}
          <div className="app-shell w-full min-h-screen mx-auto bg-white relative">
            {/* Auth header inside app frame (centered in phone column on desktop) */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex justify-end items-center gap-2 app-shell-safe-top app-shell-safe-right">
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
          </div>
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
