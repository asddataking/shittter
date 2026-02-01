import { createAuthServer, neonAuth } from "@neondatabase/auth/next/server";

// Server-side auth client for Server Components, Server Actions, Route Handlers
export const authServer = createAuthServer();

// Utility to get session in Server Components
export { neonAuth };
