import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // Allow trusting the Host header in development/docker local runs
  // In production you should ensure the host is trusted or remove this.
  trustHost: true,
  providers: [], // Configure providers in auth.ts
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
