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
  console.log('Seeding database...');

  // Usuarios de prueba
  const adminPassword = await bcrypt.hash('1234', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: adminPassword,
      name: 'Administrador de Prueba',
      role: 'ADMIN',
    },
  });
  console.log(`User created/verified: ${adminUser.email}`);

  // Workflow States
  const states = [
    { name: 'NUEVO', description: 'Ticket recién creado' },
    { name: 'EN_PROCESO', description: 'Ticket siendo atendido' },
    { name: 'COMPLETADO', description: 'Ticket resuelto con éxito' },
    { name: 'CANCELADO', description: 'Ticket anulado' },
    { name: 'CERRADO', description: 'Ticket finalizado y archivado' },
  ];

  for (const state of states) {
    await prisma.workflowState.upsert({
      where: { name: state.name },
      update: {},
      create: state,
    });
  }

  // Categories
  const categories = [
    { name: 'SOPORTE', description: 'Consultas técnicas y ayuda' },
    { name: 'OBRA', description: 'Gestión de proyectos en campo' },
    { name: 'DOCUMENTACIÓN', description: 'Trámites y archivos legales' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Tickets de prueba
  console.log('Creating sample tickets...');
  const allStates = await prisma.workflowState.findMany();
  const allCategories = await prisma.category.findMany();

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
    },
    {
      title: 'Actualización de planos estructurales',
      description: 'Subir la última version de los planos aprobados por el municipio.',
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
    {
      title: 'Auditoría de seguridad anual',
      description: 'Revisión de protocolos de seguridad en toda la planta.',
      stateName: 'CERRADO',
      categoryName: 'DOCUMENTACIÓN',
      priority: 'MEDIA',
    },
  ];

  for (const t of sampleTickets) {
    const state = allStates.find(s => s.name === t.stateName);
    const category = allCategories.find(c => c.name === t.categoryName);

    if (state && category) {
      const ticketId = `sample-${t.title.toLowerCase().replace(/\s+/g, '-')}`;
      await prisma.ticket.upsert({
        where: { 
          id: ticketId 
        },
        update: {},
        create: {
          id: ticketId,
          title: t.title,
          description: t.description,
          workflowStateId: state.id,
          categoryId: category.id,
          userId: adminUser.id,
          priority: t.priority as any,
        },
      });

      // Crear documentos de prueba para algunos tickets
      if (t.stateName === 'COMPLETADO' || t.stateName === 'EN_PROCESO') {
        console.log(`Creating sample document for ticket: ${t.title}`);
        await prisma.document.upsert({
          where: { id: `doc-${ticketId}` },
          update: {},
          create: {
            id: `doc-${ticketId}`,
            name: `Documento_${t.categoryName.toLowerCase()}.pdf`,
            url: '/uploads/sample.pdf',
            type: 'application/pdf',
            userId: adminUser.id,
            ticketId: ticketId,
            version: 1,
            isLatest: true,
          },
        });
      }
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
