// /app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findOrCreateUser } from "@/lib/firebase/api/accounts";
import { verifyAdminCredentials } from "@/lib/firebase/api/admin";
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
        console.log("Authorize called with credentials:", { email: credentials?.email, password: "***" })
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null;
        }

        try {
          console.log("Verifying admin credentials...")
          const admin = await verifyAdminCredentials(credentials.email, credentials.password);
          
          if (admin) {
            console.log("Admin verified successfully:", { id: admin.id, email: admin.email, role: admin.role })
            return {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              role: admin.role,
            };
          } else {
            console.log("Admin verification failed - no admin found")
          }
        } catch (error) {
          console.error("Admin authentication error:", error);
        }

        console.log("Returning null - authentication failed")
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

      return account?.provider === "google" || user.role === "admin" || user.role === "super-admin";
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

    async redirect({ url, baseUrl }) {
      // Handle admin redirects
      if (url.startsWith('/admin/')) {
        return url;
      }
      // Handle relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Handle external URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },

  pages: {
    signIn: "/admin/login",
    signOut: "/",
    error: "/admin/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
