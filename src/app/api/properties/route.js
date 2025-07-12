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
  'www.google.com',
];

// Función de ayuda para validar la URL de una imagen
function isValidImageUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && ALLOWED_IMAGE_HOSTNAMES.includes(urlObj.hostname);
  } catch (e) {
    return false;
  }
}

// Handler for GET requests to /api/properties (Fetch all properties)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const propertyType = searchParams.get('propertyType');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');

    const whereClause = {};

    if (minPrice) {
      whereClause.price = { gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      whereClause.price = { ...whereClause.price, lte: parseFloat(maxPrice) };
    }
    if (propertyType && propertyType !== 'all') {
      // Use propertyType directly as sent by frontend (e.g., "Casa")
      whereClause.type = propertyType;
    }
    if (bedrooms) {
      whereClause.bedrooms = { gte: parseInt(bedrooms, 10) };
    }
    if (bathrooms) {
      whereClause.bathrooms = { gte: parseInt(bathrooms, 10) };
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        images: true, // Include related gallery images
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ message: 'Failed to fetch properties.', error: error.message }, { status: 500 });
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
    const {
      title,
      price,
      location,
      image, // This is the main image URL from frontend
      type,
      bedrooms,
      bathrooms,
      operation,
      description,
      furnished,
      constructionArea,
      landArea,
      images: galleryImages, // Renamed 'images' from body to 'galleryImages' for clarity
    } = body;

    // Validate required fields based on frontend's 'required' attributes
    if (!title || !price || !location || !image || !type || !description) {
      return NextResponse.json({ message: 'Title, price, location, main image, type, and description are required.' }, { status: 400 });
    }

    // Validate main image URL
    if (!isValidImageUrl(image)) {
      return NextResponse.json({ message: 'Invalid main image URL. Hostname not allowed or URL is malformed.' }, { status: 400 });
    }

    // Prepare gallery images for creation, filtering out empty URLs and validating
    const galleryImagesToCreate = [];
    if (galleryImages && galleryImages.length > 0) {
      for (const img of galleryImages) {
        if (img.url.trim() !== '') { // Only process non-empty URLs
          if (!isValidImageUrl(img.url)) {
            return NextResponse.json({ message: `Invalid gallery image URL: ${img.url}. Hostname not allowed or URL is malformed.` }, { status: 400 });
          }
          galleryImagesToCreate.push({ url: img.url });
        }
      }
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        price: parseFloat(price),
        location,
        image, // Use 'image' directly as per schema
        type,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : null, // Handle optional
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : null, // Handle optional
        operation,
        description,
        furnished: typeof furnished === 'boolean' ? furnished : false, // Ensure boolean type, default to false
        constructionArea: constructionArea || null, // Store as string or null
        landArea: landArea || null, // Store as string or null
        images: { // Nested write for PropertyImage model
          create: galleryImagesToCreate,
        },
        ownerId: session.user.id, // Assign the property to the logged-in user
      },
      include: {
        images: true, // Include related gallery images in the response
      },
    });

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    if (error.code === 'P2002') { // Unique constraint violation (e.g., if title was unique)
      return NextResponse.json({ message: 'A property with this title already exists.' }, { status: 409 });
    }
    if (error.name === 'PrismaClientValidationError') {
      // Log the full Prisma validation error for debugging
      console.error("Prisma Validation Error Details:", error.message);
      return NextResponse.json({ message: 'Invalid data provided for property creation.', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create property.', error: error.message }, { status: 500 });
  }
}

// Handler for PUT requests to /api/properties (Update a property)
export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'AGENT' && session.user?.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'Unauthorized: You do not have permission to update a property.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Get ID from query params for PUT

    if (!id) {
      return NextResponse.json({ message: 'Property ID is required for update.' }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      price,
      location,
      image, // Main image URL
      type,
      bedrooms,
      bathrooms,
      operation,
      description,
      furnished,
      constructionArea,
      landArea,
      images: galleryImages, // Array of gallery image objects { url: '...' }
    } = body;

    // Validate required fields for update (adjust as needed, typically same as create)
    if (!title || !price || !location || !image || !type || !description) {
        return NextResponse.json({ message: 'Title, price, location, main image, type, and description are required for update.' }, { status: 400 });
    }

    // Validate image URLs
    if (!isValidImageUrl(image)) {
      return NextResponse.json({ message: 'Invalid main image URL. Hostname not allowed or URL is malformed.' }, { status: 400 });
    }

    const galleryImagesToUpdate = [];
    if (galleryImages !== undefined) { // Check if images array was sent at all
      for (const img of galleryImages) {
        if (img.url.trim() !== '') {
          if (!isValidImageUrl(img.url)) {
            return NextResponse.json({ message: `Invalid gallery image URL: ${img.url}. Hostname not allowed or URL is malformed.` }, { status: 400 });
          }
          galleryImagesToUpdate.push({ url: img.url });
        }
      }
      // If images array was sent, delete existing ones and recreate
      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      });
    }


    const updatedProperty = await prisma.property.update({
      where: { id: id },
      data: {
        title,
        price: parseFloat(price),
        location,
        image, // Use 'image' directly as per schema
        type,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
        operation,
        description,
        furnished: typeof furnished === 'boolean' ? furnished : false,
        constructionArea: constructionArea || null,
        landArea: landArea || null,
        images: { // Nested write for PropertyImage model
          create: galleryImagesToUpdate,
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(updatedProperty, { status: 200 });
  } catch (error) {
    console.error("Error updating property:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Property not found for update.' }, { status: 404 });
    }
    if (error.name === 'PrismaClientValidationError') {
      console.error("Prisma Validation Error Details:", error.message);
      return NextResponse.json({ message: 'Invalid data provided for property update.', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to update property.', error: error.message }, { status: 500 });
  }
}

// Handler for DELETE requests to /api/properties (Delete a property)
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'AGENT' && session.user?.role !== 'ADMIN')) {
    return NextResponse.json({ message: 'Unauthorized: You do not have permission to delete a property.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Property ID is required.' }, { status: 400 });
    }

    const existingProperty = await prisma.property.findUnique({ where: { id } });
    if (!existingProperty) {
      return NextResponse.json({ message: 'Property not found.' }, { status: 404 });
    }

    // Optional: Add logic to ensure only owner or admin can delete
    if (session.user.role === 'AGENT' && existingProperty.ownerId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized to delete this property.' }, { status: 403 });
    }

    // Prisma's onDelete: Cascade in schema.prisma will handle deleting related PropertyImage records
    await prisma.property.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error("Error deleting property:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Property not found for deletion.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete property.', error: error.message }, { status: 500 });
  }
}
