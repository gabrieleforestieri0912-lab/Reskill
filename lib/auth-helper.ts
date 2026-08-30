import { auth } from "@/app/auth";
import { getEmailFromToken } from "@/lib/verify-codes";
import { getEmailFromCredential } from "@/lib/credentials";

/**
 * Returns the authenticated user's email, or null if not authenticated.
 * Checks NextAuth session first, then falls back to extension token
 * (x-extension-token) and finally API key / MCP token (x-api-key).
 */
export async function getUserEmailOrNull(req?: Request): Promise<string | null> {
  const session = await auth();
  if (session?.user?.email) return session.user.email;

  if (req) {
    const token = req.headers.get("x-extension-token");
    if (token) {
      const email = await getEmailFromToken(token);
      if (email) return email;
    }

    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      const email = await getEmailFromCredential(apiKey);
      if (email) return email;
    }
  }

  return null;
}

/**
 * Returns the authenticated user's email, or "ospite" as fallback.
 * Kept for backward compatibility with existing API routes.
 */
export async function getUserEmail(req?: Request): Promise<string> {
  return (await getUserEmailOrNull(req)) ?? "ospite";
}
