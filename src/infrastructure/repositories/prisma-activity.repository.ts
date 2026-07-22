import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IActivityRepository } from '../../domain/repositories/activity.repository.interface';
import { Activity, ActivityType } from '../../domain/entities/activity.entity';

@Injectable()
export class PrismaActivityRepository implements IActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(activity: Partial<Activity>): Promise<Activity> {
    const created = await this.prisma.activity.create({
      data: {
        tipo: (activity.tipo as any) || 'VISITA',
        descripcion: activity.descripcion!,
        fecha: activity.fecha || new Date(),
        audioUrl: activity.audioUrl,
        fotoUrl: activity.fotoUrl,
        location: activity.location,
        userId: activity.userId!,
        communityId: activity.communityId!,
      },
    });
    return new Activity(created as any);
  }

  async findById(id: string): Promise<Activity | null> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        commitments: true,
      },
    });
    return activity ? new Activity(activity as any) : null;
  }

  async findAll(filters?: { communityId?: string; userId?: string; type?: string }): Promise<Activity[]> {
    const where: any = {};
    if (filters?.communityId) where.communityId = filters.communityId;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.type) where.tipo = filters.type as any;

    const activities = await this.prisma.activity.findMany({
      where,
      include: {
        commitments: true,
      },
      orderBy: { fecha: 'desc' },
    });
    return activities.map(a => new Activity(a as any));
  }

  async update(id: string, activity: Partial<Activity>): Promise<Activity> {
    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        tipo: activity.tipo as any,
        descripcion: activity.descripcion,
        fecha: activity.fecha,
        audioUrl: activity.audioUrl,
        fotoUrl: activity.fotoUrl,
        location: activity.location,
      },
    });
    return new Activity(updated as any);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.activity.delete({
      where: { id },
    });
  }

  async getTimeline(communityId: string): Promise<Activity[]> {
    const activities = await this.prisma.activity.findMany({
      where: { communityId },
      include: {
        commitments: true,
      },
      orderBy: { fecha: 'asc' },
    });
    return activities.map(a => new Activity(a as any));
  }
}
