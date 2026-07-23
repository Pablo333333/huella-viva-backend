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
  await prisma.community.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear usuarios por rol (contraseña: 1234)
  const hashedPassword = await bcrypt.hash('1234', 10);

  const users = [
    {
      email: 'admin@test.com',
      name: 'Gestor Social Territorial',
      role: Role.ADMIN_TERRITORIAL,
    },
    {
      email: 'empresa@test.com',
      name: 'Actor Corporativo',
      role: Role.EMPRESA,
    },
    {
      email: 'estado@test.com',
      name: 'Representante Gubernamental',
      role: Role.ESTADO,
    },
    {
      email: 'comunidad@test.com',
      name: 'Liderazgo Comunal',
      role: Role.COMUNIDAD,
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
        },
      }),
    ),
  );

  const admin = createdUsers.find((u) => u.role === Role.ADMIN_TERRITORIAL)!;
  const comunidadUser = createdUsers.find((u) => u.role === Role.COMUNIDAD)!;

  console.log('Usuarios creados:');
  createdUsers.forEach((u) => console.log(`  - ${u.email} [${u.role}]`));

  // 3. Crear Comunidades
  const elRoble = await prisma.community.create({
    data: {
      nombre: 'Comunidad El Roble',
      poblacion: 450,
      location: 4.6097,
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

  // 5. Crear Actividades (Memoria Viva)
  const reunion1 = await prisma.activity.create({
    data: {
      tipo: 'REUNION',
      descripcion:
        'Reunión inicial para coordinar la entrega de materiales del pozo.',
      userId: admin.id,
      communityId: elRoble.id,
      location: 4.6097,
    },
  });

  await prisma.activity.create({
    data: {
      tipo: 'VISITA',
      descripcion: 'Visita de seguimiento a compromisos locales.',
      userId: comunidadUser.id,
      communityId: elRoble.id,
      location: 4.6097,
    },
  });

  console.log('Actividades creadas correctamente.');

  // 6. Crear Compromisos
  await prisma.commitment.create({
    data: {
      descripcion: 'Entrega de 50 metros de tubería PVC',
      responsable: 'Gestor Social Territorial',
      estado: 'PROGRAMADO',
      activityId: reunion1.id,
      fecha_cumplimiento: new Date(
        new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
      ),
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
