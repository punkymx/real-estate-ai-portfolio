// src/app/api/admin/users/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Path adjusted for nested API route

const prisma = new PrismaClient();

export async function GET(request) {
  const session = await getServerSession(authOptions);

  // Ensure user is authenticated and has ADMIN role
  if (!session || session.user?.role !== 'ADMIN') {
    console.error("Access Denied: User is not an ADMIN or not authenticated for /api/admin/users");
    return NextResponse.json({ message: 'Unauthorized: You must be an ADMIN to access this resource.' }, { status: 403 }); // 403 Forbidden
  }

  try {
    const users = await prisma.user.findMany({
      select: { // Select specific fields to return (EXCLUDE hashedPassword for security)
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true, // Include if you have this field and want to display it
        createdAt: true, // Include createdAt if it exists in your User model
        updatedAt: true, // Include updatedAt if it exists in your User model
      },
      orderBy: {
        createdAt: 'asc', // Order by creation date, oldest first
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users for admin panel:", error);
    // Return a more detailed error message for debugging
    return NextResponse.json({ message: 'Error fetching users from database', error: error.message, code: error.code }, { status: 500 });
  }
}