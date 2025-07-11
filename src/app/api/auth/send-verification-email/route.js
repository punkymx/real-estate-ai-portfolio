// src/app/api/auth/send-verification-email/route.js
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
      console.log(`Verification email requested for non-existent email: ${email}`);
      return NextResponse.json({ message: 'If an account with that email exists, a verification link has been sent.' }, { status: 200 });
    }

    // Si el correo ya está verificado, no hacer nada
    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified.' }, { status: 200 });
    }

    // Generar un token seguro (NextAuth.js usa un formato específico para VerificationToken)
    // Para simplificar, generaremos un token simple y lo guardaremos.
    // NextAuth.js tiene su propia forma de generar y limpiar tokens de verificación,
    // pero para un flujo manual, esto funciona.
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 3600000); // Token válido por 24 horas

    // Eliminar tokens antiguos de verificación para este usuario (identifier es el email)
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email },
    });

    // Guardar el nuevo token en la base de datos
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: tokenExpires,
      },
    });

    // --- Enviar el correo electrónico (SIMULADO POR AHORA) ---
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    const mailOptions = {
      from: '"Real Estate App Demo" <no-reply@realestatedemo.com>',
      to: user.email,
      subject: 'Verify Your Email for Real Estate App Demo',
      html: `
        <p>Hello ${user.name || user.email},</p>
        <p>Thank you for registering with Real Estate App Demo.</p>
        <p>Please click on the following link to verify your email address:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not register for this account, please ignore this email.</p>
        <p>Thank you,</p>
        <p>The Real Estate App Demo Team</p>
      `,
    };

    // Descomenta las siguientes líneas para enviar correos en desarrollo/producción
    // await transporter.sendMail(mailOptions);
    console.log(`Verification email simulated for ${user.email}. Link: ${verificationUrl}`);

    return NextResponse.json({ message: 'If an account with that email exists, a verification link has been sent.' }, { status: 200 });

  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json({ message: 'Failed to process verification email request.', error: error.message }, { status: 500 });
  }
}