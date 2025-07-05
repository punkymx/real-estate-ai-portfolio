Authentication Implementation with NextAuth.js
This section details the setup and integration of user authentication into the Next.js application using NextAuth.js, covering both backend API routes and frontend UI components.

1. Objective
Implement a robust authentication system to secure API routes and control user access.

Provide a user-friendly sign-in interface.

Display user session status in the application's header.

2. Key Technologies & Techniques
NextAuth.js: The primary authentication library for Next.js applications.

@auth/prisma-adapter: Official adapter for NextAuth.js to persist user and session data in a Prisma-managed database (SQLite in this case).

bcryptjs: Used for securely hashing and comparing user passwords.

Prisma ORM: Database toolkit for defining User, Account, Session, and VerificationToken models.

Next.js App Router API Routes: Special dynamic routes (/api/auth/[...nextauth]/route.js) to handle authentication flows.

Next.js Client Components: ('use client') for interactive UI elements (SignInPage, Header).

React Context: Used internally by SessionProvider to manage and provide session data across the React component tree.

3. Backend Setup: NextAuth.js API Route (src/app/api/auth/[...nextauth]/route.js)
This file acts as the central handler for all authentication-related requests (sign-in, sign-out, session checks).

Path: src/app/api/auth/[...nextauth]/route.js

Configuration (authOptions):

adapter: PrismaAdapter(prisma): Connects NextAuth.js to your Prisma database for storing user and session information.

providers: [CredentialsProvider]: Configured to allow sign-in with email and password.

The authorize callback handles user lookup (prisma.user.findUnique) and password verification (bcrypt.compare). It returns a user object on success or null on failure.

Includes error logging within the authorize callback for debugging purposes.

session: { strategy: "jwt" }: Configures NextAuth.js to use JSON Web Tokens (JWTs) for session management, which is stateless and scalable.

callbacks: { jwt, session }: Customizes the JWT and session objects to include the user's id from the database, making it accessible in the frontend.

pages: { signIn: "/auth/signin" }: Specifies a custom sign-in page, allowing for tailored UI.

secret: process.env.NEXTAUTH_SECRET: A crucial environment variable for signing JWTs securely.

Exports: GET and POST handlers are exported from the route.js file to enable NextAuth.js's API endpoints.

4. Database Schema Update (prisma/schema.prisma)
To support NextAuth.js's database adapter, the following models were added to schema.prisma:

User: Stores user information (email, name, hashed password).

Account: Links users to external authentication providers (even for credentials, it manages provider details).

Session: Stores active user sessions.

VerificationToken: Used for email-based authentication flows (e.g., passwordless sign-in), though not actively used in the current CredentialsProvider setup.

Migration: After updating the schema, npx prisma migrate dev --name add_auth_models was executed to apply these changes to the database.

SQLite Specific Adjustments: Removed @db.Text annotations for String? fields in the Account model, as SQLite handles large text fields differently. Also, added @map to Session.sessionToken to ensure unique constraint names compatible with SQLite.

5. Environment Variable (.env.local)
NEXTAUTH_SECRET: A long, random string is required for signing JWTs. This variable must be set in .env.local and kept secret.

6. Frontend Setup
a. Session Provider Wrapper (src/components/providers/NextAuthProvider.js)
To resolve the React Context is unavailable in Server Components error when using SessionProvider in layout.js, a dedicated client component wrapper was created.

Path: src/components/providers/NextAuthProvider.js

Purpose: This 'use client' component simply wraps the SessionProvider from next-auth/react, making the session context available to its children without forcing layout.js to be a client component.

b. Root Layout Integration (src/app/layout.js)
The application's root layout was updated to include the NextAuthProvider wrapper.

Path: src/app/layout.js

Integration: The NextAuthProvider component is imported and used to wrap the {children} prop, ensuring all pages within the application have access to the authentication session. Existing font configurations (Geist, Geist_Mono) were preserved.

c. Custom Sign-in Page (src/app/auth/signin/page.js)
A custom sign-in page was created to provide a dedicated UI for user authentication.

Path: src/app/auth/signin/page.js

Functionality:

Uses useState to manage email and password input fields.

Utilizes signIn function from next-auth/react with the 'credentials' provider.

Handles successful sign-in by redirecting to /properties using useRouter.

Displays error messages (CredentialsSignin) for invalid login attempts.

d. Application Header (src/components/Header.js)
A new header component was created to display the user's authentication status and provide navigation.

Path: src/components/Header.js

Functionality:

Uses useSession() from next-auth/react to access the current session data and status.

Conditionally renders UI elements based on authentication status:

"Loading..." during session check.

"Welcome, [User Name/Email]!" and a "Sign Out" button if authenticated.

A "Sign In" button if unauthenticated.

The "Create Property" link (/properties/create) is now only visible when the user is authenticated.

The "Sign Out" button calls signOut() to end the user's session and redirect them to the home page.

7. Testing and Verification
Database User: A test user was manually created in Prisma Studio (npx prisma studio) with a securely hashed password (bcrypt.hashSync).

Login Flow: Tested by navigating to /auth/signin, entering valid credentials, and verifying redirection to /properties with the updated header showing user information.

Logout Flow: Tested by clicking the "Sign Out" button and verifying redirection to the home page and the header reverting to the "Sign In" state.

Error Handling: Verified that invalid credentials result in a CredentialsSignin error on the sign-in page.