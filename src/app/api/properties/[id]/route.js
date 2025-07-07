// src/app/api/properties/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Define los hostnames de imágenes permitidos, deben coincidir con next.config.mjs
const ALLOWED_IMAGE_HOSTNAMES = [
  'media.admagazine.com',
  'images.unsplash.com',
  'placehold.co',
  'images.example.com',
  'res.cloudinary.com',
  'www.google.com', // Asegúrate de que este dominio esté aquí si lo usas
];

// Función de ayuda para validar la URL de una imagen
function isValidImageUrl(url) {
  try {
    const urlObj = new URL(url);
    // Verifica que el protocolo sea HTTPS y que el hostname esté en la lista permitida
    return urlObj.protocol === 'https:' && ALLOWED_IMAGE_HOSTNAMES.includes(urlObj.hostname);
  } catch (e) {
    // Si la URL no es válida (ej. mal formada), el constructor de URL lanzará un error
    return false;
  }
}

// Handler for GET requests to /api/properties/[id]
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const property = await prisma.property.findUnique({
      where: { id: id },
      include: {
        images: true,
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
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'AGENT' && session.user?.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'Unauthorized: You do not have permission to update a property.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { images, ...propertyData } = body;

  try {
    // --- NEW: Image URL Validation ---
    if (!isValidImageUrl(propertyData.image)) {
      return NextResponse.json({ message: 'Invalid main image URL. Hostname not allowed or URL is malformed.' }, { status: 400 });
    }

    if (images !== undefined && images.length > 0) {
      for (const img of images) {
        if (!isValidImageUrl(img.url)) {
          return NextResponse.json({ message: `Invalid gallery image URL: ${img.url}. Hostname not allowed or URL is malformed.` }, { status: 400 });
        }
      }
    }
    // --- END NEW: Image URL Validation ---

    if (images !== undefined) {
      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: id },
      data: {
        ...propertyData,
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
    if (error.code === 'P2025') {
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
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'AGENT' && session.user?.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'Unauthorized: You do not have permission to delete a property.' }, { status: 403 });
  }

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