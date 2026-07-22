import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seed: Iniciando poblamiento de base de datos Huella Viva 360...');

  // 1. Limpiar datos existentes (Opcional, pero recomendado para seed limpio)
  // El orden importa por las llaves foráneas
  await prisma.commitment.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.community.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear Usuarios
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@huellaviva.com',
      password: hashedPassword,
      name: 'Administrador Territorial',
      role: 'ADMIN',
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@huellaviva.com',
      password: hashedPassword,
      name: 'Supervisor de Campo',
      role: 'SUPERVISOR',
    },
  });

  console.log('Usuarios creados correctamente.');

  // 3. Crear Comunidades
  const elRoble = await prisma.community.create({
    data: {
      nombre: 'Comunidad El Roble',
      poblacion: 450,
      location: 4.6097, // Float temporal
    },
  });

  const sanJose = await prisma.community.create({
    data: {
      nombre: 'San José del Guaviare',
      poblacion: 1200,
      location: 2.5678,
    },
  });

  console.log('Comunidades creadas correctamente.');

  // 4. Crear Proyectos
  const pozoAgua = await prisma.project.create({
    data: {
      nombre: 'Construcción Pozo de Agua',
      tipo: 'AGUA',
      presupuesto: 45000,
      financiador: 'Huella Viva Fund',
      estado: 'EN_EJECUCION',
      communityId: elRoble.id,
    },
  });

  const escuela = await prisma.project.create({
    data: {
      nombre: 'Refacción Escuela Primaria',
      tipo: 'EDUCACION',
      presupuesto: 15000,
      financiador: 'Gobierno Local',
      estado: 'CULMINADO',
      communityId: sanJose.id,
    },
  });

  console.log('Proyectos creados correctamente.');

  // 5. Crear Actividades (Memoria Viva)
  const reunion1 = await prisma.activity.create({
    data: {
      tipo: 'REUNION',
      descripcion: 'Reunión inicial para coordinar la entrega de materiales del pozo.',
      userId: supervisor.id,
      communityId: elRoble.id,
      location: 4.6097,
    },
  });

  console.log('Actividades creadas correctamente.');

  // 6. Crear Compromisos
  await prisma.commitment.create({
    data: {
      descripcion: 'Entrega de 50 metros de tubería PVC',
      responsable: 'Supervisor de Campo',
      estado: 'PROGRAMADO',
      activityId: reunion1.id,
      fecha_cumplimiento: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // En 7 días
    },
  });

  console.log('Compromisos creados correctamente.');
  console.log('Seed finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
