// src/app/api/auth/reset-password/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and new password are required.' }, { status: 400 });
    }

    // Buscar el token en la base de datos
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetTokenRecord) {
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 400 });
    }

    // Verificar si el token ha expirado
    if (resetTokenRecord.expires < new Date()) {
      // Eliminar el token expirado para limpiar la base de datos
      await prisma.passwordResetToken.delete({ where: { id: resetTokenRecord.id } });
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 400 });
    }

    // Encontrar al usuario asociado con el token
    const user = await prisma.user.findUnique({
      where: { email: resetTokenRecord.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword: hashedPassword,
        updatedAt: new Date(), // Asegurar que updatedAt se actualice
      },
    });

    // Eliminar el token de restablecimiento después de usarlo
    await prisma.passwordResetToken.delete({ where: { id: resetTokenRecord.id } });

    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ message: 'Failed to reset password.', error: error.message }, { status: 500 });
  }
}