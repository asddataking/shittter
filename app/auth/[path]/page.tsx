import Link from "next/link";
import { AuthView } from "@neondatabase/auth/react";

// Pre-render sign-in, sign-up, forgot-password, reset-password
export function generateStaticParams() {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "forgot-password" },
    { path: "reset-password" },
    { path: "email-otp" },
    { path: "magic-link" },
  ];
}

export const dynamicParams = true;

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-14 left-4 inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-lg border border-slate-200 p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Shittter</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {path === "sign-in" && "Sign in to your account"}
              {path === "sign-up" && "Create an account to save preferences"}
              {path === "forgot-password" && "Reset your password"}
              {path === "reset-password" && "Set a new password"}
              {!["sign-in", "sign-up", "forgot-password", "reset-password"].includes(path) && "Account"}
            </p>
          </div>
          <AuthView path={path} />
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          Posting is anonymous — no account needed.{" "}
          <Link href="/" className="text-sky-600 hover:underline">
            Browse restrooms
          </Link>
        </p>
      </div>
    </main>
  );
}
