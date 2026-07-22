import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICommunityRepository } from '../../domain/repositories/community.repository.interface';
import { Community } from '../../domain/entities/community.entity';

@Injectable()
export class PrismaCommunityRepository implements ICommunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(community: Partial<Community>): Promise<Community> {
    const created = await this.prisma.community.create({
      data: {
        nombre: community.nombre!,
        poblacion: community.poblacion || 0,
        location: community.location,
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

  async findAll(): Promise<Community[]> {
    const communities = await this.prisma.community.findMany({
      orderBy: { nombre: 'asc' },
    });
    return communities.map(c => new Community(c));
  }

  async update(id: string, community: Partial<Community>): Promise<Community> {
    const updated = await this.prisma.community.update({
      where: { id },
      data: {
        nombre: community.nombre,
        poblacion: community.poblacion,
        location: community.location,
        boundary: community.boundary,
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
