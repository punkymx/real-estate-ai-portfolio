// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Authorize: Missing email or password credentials.");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.hashedPassword) {
            console.log(`Authorize: User not found or no hashed password for email: ${credentials.email}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

          if (isPasswordValid) {
            console.log(`Authorize: User ${user.email} signed in successfully.`);
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role, // <-- Ensure user.role is included here from Prisma
            };
          } else {
            console.log(`Authorize: Invalid password for user: ${credentials.email}`);
            return null;
          }
        } catch (error) {
          console.error("Authorize Callback Error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      // The `user` object is only available the first time `jwt` is called
      // (i.e., after a successful sign-in).
      if (user) {
        token.id = user.id;
        token.role = user.role; // <-- CRITICAL: Add role from the user object to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      // The `session` object is the one available in `useSession` or `getSession`
      // Add user ID and role from token to the session
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role; // <-- CRITICAL: Add role from the token to the session object
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
