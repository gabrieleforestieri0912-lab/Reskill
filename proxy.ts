import { auth } from "@/app/auth"
import { NextResponse } from "next/server"

const protectedPages = ["/dashboard", "/feed", "/account", "/connections", "/feedback"]
const authPages = ["/login"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Redirect logged-in users away from auth pages
  if (authPages.some((r) => pathname.startsWith(r)) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Protect authenticated pages
  if (protectedPages.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/feed/:path*", "/account/:path*", "/connections/:path*", "/feedback/:path*", "/login"],
}
