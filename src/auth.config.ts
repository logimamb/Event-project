import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        // Add your credentials logic here
        return null
      },
    }),
  ],
  // pages: {
  //   signIn: '/[locale]/auth/signin',
  //   error: '/[locale]/auth/error'
  // },
  pages: {
    signIn: '/:locale/auth/signin',
    error: '/:locale/auth/error'
  }
} satisfies NextAuthConfig
