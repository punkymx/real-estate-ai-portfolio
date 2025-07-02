// src/app/api/properties/[id]/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/properties/[id] (Obtener una propiedad específica por ID)
export async function GET(request, { params }) {
  const propertyId = params.id;

  try {
    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
      include: {
        images: true,
      },
    });

    if (!property) {
      return new Response(JSON.stringify({ message: 'Property not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(property), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Error fetching property with ID ${propertyId}:`, error);
    return new Response(JSON.stringify({ message: 'Error fetching property', error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}