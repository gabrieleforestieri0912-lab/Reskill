import { NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
]

export function corsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin = requestOrigin || ""
  const isExtension = origin.startsWith("chrome-extension://")
  const isAllowed = ALLOWED_ORIGINS.some((o) => origin === o) || isExtension

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,x-extension-token",
    "Access-Control-Allow-Credentials": "true",
  }

  if (isAllowed || !origin) {
    headers["Access-Control-Allow-Origin"] = origin || ALLOWED_ORIGINS[0]
  }

  return headers
}

export function handleApiOptions(request: Request) {
  const origin = request.headers.get("origin")
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  })
}
