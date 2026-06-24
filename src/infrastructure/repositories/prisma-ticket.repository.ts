import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { Ticket } from '../../domain/entities/ticket.entity';

@Injectable()
export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(ticket: Ticket): Promise<Ticket> {
    const created = await this.prisma.ticket.create({
      data: {
        title: ticket.title,
        description: ticket.description,
        latitude: ticket.latitude,
        longitude: ticket.longitude,
        userId: ticket.userId,
        categoryId: ticket.categoryId,
        workflowStateId: ticket.workflowStateId,
      },
    });

    return new Ticket(created);
  }

  async findById(id: string): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        status: true,
      },
    });

    if (!ticket) return null;
    return new Ticket({
      ...ticket,
      categoryName: ticket.category.name,
      statusName: ticket.status.name,
    });
  }

  async findAll(filters?: { categoryId?: string; workflowStateId?: string; q?: string }): Promise<Ticket[]> {
    const where: any = {};
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.workflowStateId) where.workflowStateId = filters.workflowStateId;
    if (filters?.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
        { documents: { some: { extractedText: { contains: filters.q, mode: 'insensitive' } } } },
      ];
    }

    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        category: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((t) => new Ticket({
      ...t,
      categoryName: t.category.name,
      statusName: t.status.name,
    }));
  }

  async getStats(): Promise<any> {
    const byCategory = await this.prisma.ticket.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
    });

    const byUser = await this.prisma.ticket.groupBy({
      by: ['userId'],
      _count: { _all: true },
    });

    const last7Days = await this.prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
        workflowStateId: true,
      },
    });

    return { byCategory, byUser, last7Days };
  }

  async update(id: string, ticket: Partial<Ticket>): Promise<Ticket> {
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        title: ticket.title,
        description: ticket.description,
        workflowStateId: ticket.workflowStateId,
        categoryId: ticket.categoryId,
      },
    });

    return new Ticket(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ticket.delete({
      where: { id },
    });
  }
}
