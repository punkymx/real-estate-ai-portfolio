// src/app/api/properties/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/properties (Obtener todas las propiedades)
export async function GET(request) {
  try {
    const properties = await prisma.property.findMany({
      include: {
        images: true,
      },
    });
    return new Response(JSON.stringify(properties), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return new Response(JSON.stringify({ message: 'Error fetching properties', error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// POST /api/properties (Crear una nueva propiedad)
export async function POST(request) {
  try {
    const body = await request.json();
    const { images, ...propertyData } = body;

    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        images: {
          create: images,
        },
      },
      include: {
        images: true,
      },
    });

    return new Response(JSON.stringify(newProperty), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return new Response(JSON.stringify({ message: 'Error creating property', error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}