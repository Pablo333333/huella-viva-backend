import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function upsertCommunity(nombre: string, poblacion: number, latitude: number, longitude: number) {
  const existing = await prisma.community.findFirst({
    where: { nombre: { equals: nombre, mode: 'insensitive' } },
  });

  if (existing) {
    return prisma.community.update({
      where: { id: existing.id },
      data: { latitude, longitude, location: latitude, poblacion },
    });
  }

  return prisma.community.create({
    data: { nombre, poblacion, latitude, longitude, location: latitude },
  });
}

async function main() {
  const elRoble = await upsertCommunity('Comunidad El Roble', 450, 4.6097, -74.0817);
  const sanJose = await upsertCommunity('San José del Guaviare', 1200, 2.5689, -72.6459);
  console.log('Ensured communities:', elRoble.nombre, sanJose.nombre);

  const assigned = await prisma.user.updateMany({
    where: { role: Role.COMUNIDAD },
    data: { communityId: elRoble.id },
  });
  console.log('Assigned comunidad users to El Roble:', assigned.count);

  console.log(
    'All communities:',
    (await prisma.community.findMany({ orderBy: { nombre: 'asc' } })).map((c) => ({
      nombre: c.nombre,
      latitude: c.latitude,
      longitude: c.longitude,
    })),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
