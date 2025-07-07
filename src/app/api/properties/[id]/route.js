// src/app/api/properties/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth"; // Import getServerSession
import { authOptions } from "../../auth/[...nextauth]/route"; // Import authOptions (path adjusted)

const prisma = new PrismaClient();

// Handler for GET requests to /api/properties/[id]
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const property = await prisma.property.findUnique({
      where: { id: id },
      include: {
        images: true, // Include related images
      },
    });

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property, { status: 200 });
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error);
    return NextResponse.json({ message: 'Error fetching property', error: error.message }, { status: 500 });
  }
}

// Handler for PUT requests to /api/properties/[id] (Update Property)
export async function PUT(request, { params }) {
  // --- AUTHENTICATION CHECK ---
  const session = await getServerSession(authOptions); // Get the server session

  if (!session) {
    // If no session, user is not authenticated
    return NextResponse.json({ message: 'Unauthorized: You must be logged in to update a property.' }, { status: 401 });
  }
  // --- END AUTHENTICATION CHECK ---

  const { id } = await params;
  const body = await request.json();
  const { images, ...propertyData } = body;

  try {
    // If images array is provided, first delete existing images for this property
    // This ensures that only the images provided in the update request are linked
    if (images !== undefined) {
      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: id },
      data: {
        ...propertyData,
        // Ensure that price, bedrooms, bathrooms are numbers
        price: typeof propertyData.price === 'number' ? propertyData.price : parseFloat(propertyData.price),
        bedrooms: typeof propertyData.bedrooms === 'number' ? propertyData.bedrooms : parseInt(propertyData.bedrooms, 10),
        bathrooms: typeof propertyData.bathrooms === 'number' ? propertyData.bathrooms : parseInt(propertyData.bathrooms, 10),
        ...(images !== undefined && images.length > 0 && {
          images: {
            create: images,
          },
        }),
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(updatedProperty, { status: 200 });
  } catch (error) {
    console.error(`Error updating property with ID ${id}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Property not found for update' }, { status: 404 });
    }
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json({ message: 'Invalid data provided for property update.', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error updating property', error: error.message }, { status: 500 });
  }
}

// Handler for DELETE requests to /api/properties/[id] (Delete Property)
export async function DELETE(request, { params }) {
  // --- AUTHENTICATION CHECK ---
  const session = await getServerSession(authOptions); // Get the server session

  if (!session) {
    // If no session, user is not authenticated
    return NextResponse.json({ message: 'Unauthorized: You must be logged in to delete a property.' }, { status: 401 });
  }
  // --- END AUTHENTICATION CHECK ---

  const { id } = await params;

  try {
    const deletedProperty = await prisma.property.delete({
      where: { id: id },
    });

    // Return 204 No Content for successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting property with ID ${id}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'Property not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting property', error: error.message }, { status: 500 });
  }
}
// Note: Ensure you have the necessary API route set up to handle the PUT request for updating properties.