/**
 * Base URL for canonical links and JSON-LD. Prefer VERCEL_URL in production.
 */
export function getBaseUrl(): string {
  if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "https://shittter.vercel.app";
}
