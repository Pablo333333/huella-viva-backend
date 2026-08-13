import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IActivityRepository } from '../../domain/repositories/activity.repository.interface';
import { Activity } from '../../domain/entities/activity.entity';

const activityInclude = {
  commitments: true,
  community: true,
} as const;

function toActivity(record: any): Activity {
  return new Activity({
    ...record,
    communityName: record.community?.nombre,
    commitments: record.commitments,
  });
}

@Injectable()
export class PrismaActivityRepository implements IActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(activity: Partial<Activity>): Promise<Activity> {
    const created = await this.prisma.activity.create({
      data: {
        tipo: (activity.tipo as any) || 'VISITA',
        descripcion: activity.descripcion!,
        fecha: activity.fecha || new Date(),
        estado: (activity.estado as any) || 'EJECUTADA',
        audioUrl: activity.audioUrl,
        fotoUrl: activity.fotoUrl,
        location: activity.location ?? activity.latitude ?? null,
        latitude: activity.latitude ?? null,
        longitude: activity.longitude ?? null,
        userId: activity.userId!,
        communityId: activity.communityId!,
      },
      include: activityInclude,
    });
    return toActivity(created);
  }

  async findById(id: string): Promise<Activity | null> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: activityInclude,
    });
    return activity ? toActivity(activity) : null;
  }

  async findAll(filters?: {
    communityId?: string;
    userId?: string;
    type?: string;
    estado?: string;
  }): Promise<Activity[]> {
    const where: any = {};
    if (filters?.communityId && filters?.userId) {
      where.OR = [
        { communityId: filters.communityId },
        { userId: filters.userId },
      ];
    } else if (filters?.communityId) {
      where.communityId = filters.communityId;
    } else if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.type) where.tipo = filters.type as any;
    if (filters?.estado) where.estado = filters.estado as any;

    const activities = await this.prisma.activity.findMany({
      where,
      include: activityInclude,
      orderBy: { fecha: 'desc' },
    });
    return activities.map(toActivity);
  }

  async update(id: string, activity: Partial<Activity>): Promise<Activity> {
    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        tipo: activity.tipo as any,
        descripcion: activity.descripcion,
        fecha: activity.fecha,
        estado: activity.estado as any,
        audioUrl: activity.audioUrl,
        fotoUrl: activity.fotoUrl,
        location: activity.location ?? activity.latitude,
        latitude: activity.latitude,
        longitude: activity.longitude,
        communityId: activity.communityId,
      },
      include: activityInclude,
    });
    return toActivity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.activity.delete({
      where: { id },
    });
  }

  async getTimeline(communityId: string): Promise<Activity[]> {
    const activities = await this.prisma.activity.findMany({
      where: { communityId },
      include: activityInclude,
      orderBy: { fecha: 'asc' },
    });
    return activities.map(toActivity);
  }
}
