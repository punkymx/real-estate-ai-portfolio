Project: Real Estate AI Portfolio - Backend Setup & Initial API Testing

This document outlines the troubleshooting process for establishing the backend API with Next.js (App Router), Prisma ORM, and a database, focusing on common pitfalls encountered during initial setup and API testing.

1. Initial Setup & Common Pitfalls

Objective: To set up a Next.js App Router API for real estate properties (CRUD operations) and connect it to a database via Prisma.

Key Technologies: Next.js (App Router), Prisma ORM, Database (e.g., PostgreSQL, SQLite), Postman (API Testing Tool).

2. Core Problem: Module Resolution & Prisma Client Generation

The primary and most persistent issue was Module not found: Can't resolve '@/src/generated/prisma'. This is a classic Dependency Resolution Error or Module Not Found Error.

Initial Diagnosis: The application (Next.js/Webpack) was unable to locate the generated Prisma Client library. This typically occurs due to:

Incorrect path configuration.

Prisma Client not being generated or generated in an unexpected location.

Issues with alias resolution in jsconfig.json (for JavaScript projects) or tsconfig.json (for TypeScript projects).

Troubleshooting Steps (Module Resolution):

Prisma Client Output Path (schema.prisma):

Problem Identification: Initially, the generator client block in prisma/schema.prisma was configured with output = "./src/generated/prisma". This path is relative to schema.prisma itself (which is inside prisma/), leading to the client being generated at project-root/prisma/src/generated/prisma.

Resolution Attempt 1 (Custom Path): We attempted to correct this by setting output = "../src/generated/prisma" in prisma/schema.prisma. This tells Prisma to go up one level (out of prisma/) and then into src/generated/prisma, matching the intended project structure.

Outcome: While npx prisma generate confirmed generation to the correct logical path, the "Module not found" error persisted, indicating a deeper resolution challenge within the Next.js/Webpack compilation pipeline for this specific custom path.

jsconfig.json Alias Configuration:

Problem Identification: For custom paths and non-relative imports (like @/src/...), a Path Alias needs to be configured in jsconfig.json (for JS projects).

Resolution: Ensured the jsconfig.json at the project root was correctly set up:

JSON

{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
Outcome: The alias itself was correct, but still failed to resolve the custom Prisma path effectively.

Return to Default Prisma Client Generation (Recommended Solution):

Problem Identification: The custom output path, despite correct configuration, proved problematic for module resolution within the Next.js environment.

Resolution: The most robust approach is to leverage Prisma's default client generation location.

prisma/schema.prisma: Removed or commented out the output line from the generator client block. This defaults the output to node_modules/@prisma/client.

Code snippet

generator client {
  provider = "prisma-client-js"
  // output   = "../src/generated/prisma" // REMOVED/COMMENTED OUT
}
API Route (src/app/api/properties/route.js): Updated the import statement to reflect the default location.

JavaScript

import { PrismaClient } from '@prisma/client'; // Changed from '@/src/generated/prisma'
Outcome: This successfully resolved the Module not found error, confirming the generation and import paths were now in sync with standard practices.

3. API Endpoint Definition (Next.js App Router)

Objective: Ensure Next.js correctly identifies and exposes the API routes.

Key Concept: Next.js App Router relies on File-System Based Routing.

Problem Identification: API functions (GET, POST, etc.) were not located in the exact required file paths (route.js).

Resolution:

Collection Route (/api/properties):

Path: src/app/api/properties/route.js

Content: Contains export async function GET() (for all properties) and export async function POST() (for creating a new property).

Resource Route (/api/properties/[id]):

Path: src/app/api/properties/[id]/route.js (Note the [id] dynamic segment folder).

Content: Contains export async function GET(request, { params }) (for a single property by ID).

Outcome: Correctly exposed API endpoints for the client-side to consume.

4. Database Schema & Migration (Database Testing / ORM Usage)

Objective: Ensure the database has the necessary tables and columns defined in schema.prisma.

Key Concept: Database Migrations (Prisma Migrate) are used to synchronize your Prisma schema with your database.

Problem Identification: Error [PrismaClientKnownRequestError]: The table 'main.Property' does not exist in the current database. (code: 'P2021'). This is a common Database Schema Mismatch error.

Resolution:

Command: Executed npx prisma migrate dev --name init.

Purpose: This command compares your schema.prisma with your database and generates SQL migrations to create/update tables. The --name init provides an initial name for the migration.

Outcome: The database tables (Property, PropertyImage) were successfully created, resolving database-related errors during GET and POST operations.

5. Data Payload Validation (API Testing / Data Formatting)

Objective: Ensure the data sent from the client (Postman) matches the expected format for Prisma's ORM operations.

Key Concept: Nested Writes in Prisma allow creating related records (e.g., PropertyImages when creating a Property) in a single operation.

Problem Identification: PrismaClientValidationError: Argument 'url': Invalid value provided. Expected String, provided Object.

The POST request body for images was: [ { "url": "string" }, { "url": "string" } ].

The initial route.js code incorrectly used .map(url => ({ url: url })) on this array, trying to transform it into [ { url: { url: "string" } }, ... ]. Prisma expected { url: "string" }.

Resolution: Simplified the create operation to directly use the incoming images array, as its structure already matched Prisma's expectation for nested writes.

JavaScript

// src/app/api/properties/route.js
// ... inside POST function ...
images: {
  create: images, // Corrected: Direct use of the already-formatted 'images' array
},
// ...
Outcome: POST requests now successfully create properties and their associated images.

6. Final Verification (API Testing)

Tool: Postman.

POST /api/properties:

Method: POST

URL: http://localhost:3000/api/properties

Body: raw JSON (Example for reference):

JSON

{
  "title": "Residencia Colonial en Paseo Montejo",
  "price": 500000,
  "location": "Paseo Montejo, Mérida",
  "image": "https://images.example.com/property_colonial.jpg",
  "type": "Casa",
  "bedrooms": 5,
  "bathrooms": 4,
  "operation": "Venta",
  "description": "Una joya arquitectónica con historia y todas las comodidades modernas en la avenida más emblemática de Mérida.",
  "furnished": true,
  "constructionArea": "450 m²",
  "landArea": "600 m²",
  "images": [
    {"url": "https://images.example.com/property_colonial_gal1.jpg"},
    {"url": "https://images.example.com/property_colonial_gal2.jpg"}
  ]
}
Expected Result: 201 Created status code, with the newly created property data in the response body.

GET /api/properties:

Method: GET

URL: http://localhost:3000/api/properties

Body: None.

Expected Result: 200 OK status code, with an array of property objects (including nested images) in the response body.