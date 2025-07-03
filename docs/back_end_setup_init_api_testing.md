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

____________________________________________________________________________________________

API Testing Documentation: PUT and DELETE Operations (Postman)
These instructions detail how to test the property update and deletion endpoints using Postman, assuming your Next.js server is running (npm run dev).

1. Testing the DELETE Operation (Delete a Property)
This operation removes a specific property from the database, identified by its unique ID.

HTTP Method: DELETE

Endpoint URL: http://localhost:3000/api/properties/[PROPERTY_ID]

Important: You must replace [PROPERTY_ID] with the actual ID of an existing property in your database. You can obtain this ID by making a GET request to http://localhost:3000/api/properties and copying the id from one of the properties in the response.

Example URL: http://localhost:3000/api/properties/957163bc-d10d-422c-aea3-37780694f0ad

Request Body:

No request body is required. Ensure the "Body" option in Postman is set to "none" or empty.

Headers:

No special headers are required beyond those Postman adds by default.

Steps in Postman:

Open Postman.

Create a new request.

Select the DELETE method.

Paste the endpoint URL, replacing [PROPERTY_ID] with a valid ID.

Ensure the "Body" tab is configured as "none".

Click "Send".

Expected Result:

Status Code: 204 No Content.

Response Body: Empty.

Additional Verification:

After performing the DELETE, make a GET request to http://localhost:3000/api/properties. The property you just deleted should no longer appear in the list.

2. Testing the PUT Operation (Update a Property)
This operation updates the data of an existing property in the database, identified by its unique ID. You can update one or more fields, including the gallery images.

HTTP Method: PUT

Endpoint URL: http://localhost:3000/api/properties/[PROPERTY_ID]

Important: You must replace [PROPERTY_ID] with the actual ID of the property you wish to update. Obtain this ID from a previous GET request.

Example URL: http://localhost:3000/api/properties/957163bc-d10d-422c-aea3-37780694f0ad

Request Body:

Select the raw option and JSON type.

Send a JSON object containing only the property fields you wish to update.

For gallery images (images):

If you do not include the images field in the PUT request body, the property's existing images will not be modified.

If you include images: [] (an empty array), all associated images for that property will be deleted, and no new ones will be created.

If you include images with an array of { "url": "your_new_url" } objects, the backend will delete all existing images and create the new ones you provided in the array.

Example JSON Body for PUT (Update Title, Price, and ALL Images):

JSON

{
  "title": "UPDATED Colonial Residence on Paseo Montejo",
  "price": 550000,
  "location": "Paseo Montejo, Mérida",
  "description": "An architectural gem with history and all modern amenities on Mérida's most emblematic avenue. Now with new photos!",
  "furnished": true,
  "images": [
    { "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/image1.jpg" },
    { "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/image2.jpg" },
    { "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1/image3.jpg" }
  ]
}
Example JSON Body for PUT (Only Update Title and Price, without touching Images):

JSON

{
  "title": "Colonial Residence - Price Adjusted",
  "price": 525000
}
Steps in Postman:

Open Postman.

Create a new request.

Select the PUT method.

Paste the endpoint URL, replacing [PROPERTY_ID] with a valid ID.

Go to the "Body" tab, select raw and choose JSON from the dropdown.

Paste the JSON body with the fields you want to update.

Click "Send".

Expected Result:

Status Code: 200 OK.

Response Body: A JSON object representing the updated property, including images if you modified them.

Additional Verification:

After performing the PUT, make a GET request to http://localhost:3000/api/properties to confirm that the changes are reflected in the list of properties.

If you updated the images, verify that the new URLs appear in the GET response.

How to Update Your Image URLs to Cloudinary:
Upload your images to Cloudinary: If you haven't already, upload your property images to your Cloudinary account. Cloudinary will provide you with a public URL for each image (e.g., https://res.cloudinary.com/your-cloud-name/image/upload/v12345/your-image-id.jpg).

Use these URLs in your POST and PUT requests: When creating a new property or updating an existing one, use the Cloudinary URLs in the main image field and in the images array for the gallery in your Postman JSON.