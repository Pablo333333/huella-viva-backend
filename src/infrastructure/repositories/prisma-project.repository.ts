import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { Project, ProjectStatus, ProjectType } from '../../domain/entities/project.entity';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(project: Partial<Project>): Promise<Project> {
    const created = await this.prisma.project.create({
      data: {
        nombre: project.nombre!,
        tipo: (project.tipo as any) || 'OTROS',
        presupuesto: project.presupuesto || 0,
        financiador: project.financiador,
        estado: (project.estado as any) || 'EN_GESTION',
        communityId: project.communityId!,
      },
    });
    return new Project(created as any);
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    return project ? new Project(project as any) : null;
  }

  async findAll(filters?: { communityId?: string; type?: string; status?: string }): Promise<Project[]> {
    const where: any = {};
    if (filters?.communityId) where.communityId = filters.communityId;
    if (filters?.type) where.tipo = filters.type as any;
    if (filters?.status) where.estado = filters.status as any;

    const projects = await this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return projects.map(p => new Project(p as any));
  }

  async update(id: string, project: Partial<Project>): Promise<Project> {
    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        nombre: project.nombre,
        tipo: project.tipo as any,
        presupuesto: project.presupuesto,
        financiador: project.financiador,
        estado: project.estado as any,
      },
    });
    return new Project(updated as any);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id },
    });
  }
}
