Authentication Implementation with NextAuth.js
This section details the configuration and integration of user authentication into the Next.js application using NextAuth.js, covering both backend API routes and frontend UI components, including user registration and role-based authorization.

1. Objective
Implement a robust authentication system to secure API routes and control user access.

Provide user-friendly sign-in and sign-up interfaces.

Display user session status and role in the application's header.

Implement role-based authorization to restrict access to sensitive functionalities.

2. Key Technologies & Techniques
NextAuth.js: The primary authentication library for Next.js applications.

@auth/prisma-adapter: Official adapter for NextAuth.js to persist user and session data in a Prisma-managed database (SQLite in this case).

bcryptjs: Used for securely hashing and comparing user passwords during sign-in and for hashing passwords during sign-up.

Prisma ORM: Database toolkit for defining User, Account, Session, and VerificationToken models.

Next.js App Router API Routes: Special dynamic routes (/api/auth/[...nextauth]/route.js) to handle authentication flows and custom routes (/api/register/route.js, /api/admin/users/route.js, /api/admin/users/[id]/route.js) for user registration and admin management.

Next.js Client Components: ('use client') for interactive UI elements (SignInPage, SignUpPage, Header, EditPropertyPage, PropertyDetailPage, AdminUsersPage).

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

callbacks: { jwt, session }: Customizes the JWT and session objects to include the user's id and role from the database, making them accessible in the frontend.

pages: { signIn: "/auth/signin" }: Specifies a custom sign-in page, allowing for tailored UI.

secret: process.env.NEXTAUTH_SECRET: A crucial environment variable for signing JWTs securely.

Exports: GET and POST handlers are exported from the route.js file to enable NextAuth.js's API endpoints.

4. Backend Setup: User Registration API Route (src/app/api/register/route.js)
This dedicated API route handles the creation of new user accounts.

Path: src/app/api/register/route.js

Functionality (POST handler):

Receives name, email, and password from the frontend.

Performs basic validation to ensure all required fields are present.

Checks if a user with the provided email already exists to prevent duplicates.

Hashes the password using bcrypt.hash() before storing it for security.

Creates a new User record in the database using Prisma.

Returns the new user's id, name, and email upon successful creation (excluding the hashed password for security).

Includes error handling for validation failures and unique constraint violations (e.g., duplicate email).

5. Backend Setup: API Routes for User Management (src/app/api/admin/users/route.js and src/app/api/admin/users/[id]/route.js)
These API routes allow administrators to list, update, and delete users.

Route for Listing Users: src/app/api/admin/users/route.js

GET handler:

Requires the user to be authenticated and have the ADMIN role.

Returns a list of all users (excluding hashed passwords).

Includes createdAt and updatedAt for sorting and display.

Route for Managing Users by ID: src/app/api/admin/users/[id]/route.js

PUT handler:

Requires the user to be authenticated and have the ADMIN role.

Updates the role of a specific user.

Implements crucial protection: An ADMIN cannot change their own role to a non-ADMIN role.

DELETE handler:

Requires the user to be authenticated and have the ADMIN role.

Deletes a specific user from the database.

Implements crucial protection: An ADMIN cannot delete their own account.

6. Database Schema Update (prisma/schema.prisma)
To support NextAuth.js's database adapter, user roles, and timestamps, the following models were added/updated in schema.prisma:

User: Stores user information (email, name, hashed password, role, timestamps).

An enum Role (CLIENT, AGENT, ADMIN) and a role field with @default(CLIENT) were added.

createdAt (@default(now())) and updatedAt (@updatedAt) fields were added for automatic creation and last update timestamp tracking.

Account: Links users to external authentication providers.

Session: Stores active user sessions.

VerificationToken: Used for email-based authentication flows.

Migration: After updating the schema, npx prisma migrate dev --name <migration_name> was executed to apply these changes to the database. In case of issues with existing data, a complete reset of the development database was performed.

7. Environment Variable (.env.local)
NEXTAUTH_SECRET: A long, random string is required for signing JWTs. This variable must be set in .env.local and kept secret.

8. Image Optimization Configuration (next.config.mjs)
To allow the next/image component to load images from external domains, these domains must be explicitly configured.

images.remotePatterns: Used to list allowed hostnames from which images can be loaded. This is vital for Next.js image security and optimization.

Backend Validation: Additional validation was implemented in the property API routes (/api/properties and /api/properties/[id]) to verify image URLs before they are saved to the database. This prevents server errors caused by invalid or unpermitted image URLs and provides user feedback.

9. Frontend Setup
a. Session Provider Wrapper (src/components/providers/NextAuthProvider.js)
To resolve the React Context is unavailable in Server Components error when using SessionProvider in layout.js, a dedicated client component wrapper was created.

Path: src/components/providers/NextAuthProvider.js

Purpose: This 'use client' component simply wraps the SessionProvider from next-auth/react, making the session context available to its children without forcing layout.js to be a client component.

b. Root Layout Integration (src/app/layout.js)
The application's root layout was updated to include the NextAuthProvider wrapper and the Header component.

Path: src/app/layout.js

Integration: The NextAuthProvider component is imported and used to wrap the {children} prop, ensuring all pages within the application have access to the authentication session. The Header is placed before {children} to be visible on all pages.

c. Custom Sign-in Page (src/app/auth/signin/page.js)
A custom sign-in page was created to provide a dedicated UI.

Path: src/app/auth/signin/page.js

Functionality:

Uses useState to manage email and password input fields.

Utilizes signIn function from next-auth/react with the 'credentials' provider.

Handles successful sign-in by redirecting to /properties using useRouter.

Displays error messages for invalid login attempts.

Includes a "Sign Up" link to navigate to the user registration page.

d. Custom Sign-up Page (src/app/auth/signup/page.js)
A new client-side page for user registration.

Path: src/app/auth/signup/page.js

Functionality:

Uses useState for name, email, password, and confirm password inputs.

Performs client-side password matching validation.

Sends a POST request to the custom /api/register API route.

Provides user feedback (loading, success, error messages).

Upon successful registration, redirects the user to the sign-in page.

e. Application Header (src/components/Header.js)
A new header component to display the user's authentication status and provide navigation.

Path: src/components/Header.js

Functionality:

Uses useSession() from next-auth/react to access the current session data and status.

Conditionally renders UI elements based on authentication status and user role:

"Loading..." during session check.

"Welcome, [User Name/Email] ([Role])!" and a "Sign Out" button if authenticated.

A "Sign In" button if unauthenticated.

The "Create Property" link (/properties/create) is only visible when the user is authenticated and has the AGENT or ADMIN role.

The "Admin Panel" link (/admin/users) is only visible for ADMIN users.

The "Sign Out" button calls signOut() to end the user's session and redirect them to the home page.

f. Role-Protected Property Pages (src/app/properties/create/page.js, src/app/properties/[id]/edit/page.js, src/app/properties/[id]/page.js)
These frontend pages implement role verification to control visibility and access.

src/app/properties/create/page.js and src/app/properties/[id]/edit/page.js:

Use useSession() to verify the user's role.

If the user is neither AGENT nor ADMIN, they are redirected to the sign-in page or shown a "You do not have permission..." message.

src/app/properties/[id]/page.js (Property Details):

Uses useSession() to verify the user's role.

"Edit Property" and "Delete Property" buttons are only displayed if the user is AGENT or ADMIN.

g. User Management Page (src/app/admin/users/page.js)
A new client-side page for administrators to manage other users.

Path: src/app/admin/users/page.js

Functionality:

Uses useSession() to ensure only ADMIN users can access the page.

Displays a table of all registered users, including their name, email, role, creation date, and last update date.

Includes "Edit Role" and "Delete" buttons for each user.

Implements confirmation modals for deletion and an edit modal for changing a user's role.

Frontend Protection: The "Delete" button is disabled for the administrator's own account.

10. Testing and Verification
Clean Database: A complete reset of the development database was performed to ensure a consistent schema with createdAt and updatedAt fields in the User model.

User Registration Flow: Tested the registration of new users and the assignment of the default CLIENT role.

Admin Role Assignment: Verified the ability to manually assign the ADMIN role to a user via Prisma Studio.

Sign-in and Sign-out Flow: Tested signing in and out with different roles.

Frontend Route Protection by Role: Verified that access to pages like /properties/create, /properties/[id]/edit, and /admin/users is restricted based on the user's role.

UI Visibility by Role: Confirmed that links and buttons (e.g., "Create Property", "Admin Panel", "Edit/Delete Property") are correctly shown or hidden based on the user's role.

Backend API Protection by Role: Verified that POST, PUT, DELETE requests to properties and PUT, DELETE requests to users (in the admin panel) are rejected with a 403 Forbidden if the user does not have the appropriate role.

Self-Demotion/Deletion Protection: Tested that an ADMIN user cannot change their own role to a lower one or delete their own account.

11. Production Considerations: Emergency "Super Admin" Mechanism
It is crucial to have an administration access recovery mechanism that does not depend on the application's web interface. This is vital for scenarios where:

The sole ADMIN user forgets their password and there is no "forgot password" flow implemented.

The administration interface becomes corrupted due to a code or data error.

You need to create a new initial ADMIN user without going through the public registration flow.

Recommendation: For production, a command-line interface (CLI) script should be implemented to run directly on the server. This script would use Prisma Client to interact directly with the database and allow an authorized user (with server access) to perform critical operations such as:

Creating a new user with any role (including ADMIN).

Changing the role of any existing user.

Resetting any user's password.

This script acts as an emergency "master key," providing an additional layer of robustness and resilience for user management in a production environment.