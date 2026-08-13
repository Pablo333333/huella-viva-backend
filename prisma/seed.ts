import { PrismaClient, Role } from '@prisma/client';
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

  // 1. Limpiar datos existentes (orden por FKs)
  await prisma.commitment.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.community.deleteMany();

  // 2. Comunidades con coordenadas reales (Colombia)
  const hashedPassword = await bcrypt.hash('1234', 10);

  const elRoble = await prisma.community.create({
    data: {
      nombre: 'Comunidad El Roble',
      poblacion: 450,
      location: 4.6097,
      latitude: 4.6097,
      longitude: -74.0817,
    },
  });

  const sanJose = await prisma.community.create({
    data: {
      nombre: 'San José del Guaviare',
      poblacion: 1200,
      location: 2.5689,
      latitude: 2.5689,
      longitude: -72.6459,
    },
  });

  console.log('Comunidades creadas correctamente.');

  // 3. Usuarios por rol (contraseña: 1234)
  const users = [
    {
      email: 'admin@test.com',
      name: 'Gestor Social Territorial',
      role: Role.ADMIN_TERRITORIAL,
      communityId: null as string | null,
    },
    {
      email: 'empresa@test.com',
      name: 'Actor Corporativo',
      role: Role.EMPRESA,
      communityId: null,
    },
    {
      email: 'estado@test.com',
      name: 'Representante Gubernamental',
      role: Role.ESTADO,
      communityId: null,
    },
    {
      email: 'comunidad@test.com',
      name: 'Liderazgo Comunal',
      role: Role.COMUNIDAD,
      communityId: elRoble.id,
    },
  ];

  const createdUsers = await Promise.all(
    users.map((user) =>
      prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          name: user.name,
          role: user.role,
          communityId: user.communityId,
        },
      }),
    ),
  );

  const admin = createdUsers.find((u) => u.role === Role.ADMIN_TERRITORIAL)!;
  const comunidadUser = createdUsers.find((u) => u.role === Role.COMUNIDAD)!;

  console.log('Usuarios creados:');
  createdUsers.forEach((u) => console.log(`  - ${u.email} [${u.role}]`));

  // 4. Proyectos
  await prisma.project.create({
    data: {
      nombre: 'Construcción Pozo de Agua',
      tipo: 'AGUA',
      presupuesto: 45000,
      financiador: 'Huella Viva Fund',
      estado: 'EN_EJECUCION',
      communityId: elRoble.id,
    },
  });

  await prisma.project.create({
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

  // 5. Actividades (programada + ejecutada)
  const reunionProgramada = await prisma.activity.create({
    data: {
      tipo: 'REUNION',
      descripcion:
        'Reunión inicial para coordinar la entrega de materiales del pozo.',
      estado: 'PROGRAMADA',
      fecha: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      userId: admin.id,
      communityId: elRoble.id,
      location: 4.6097,
      latitude: 4.6097,
      longitude: -74.0817,
    },
  });

  await prisma.activity.create({
    data: {
      tipo: 'VISITA',
      descripcion: 'Visita de seguimiento a compromisos locales.',
      estado: 'EJECUTADA',
      fecha: new Date(),
      userId: comunidadUser.id,
      communityId: elRoble.id,
      location: 4.6097,
      latitude: 4.6097,
      longitude: -74.0817,
    },
  });

  await prisma.activity.create({
    data: {
      tipo: 'TALLER',
      descripcion: 'Taller de operación del pozo realizado con la comunidad.',
      estado: 'EJECUTADA',
      fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      userId: admin.id,
      communityId: sanJose.id,
      location: 2.5689,
      latitude: 2.5689,
      longitude: -72.6459,
    },
  });

  console.log('Actividades creadas correctamente.');

  // 6. Compromisos / hitos
  await prisma.commitment.create({
    data: {
      descripcion: 'Entrega de 50 metros de tubería PVC',
      responsable: 'Gestor Social Territorial',
      estado: 'PROGRAMADO',
      activityId: reunionProgramada.id,
      fecha_cumplimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
    await pool.end();
  });
