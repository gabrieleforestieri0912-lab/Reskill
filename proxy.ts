import { NextResponse } from "next/server";

export function proxy(request: Request) {
  // Gestione preflight CORS (richieste OPTIONS) per tutte le rotte API
  if (request.method === "OPTIONS") {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-extension-token",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
