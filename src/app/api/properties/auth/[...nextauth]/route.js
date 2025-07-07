// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // For password hashing and comparison

const prisma = new PrismaClient();

// NextAuth.js configuration object
export const authOptions = {
  // 1. Configure Prisma Adapter for database sessions and user management
  adapter: PrismaAdapter(prisma),

  // 2. Configure Authentication Providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g., "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          // Add logic here to find the user from the database
          // This is where you'll connect to your Prisma user model
          if (!credentials?.email || !credentials?.password) {
            console.log("Authorize: Missing email or password credentials.");
            return null; // No credentials provided
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          // If no user or password doesn't match
          if (!user) {
            console.log(`Authorize: User not found for email: ${credentials.email}`);
            return null;
          }

          if (!user.hashedPassword) {
            console.log(`Authorize: User ${user.email} has no hashed password.`);
            return null;
          }

          // Compare provided password with hashed password in the database
          const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);

          if (isPasswordValid) {
            console.log(`Authorize: User ${user.email} signed in successfully.`);
            // Any object returned will be saved in `user` property of the JWT and Session
            return {
              id: user.id,
              name: user.name, // Or user.email if name is not available
              email: user.email,
              // You can add other user properties here if needed for the session
            };
          } else {
            console.log(`Authorize: Invalid password for user: ${credentials.email}`);
            // If you return null then an error will be displayed advising the user they could not be signed in.
            return null;
            // You can also throw an Error like `throw new Error("Invalid credentials")`
          }
        } catch (error) {
          console.error("Authorize Callback Error:", error);
          // Return null to indicate authentication failure
          return null;
        }
      }
    })
    // Add other providers here if you want (e.g., GoogleProvider)
  ],

  // 3. Configure Session Management
  session: {
    strategy: "jwt", // Use JWT for session management
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // 4. Configure JWT Callbacks (important for adding custom data to the token/session)
  callbacks: {
    async jwt({ token, user }) {
      // The `user` object is only available the first time `jwt` is called
      // (i.e., after a successful sign-in).
      if (user) {
        token.id = user.id;
        // You can add other user properties from your DB to the token here
      }
      return token;
    },
    async session({ session, token }) {
      // The `session` object is the one available in `useSession` or `getSession`
      // Add user ID from token to the session
      if (token) {
        session.user.id = token.id;
        // You can add other token properties to the session here
      }
      return session;
    }
  },

  // 5. Configure Pages (optional, but good for custom login/error pages)
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
    // Uncomment the line below if you want a custom error page.
    // Otherwise, NextAuth.js will try to redirect back to signIn with an error query param.
    // error: '/auth/error', // Error code passed in query string as ?error=
  },

  // 6. Secret for signing the JWT. Use a strong, random string.
  // In production, this should be an environment variable.
  secret: process.env.NEXTAUTH_SECRET,
};

// Export the NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
// This exports the NextAuth handler for both GET and POST requests.  