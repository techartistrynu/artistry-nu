// /app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findOrCreateUser } from "@/lib/firebase/api/accounts";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase/client";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const ADMIN_CREDENTIALS = {
          email: process.env.ADMIN_EMAIL || "admin@example.com",
          password: process.env.ADMIN_PASSWORD || "admin123",
        };

        if (
          credentials?.email === ADMIN_CREDENTIALS.email &&
          credentials?.password === ADMIN_CREDENTIALS.password
        ) {
         
          return {
            id: "admin-1",
            name: "Admin",
            email: ADMIN_CREDENTIALS.email,
            role: "admin",
          };
        }

        return null;
      },
    }),
  ],

  // 🔥 NO adapter used
  callbacks: {
    async signIn({ user, account }: { user: any, account: any }) {
      if (account?.provider === "google") {
        await findOrCreateUser(user);
        const idToken = account.id_token;
        if (idToken && typeof window !== "undefined") {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(firebaseAuth, credential);
        }
      }

      return account?.provider === "google" || user.id === "admin-1";
    },

    async jwt({ token, user, account }) {
      // Persist role in token
      if (user) {
        token.role = user.role ?? "user";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
