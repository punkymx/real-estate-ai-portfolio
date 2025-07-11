// src/app/api/auth/verify-email/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email'); // Get email from URL as identifier

    console.log(`[VERIFY_EMAIL_API] Received request for email: ${email}, token: ${token}`);

    if (!token || !email) {
      console.log('[VERIFY_EMAIL_API] Missing token or email in URL.');
      return NextResponse.json({ message: 'Missing token or email.' }, { status: 400 });
    }

    // Buscar el token de verificación en la base de datos
    const verificationTokenRecord = await prisma.verificationToken.findUnique({
      where: {
        token: token,
        identifier: email, // Match identifier with email
      },
    });

    console.log(`[VERIFY_EMAIL_API] Found token record: ${verificationTokenRecord ? 'Yes' : 'No'}`);

    if (!verificationTokenRecord) {
      console.log('[VERIFY_EMAIL_API] Invalid or expired verification link (token record not found).');
      return NextResponse.json({ message: 'Invalid or expired verification link.' }, { status: 400 });
    }

    // Verificar si el token ha expirado
    console.log(`[VERIFY_EMAIL_API] Token expires at: ${verificationTokenRecord.expires}, Current time: ${new Date()}`);
    if (verificationTokenRecord.expires < new Date()) {
      console.log('[VERIFY_EMAIL_API] Token has expired. Attempting to delete expired token.');
      // Eliminar el token expirado usando la clave única (identifier y token)
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationTokenRecord.identifier,
            token: verificationTokenRecord.token,
          },
        },
      });
      return NextResponse.json({ message: 'Invalid or expired verification link.' }, { status: 400 });
    }

    // Encontrar al usuario asociado con el token
    const user = await prisma.user.findUnique({
      where: { email: verificationTokenRecord.identifier },
    });

    console.log(`[VERIFY_EMAIL_API] Found user for email ${verificationTokenRecord.identifier}: ${user ? 'Yes' : 'No'}`);

    if (!user) {
      console.log('[VERIFY_EMAIL_API] User not found for the email in the token.');
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Marcar el correo electrónico del usuario como verificado
    console.log(`[VERIFY_EMAIL_API] Updating user ${user.email} to verified.`);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(), // Set current date as verification timestamp
        updatedAt: new Date(), // Ensure updatedAt is updated
      },
    });

    // Eliminar el token de verificación después de usarlo
    console.log(`[VERIFY_EMAIL_API] Deleting used verification token for ${user.email}.`);
    // Eliminar el token usando la clave única (identifier y token)
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationTokenRecord.identifier,
          token: verificationTokenRecord.token,
        },
      },
    });

    // Redirigir a una página de éxito o inicio de sesión
    const redirectUrl = new URL('/auth/signin', process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set('message', 'Email verified successfully! You can now sign in.');

    console.log(`[VERIFY_EMAIL_API] Email verified successfully. Redirecting to: ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("[VERIFY_EMAIL_API] Unhandled error during email verification:", error);
    return NextResponse.json({ message: 'Failed to verify email.', error: error.message }, { status: 500 });
  } finally {
    // Es buena práctica desconectar el cliente de Prisma, especialmente en Vercel
    // pero en un entorno de desarrollo local y con Next.js App Router,
    // Prisma se gestiona automáticamente con un singleton. Puedes quitar esta línea
    // si te causa problemas, aunque no debería.
    // await prisma.$disconnect();
  }
}
