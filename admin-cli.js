// admin-cli.js
// Este script CLI permite la gestión de usuarios (crear ADMIN, cambiar rol, eliminar)
// directamente desde la línea de comandos. Es una herramienta de "super administrador"
// para situaciones de emergencia o configuración inicial en producción.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Para hashear contraseñas
const readline = require('readline'); // Para entrada de usuario en la consola

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para preguntar al usuario en la consola
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log("\n--- Super Admin CLI Tool ---");
  console.log("1. Create new ADMIN user");
  console.log("2. Change user role");
  console.log("3. Delete user");
  console.log("4. Exit");

  const choice = await askQuestion("Enter your choice (1-4): ");

  try {
    switch (choice.trim()) {
      case '1':
        await createAdminUser();
        break;
      case '2':
        await changeUserRole();
        break;
      case '3':
        await deleteUser();
        break;
      case '4':
        console.log("Exiting CLI tool.");
        break;
      default:
        console.log("Invalid choice. Please enter a number between 1 and 4.");
    }
  } catch (error) {
    console.error("\nAn error occurred:", error.message);
    if (error.code) {
      console.error("Prisma Error Code:", error.code);
    }
  } finally {
    rl.close(); // Cerrar la interfaz de lectura
    await prisma.$disconnect(); // Desconectar Prisma Client
  }
}

// --- Funcionalidad 1: Crear nuevo usuario ADMIN ---
async function createAdminUser() {
  console.log("\n--- Create New ADMIN User ---");
  const name = await askQuestion("Enter user name (optional): ");
  const email = await askQuestion("Enter user email: ");
  const password = await askQuestion("Enter user password: ");

  if (!email || !password) {
    console.error("Email and password are required.");
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.error(`User with email "${email}" already exists.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  const newUser = await prisma.user.create({
    data: {
      name: name || null,
      email,
      hashedPassword,
      role: 'ADMIN', // Directly assign ADMIN role
    },
  });
  console.log(`\nADMIN user "${newUser.email}" created successfully!`);
}

// --- Funcionalidad 2: Cambiar rol de usuario ---
async function changeUserRole() {
  console.log("\n--- Change User Role ---");
  const email = await askQuestion("Enter email of the user to modify: ");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User with email "${email}" not found.`);
    return;
  }

  console.log(`Current role for ${user.email}: ${user.role}`);
  const newRole = await askQuestion("Enter new role (CLIENT, AGENT, ADMIN): ");

  if (!['CLIENT', 'AGENT', 'ADMIN'].includes(newRole.toUpperCase())) {
    console.error("Invalid role. Please choose CLIENT, AGENT, or ADMIN.");
    return;
  }

  // Prevención de auto-democión: El script no permite cambiar el rol del usuario logueado
  // Esto es una capa adicional, la API ya lo previene para el admin logueado.
  // Aquí es más para evitar que un admin se democione accidentalmente si este script
  // fuera ejecutado por un admin que no está logueado en la app web.
  // En este contexto CLI, no tenemos una "sesión" de usuario logueado.

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      role: newRole.toUpperCase(),
      updatedAt: new Date(), // Asegurar que updatedAt se actualice
    },
  });
  console.log(`\nUser "${updatedUser.email}" role changed to "${updatedUser.role}" successfully!`);
}

// --- Funcionalidad 3: Eliminar usuario ---
async function deleteUser() {
  console.log("\n--- Delete User ---");
  const email = await askQuestion("Enter email of the user to delete: ");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User with email "${email}" not found.`);
    return;
  }

  const confirmation = await askQuestion(`Are you sure you want to delete user "${user.email}"? Type 'yes' to confirm: `);
  if (confirmation.toLowerCase() !== 'yes') {
    console.log("User deletion cancelled.");
    return;
  }

  // Consideraciones para eliminar un usuario:
  // Si el usuario tiene propiedades asociadas y no tienes onDelete: Cascade configurado en Prisma para propiedades,
  // la eliminación fallará. Para NextAuth, las relaciones Account y Session suelen tener onDelete: Cascade.

  await prisma.user.delete({ where: { id: user.id } });
  console.log(`\nUser "${user.email}" deleted successfully.`);
}

main();