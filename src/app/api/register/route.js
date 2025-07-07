// src/app/api/register/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
      select: { // Select specific fields to return (exclude hashedPassword for security)
        id: true,
        name: true,
        email: true,
        // Removed 'createdAt: true' as it's not in your Prisma User model
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error during user registration:", error);
    if (error.code === 'P2002') { // Prisma unique constraint violation (e.g., email already exists)
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to register user.', error: error.message }, { status: 500 });
  }
}
