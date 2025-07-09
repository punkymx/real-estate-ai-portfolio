// src/app/api/auth/forgot-password/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto'; // Para generar tokens seguros
import nodemailer from 'nodemailer'; // Para enviar correos electrónicos (simulado por ahora)

const prisma = new PrismaClient();

// Configuración del transportador de correo (PLACEHOLDER - DEBES CONFIGURAR ESTO PARA PRODUCCIÓN)
// Para desarrollo, puedes usar Ethereal Mail (https://ethereal.email/) o Mailtrap.io
// O simplemente loguear el email en la consola.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email", // Ejemplo de host (para desarrollo)
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "user@ethereal.email", // Reemplaza con tu usuario de Ethereal/Mailtrap
    pass: "your_password", // Reemplaza con tu contraseña de Ethereal/Mailtrap
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Por seguridad, no revelamos si el correo electrónico existe o no.
      // Siempre respondemos con un mensaje genérico de éxito.
      console.log(`Password reset requested for non-existent or unverified email: ${email}`);
      return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });
    }

    // Generar un token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // Token válido por 1 hora

    // Eliminar tokens antiguos para este usuario para evitar spam de tokens
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Guardar el nuevo token en la base de datos
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        email: user.email,
        expires: tokenExpires,
      },
    });

    // --- Enviar el correo electrónico (SIMULADO POR AHORA) ---
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"Real Estate App" <no-reply@realestate.com>',
      to: user.email,
      subject: 'Password Reset Request for Your Real Estate App Account',
      html: `
        <p>Hello ${user.name || user.email},</p>
        <p>You have requested to reset the password for your Real Estate App account.</p>
        <p>Please click on the following link to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thank you,</p>
        <p>The Real Estate App Team</p>
      `,
    };

    // Descomenta las siguientes líneas para enviar correos en desarrollo/producción
    // await transporter.sendMail(mailOptions);
    console.log(`Password reset email simulated for ${user.email}. Link: ${resetUrl}`);

    return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' }, { status: 200 });

  } catch (error) {
    console.error("Error requesting password reset:", error);
    return NextResponse.json({ message: 'Failed to process password reset request.', error: error.message }, { status: 500 });
  }
}