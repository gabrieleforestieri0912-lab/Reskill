import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getUserByEmail, createUserFromOAuth } from "@/models/User"
import type { DefaultSession } from "next-auth"

// Aggiunge `id` ai tipi Session.user e User di NextAuth.
// Vedi: https://authjs.dev/getting-started/typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
  }
}

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET environment variable is required in production")
}
const AUTH_SECRET = process.env.AUTH_SECRET || "skillgrowth-dev-secret-do-not-use-in-prod-2026"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await getUserByEmail(credentials.email as string)
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password as string, user.password!)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await getUserByEmail(user.email)
        if (!existing) {
          await createUserFromOAuth({
            email: user.email,
            name: user.name || "",
          })
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      session.user.email = token.email || ""
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
})
