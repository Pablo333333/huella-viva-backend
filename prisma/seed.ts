import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Iniciando Limpieza de Base de Datos ---');

  // Borrar datos en orden para evitar conflictos de llaves foráneas
  await prisma.comment.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.ticketHistory.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.ticket.deleteMany({});
  
  // Si existen tablas de trámites (según el esquema actual), las limpiamos también
  try {
    // @ts-ignore - En caso de que se hayan eliminado del cliente pero sigan en DB
    await prisma.tramiteHistory?.deleteMany({});
    // @ts-ignore
    await prisma.tramite?.deleteMany({});
  } catch (e) {
    console.log('Tablas de trámites no encontradas o ya eliminadas.');
  }

  await prisma.workflowState.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('--- Base de Datos Limpia ---');

  // 1. Crear Usuarios de Prueba
  const password = await bcrypt.hash('1234', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password,
      name: 'Administrador Sistema',
      role: 'ADMIN',
    },
  });

  const operatorUser = await prisma.user.create({
    data: {
      email: 'operador@test.com',
      password,
      name: 'Operador de Campo',
      role: 'SUPERVISOR',
    },
  });

  console.log('Usuarios creados:', { admin: adminUser.email, operator: operatorUser.email });

  // 2. Crear Estados de Workflow
  const states = [
    { name: 'NUEVO', description: 'Ticket recién creado' },
    { name: 'EN_PROCESO', description: 'Ticket siendo atendido' },
    { name: 'COMPLETADO', description: 'Ticket resuelto con éxito' },
    { name: 'CANCELADO', description: 'Ticket anulado' },
    { name: 'CERRADO', description: 'Ticket finalizado y archivado' },
  ];

  const createdStates = await Promise.all(
    states.map(state => prisma.workflowState.create({ data: state }))
  );
  
  const stateMap = createdStates.reduce((acc, s) => ({ ...acc, [s.name]: s.id }), {} as Record<string, string>);
  console.log('Estados de workflow creados.');

  // 3. Crear Categorías
  const categories = [
    { name: 'SOPORTE', description: 'Consultas técnicas y ayuda' },
    { name: 'OBRA', description: 'Gestión de proyectos en campo' },
    { name: 'DOCUMENTACIÓN', description: 'Trámites y archivos legales (Cartas, Oficios)' },
  ];

  const createdCategories = await Promise.all(
    categories.map(cat => prisma.category.create({ data: cat }))
  );

  const categoryMap = createdCategories.reduce((acc, c) => ({ ...acc, [c.name]: c.id }), {} as Record<string, string>);
  console.log('Categorías creadas.');

  // 4. Crear Tickets de Prueba (Sin IDs manuales)
  const sampleTickets = [
    {
      title: 'Reparación de luminaria en Sector A',
      description: 'La luminaria principal del sector A no enciende desde ayer.',
      stateName: 'NUEVO',
      categoryName: 'SOPORTE',
      priority: 'URGENTE',
    },
    {
      title: 'Fuga de agua en sótano',
      description: 'Se detectó una pequeña filtración en la tubería de desagüe.',
      stateName: 'EN_PROCESO',
      categoryName: 'OBRA',
      priority: 'MEDIA',
      latitude: -12.046374,
      longitude: -77.042793,
    },
    {
      title: 'Oficio Nro 124-2024: Solicitud de Materiales',
      description: 'Documento formal para la adquisición de cemento y agregados.',
      stateName: 'NUEVO',
      categoryName: 'DOCUMENTACIÓN',
      priority: 'MEDIA',
    },
    {
      title: 'Carta de Aceptación de Obra',
      description: 'Confirmación de recepción de los trabajos realizados en el Sector B.',
      stateName: 'COMPLETADO',
      categoryName: 'DOCUMENTACIÓN',
      priority: 'BAJA',
    },
    {
      title: 'Mantenimiento preventivo de ascensor',
      description: 'Revisión mensual programada para el ascensor 2.',
      stateName: 'NUEVO',
      categoryName: 'SOPORTE',
      priority: 'MEDIA',
    },
  ];

  for (const t of sampleTickets) {
    const ticket = await prisma.ticket.create({
      data: {
        title: t.title,
        description: t.description,
        workflowStateId: stateMap[t.stateName],
        categoryId: categoryMap[t.categoryName],
        userId: operatorUser.id,
        priority: t.priority as any,
        latitude: t.latitude,
        longitude: t.longitude,
      },
    });

    // Crear un comentario inicial para cada ticket
    await prisma.comment.create({
      data: {
        content: `Ticket creado automáticamente por el sistema para la categoría ${t.categoryName}.`,
        userId: adminUser.id,
        ticketId: ticket.id,
      },
    });

    console.log(`Ticket creado: ${ticket.title} (ID: ${ticket.id})`);
  }

  console.log('--- Seed completado con éxito ---');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
