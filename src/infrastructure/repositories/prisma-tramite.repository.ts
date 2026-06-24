import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { Tramite } from '../../domain/entities/tramite.entity';

@Injectable()
export class PrismaTramiteRepository implements ITramiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Tramite>): Promise<Tramite> {
    const tramite = await this.prisma.tramite.create({
      data: {
        tipo: data.tipo!,
        remitenteId: data.remitenteId!,
        destinatarioId: data.destinatarioId!,
        estadoId: data.estadoId!,
        latitude: data.latitude,
        longitude: data.longitude,
        fechaLimite: data.fechaLimite,
      },
      include: {
        remitente: true,
        destinatario: true,
        estado: true,
      },
    });

    return this.mapToEntity(tramite);
  }

  async findAll(filters?: { q?: string }): Promise<Tramite[]> {
    const where: any = {};
    if (filters?.q) {
      where.OR = [
        { tipo: { equals: filters.q as any } }, // Enum search is tricky, but let's try
        { remitente: { name: { contains: filters.q, mode: 'insensitive' } } },
        { destinatario: { name: { contains: filters.q, mode: 'insensitive' } } },
        { documents: { some: { extractedText: { contains: filters.q, mode: 'insensitive' } } } },
      ];
    }

    const tramites = await this.prisma.tramite.findMany({
      where,
      include: {
        remitente: true,
        destinatario: true,
        estado: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return tramites.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Tramite | null> {
    const tramite = await this.prisma.tramite.findUnique({
      where: { id },
      include: {
        remitente: true,
        destinatario: true,
        estado: true,
      },
    });
    return tramite ? this.mapToEntity(tramite) : null;
  }

  async update(id: string, data: Partial<Tramite>): Promise<Tramite> {
    const tramite = await this.prisma.tramite.update({
      where: { id },
      data: {
        tipo: data.tipo,
        destinatarioId: data.destinatarioId,
        estadoId: data.estadoId,
        fechaLimite: data.fechaLimite,
      },
      include: {
        remitente: true,
        destinatario: true,
        estado: true,
      },
    });
    return this.mapToEntity(tramite);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tramite.delete({ where: { id } });
  }

  async findByUser(userId: string): Promise<Tramite[]> {
    const tramites = await this.prisma.tramite.findMany({
      where: {
        OR: [
          { remitenteId: userId },
          { destinatarioId: userId },
        ],
      },
      include: {
        remitente: true,
        destinatario: true,
        estado: true,
      },
    });
    return tramites.map(this.mapToEntity);
  }

  private mapToEntity(t: any): Tramite {
    return new Tramite(
      t.id,
      t.tipo,
      t.remitenteId,
      t.destinatarioId,
      t.estadoId,
      t.createdAt,
      t.updatedAt,
      t.fechaLimite,
      t.remitente?.name || undefined,
      t.destinatario?.name || undefined,
      t.estado?.name || undefined,
      t.latitude || undefined,
      t.longitude || undefined,
    );
  }
}
