// src/app/api/properties/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth"; // Import getServerSession
import { authOptions } from "../auth/[...nextauth]/route"; // Import authOptions

const prisma = new PrismaClient();

// Handler for GET requests to /api/properties (Fetch all properties)
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        images: true, // Include related images
      },
      orderBy: {
        createdAt: 'desc', // Order by creation date, newest first
      },
    });
    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ message: 'Error fetching properties', error: error.message }, { status: 500 });
  }
}

// Handler for POST requests to /api/properties (Create a new property)
export async function POST(request) {
  // --- AUTHENTICATION CHECK ---
  const session = await getServerSession(authOptions); // Get the server session

  if (!session) {
    // If no session, user is not authenticated
    return NextResponse.json({ message: 'Unauthorized: You must be logged in to create a property.' }, { status: 401 });
  }
  // --- END AUTHENTICATION CHECK ---

  try {
    const body = await request.json();
    const { images, ...propertyData } = body;

    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        // Ensure that price, bedrooms, bathrooms are numbers
        price: typeof propertyData.price === 'number' ? propertyData.price : parseFloat(propertyData.price),
        bedrooms: typeof propertyData.bedrooms === 'number' ? propertyData.bedrooms : parseInt(propertyData.bedrooms, 10),
        bathrooms: typeof propertyData.bathrooms === 'number' ? propertyData.bathrooms : parseInt(propertyData.bathrooms, 10),
        ...(images && images.length > 0 && {
          images: {
            create: images,
          },
        }),
      },
      include: {
        images: true, // Include related images in the response
      },
    });

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    // Handle Prisma validation errors specifically
    if (error.code === 'P2002') { // Unique constraint violation
      return NextResponse.json({ message: 'A property with this title already exists.' }, { status: 409 });
    }
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json({ message: 'Invalid data provided for property creation.', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error creating property', error: error.message }, { status: 500 });
  }
}
// Note: Ensure you have the necessary API route set up to handle the PUT request for updating properties.    