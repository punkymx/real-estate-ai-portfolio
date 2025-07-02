// src/app/api/properties/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Handler for GET requests to /api/properties/[id]
// (Aunque no lo pediste explícitamente para el frontend aún, es buena práctica tenerlo)
export async function GET(request, { params }) {
  const { id } = params; // Obtiene el ID de la URL dinámica
  try {
    const property = await prisma.property.findUnique({
      where: { id: id },
      include: {
        images: true, // Incluye las imágenes relacionadas
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
  const { id } = params; // Obtiene el ID de la URL dinámica
  const body = await request.json(); // Obtiene el cuerpo de la solicitud JSON
  const { images, ...propertyData } = body; // Separa las imágenes del resto de los datos de la propiedad

  try {
    // Si hay datos de imágenes en el body, manejamos la actualización o creación de imágenes.
    // Esto es más complejo que solo actualizar campos de Property.
    // Para simplificar, vamos a eliminar todas las imágenes existentes y crear las nuevas.
    // Un enfoque más robusto implicaría comparar y actualizar/eliminar/crear solo las necesarias.

    // 1. Opcional: Eliminar imágenes existentes asociadas a la propiedad
    if (images !== undefined) { // Solo si 'images' se envió en el body
      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      });
    }

    // 2. Actualizar la propiedad principal
    const updatedProperty = await prisma.property.update({
      where: { id: id },
      data: {
        ...propertyData, // Los datos principales de la propiedad
        ...(images !== undefined && images.length > 0 && { // Solo añade 'images' si se proveyó y no está vacío
          images: {
            create: images, // Crea las nuevas imágenes (ya tienen el formato correcto { url: "..." })
          },
        }),
        // Si no se proporcionan 'images' en el body, este campo no se modifica.
        // Si se proporciona un array vacío, se borrarán las existentes (por el deleteMany previo)
        // y no se creará ninguna nueva.
      },
      include: {
        images: true, // Incluye las imágenes actualizadas en la respuesta
      },
    });

    return NextResponse.json(updatedProperty, { status: 200 });
  } catch (error) {
    console.error(`Error updating property with ID ${id}:`, error);
    // Errores de validación de Prisma suelen tener 'code'
    if (error.code === 'P2025') { // P2025: An operation failed because it depends on one or more records that were required but not found.
      return NextResponse.json({ message: 'Property not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating property', error: error.message }, { status: 500 });
  }
}

// Handler for DELETE requests to /api/properties/[id] (Delete Property)
export async function DELETE(request, { params }) {
  const { id } = params; // Obtiene el ID de la URL dinámica

  try {
    // Para eliminar una propiedad que tiene imágenes relacionadas,
    // necesitamos configurar el `onDelete` en el `schema.prisma`
    // a `Cascade` para las relaciones, o eliminar las imágenes manualmente primero.
    // Asumiendo que ya configuraste `onDelete: Cascade` en tu schema.

    const deletedProperty = await prisma.property.delete({
      where: { id: id },
    });

    // Devuelve un 204 No Content para indicar que la operación fue exitosa pero no hay contenido que devolver.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting property with ID ${id}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Property not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting property', error: error.message }, { status: 500 });
  }
}