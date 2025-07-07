// src/app/api/properties/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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

// Handler for GET requests to /api/properties (Fetch all properties)
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
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
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'AGENT' && session.user?.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'Unauthorized: You do not have permission to create a property.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { images, ...propertyData } = body;

    // --- NEW: Image URL Validation ---
    if (!isValidImageUrl(propertyData.image)) {
      return NextResponse.json({ message: 'Invalid main image URL. Hostname not allowed or URL is malformed.' }, { status: 400 });
    }

    if (images && images.length > 0) {
      for (const img of images) {
        if (!isValidImageUrl(img.url)) {
          return NextResponse.json({ message: `Invalid gallery image URL: ${img.url}. Hostname not allowed or URL is malformed.` }, { status: 400 });
        }
      }
    }
    // --- END NEW: Image URL Validation ---

    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
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
        images: true,
      },
    });

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A property with this title already exists.' }, { status: 409 });
    }
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json({ message: 'Invalid data provided for property creation.', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error creating property', error: error.message }, { status: 500 });
  }
}