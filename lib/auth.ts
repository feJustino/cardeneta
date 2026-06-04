import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

function getEnvOrThrow(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Variável de ambiente ${key} não configurada`)
  }
  return value
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: getEnvOrThrow("GOOGLE_CLIENT_ID"),
      clientSecret: getEnvOrThrow("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const allowedEmail = process.env.ADMIN_EMAIL
      if (!allowedEmail) return false
      return profile?.email === allowedEmail
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}
