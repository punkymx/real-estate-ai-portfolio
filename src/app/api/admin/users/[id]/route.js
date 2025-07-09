// src/app/api/admin/users/[id]/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route"; // Path adjusted for nested API route

const prisma = new PrismaClient();

// Handler for PUT requests to /api/admin/users/[id] (Update User Role)
export async function PUT(request, { params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  // Ensure user is authenticated and has ADMIN role
  if (!session || session.user?.role !== 'ADMIN') {
    console.error(`Access Denied: User is not an ADMIN or not authenticated for PUT /api/admin/users/${id}`);
    return NextResponse.json({ message: 'Unauthorized: You must be an ADMIN to update user roles.' }, { status: 403 });
  }

  const body = await request.json();
  const { role } = body;

  // Basic validation for the role
  if (!role || !['CLIENT', 'AGENT', 'ADMIN'].includes(role)) {
    return NextResponse.json({ message: 'Invalid role provided.' }, { status: 400 });
  }

  // --- NEW: Prevent ADMIN from demoting their own account ---
  if (session.user.id === id && role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden: An ADMIN cannot change their own role to a non-ADMIN role.' }, { status: 403 });
  }
  // --- END NEW ---

  try {
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        role: role,
        updatedAt: new Date(), // Manually update updatedAt as @updatedAt might not trigger on partial updates
      },
      select: { // Select specific fields to return
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error(`Error updating user ${id} role:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to update user role.', error: error.message }, { status: 500 });
  }
}

// Handler for DELETE requests to /api/admin/users/[id] (Delete User)
export async function DELETE(request, { params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  // Ensure user is authenticated and has ADMIN role
  if (!session || session.user?.role !== 'ADMIN') {
    console.error(`Access Denied: User is not an ADMIN or not authenticated for DELETE /api/admin/users/${id}`);
    return NextResponse.json({ message: 'Unauthorized: You must be an ADMIN to delete users.' }, { status: 403 });
  }

  // Prevent an admin from deleting their own account (already implemented)
  if (session.user.id === id) {
    return NextResponse.json({ message: 'Forbidden: You cannot delete your own account.' }, { status: 403 });
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: 'User not found for deletion.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Failed to delete user.', error: error.message }, { status: 500 });
  }
}
// Note: The PrismaClient should be closed properly in a real application, but for simplicity, it's omitted here.
// In a production environment, you would typically handle PrismaClient lifecycle management (e.g., closing it on server shutdown).
// This code handles the API routes for updating user roles and deleting users in the admin panel.
// It includes authentication checks, role validation, and error handling for both operations.  
// The PUT request updates a user's role, while the DELETE request removes a user from the database.
// The code also prevents admins from demoting their own accounts and ensures that only authenticated admins can