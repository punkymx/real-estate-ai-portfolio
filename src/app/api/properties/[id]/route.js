// src/app/api/properties/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Handler for GET requests to /api/properties/[id]
export async function GET(request, { params }) {
  // FIX: Await params before destructuring its properties
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
  // FIX: Await params before destructuring its properties
  const { id } = await params;
  const body = await request.json();
  const { images, ...propertyData } = body;

  try {
    if (images !== undefined) {
      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: id },
      data: {
        ...propertyData,
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
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Property not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating property', error: error.message }, { status: 500 });
  }
}

// Handler for DELETE requests to /api/properties/[id] (Delete Property)
export async function DELETE(request, { params }) {
  // FIX: Await params before destructuring its properties
  const { id } = await params;

  try {
    const deletedProperty = await prisma.property.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting property with ID ${id}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Property not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting property', error: error.message }, { status: 500 });
  }
}