import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICommunityRepository } from '../../domain/repositories/community.repository.interface';
import { Community } from '../../domain/entities/community.entity';

const DEFAULT_MAX_DISTANCE_KM = 80;

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

@Injectable()
export class PrismaCommunityRepository implements ICommunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(community: Partial<Community>): Promise<Community> {
    const created = await this.prisma.community.create({
      data: {
        nombre: community.nombre!,
        poblacion: community.poblacion || 0,
        location: community.location ?? community.latitude ?? null,
        latitude: community.latitude ?? community.location ?? null,
        longitude: community.longitude ?? null,
        boundary: community.boundary,
      },
    });
    return new Community(created);
  }

  async findById(id: string): Promise<Community | null> {
    const community = await this.prisma.community.findUnique({
      where: { id },
    });
    return community ? new Community(community) : null;
  }

  async findByNombre(nombre: string): Promise<Community | null> {
    const needle = this.normalizeName(nombre);
    if (!needle) return null;

    const communities = await this.findAll();
    const exact = communities.find((c) => this.normalizeName(c.nombre) === needle);
    if (exact) return exact;

    return (
      communities.find((c) => {
        const name = this.normalizeName(c.nombre);
        return name.length >= 3 && (name === needle || needle === name);
      }) || null
    );
  }

  private normalizeName(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/comunidad\s+/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async findAll(): Promise<Community[]> {
    const communities = await this.prisma.community.findMany({
      orderBy: { nombre: 'asc' },
    });
    return communities.map((c) => new Community(c));
  }

  async linkUser(userId: string, communityId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { communityId },
    });
  }

  async findNearest(
    latitude: number,
    longitude: number,
    maxDistanceKm = DEFAULT_MAX_DISTANCE_KM,
  ): Promise<Community | null> {
    const communities = await this.findAll();
    let nearest: { community: Community; distance: number } | null = null;

    for (const community of communities) {
      const lat = community.latitude ?? community.location ?? null;
      const lng = community.longitude ?? null;
      if (
        typeof lat !== 'number' ||
        typeof lng !== 'number' ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        continue;
      }

      const distance = haversineKm(latitude, longitude, lat, lng);
      if (distance > maxDistanceKm) continue;
      if (!nearest || distance < nearest.distance) {
        nearest = { community, distance };
      }
    }

    return nearest?.community ?? null;
  }

  async update(id: string, community: Partial<Community>): Promise<Community> {
    const updated = await this.prisma.community.update({
      where: { id },
      data: {
        ...(community.nombre !== undefined ? { nombre: community.nombre } : {}),
        ...(community.poblacion !== undefined ? { poblacion: community.poblacion } : {}),
        ...(community.location !== undefined || community.latitude !== undefined
          ? { location: community.location ?? community.latitude }
          : {}),
        ...(community.latitude !== undefined ? { latitude: community.latitude } : {}),
        ...(community.longitude !== undefined ? { longitude: community.longitude } : {}),
        ...(community.boundary !== undefined ? { boundary: community.boundary } : {}),
      },
    });
    return new Community(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.community.delete({
      where: { id },
    });
  }
}
