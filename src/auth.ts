import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: process.env.NODE_ENV === "development" ? false : false,
})
