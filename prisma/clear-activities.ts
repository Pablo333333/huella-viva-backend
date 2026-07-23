/**
 * Limpia datos de feria: compromisos, actividades (pines), inversiones,
 * proyectos, comunidades y audit logs.
 *
 * Por defecto CONSERVA los usuarios de login (admin@test.com, etc.).
 *
 * Uso:
 *   npm run db:clear-activities
 *   npm run db:clear-activities -- --with-users   # también borra usuarios
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL no está definida.');
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const withUsers = process.argv.includes('--with-users');

  console.log('────────────────────────────────────────────');
  console.log(' Huella Viva 360 · Reset total de datos demo');
  console.log('────────────────────────────────────────────');

  const countsBefore = {
    commitments: await prisma.commitment.count(),
    activities: await prisma.activity.count(),
    investments: await prisma.investment.count(),
    projects: await prisma.project.count(),
    communities: await prisma.community.count(),
    users: await prisma.user.count(),
  };

  console.log('Antes:');
  console.table(countsBefore);

  // Orden por FKs (hijos → padres)
  const deletedCommitments = await prisma.commitment.deleteMany();
  const deletedActivities = await prisma.activity.deleteMany();
  const deletedInvestments = await prisma.investment.deleteMany();
  const deletedProjects = await prisma.project.deleteMany();
  const deletedCommunities = await prisma.community.deleteMany();

  let deletedUsers = { count: 0 };
  if (withUsers) {
    deletedUsers = await prisma.user.deleteMany();
  }

  console.log('Eliminados:');
  console.table({
    commitments: deletedCommitments.count,
    activities: deletedActivities.count,
    investments: deletedInvestments.count,
    projects: deletedProjects.count,
    communities: deletedCommunities.count,
    users: withUsers ? deletedUsers.count : '(conservados)',
  });

  const countsAfter = {
    commitments: await prisma.commitment.count(),
    activities: await prisma.activity.count(),
    investments: await prisma.investment.count(),
    projects: await prisma.project.count(),
    communities: await prisma.community.count(),
    users: await prisma.user.count(),
  };

  console.log('Después:');
  console.table(countsAfter);
  console.log(
    withUsers
      ? 'Base en ceros (incluye usuarios). Ejecuta `npm run db:seed` para recrear logins.'
      : 'Territorio/pines en ceros. Usuarios de login intactos. Terra Voz puede crear comunidad al vuelo.',
  );
}

main()
  .catch((e) => {
    console.error('Error al limpiar:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
