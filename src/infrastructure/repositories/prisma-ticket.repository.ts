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
        priority: (ticket.priority as any) || 'BAJA',
        isArchived: ticket.isArchived || false,
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
    } as any);
  }

  async findAll(filters?: { categoryId?: string; workflowStateId?: string; q?: string; includeArchived?: boolean }): Promise<Ticket[]> {
    const where: any = {};
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.workflowStateId) where.workflowStateId = filters.workflowStateId;
    
    // Por defecto ocultar archivados a menos que se pida explícitamente
    if (!filters?.includeArchived) {
      where.isArchived = false;
    }

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
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (tickets.length > 0) {
      console.log('[PrismaTicketRepository] First ticket structure:', JSON.stringify(tickets[0], null, 2));
    }

    return tickets.map((t) => new Ticket({
      ...t,
      categoryName: t.category.name,
      statusName: t.status.name,
      documents: t.documents,
    } as any));
  }

  async getStats(): Promise<any> {
    console.log('[PrismaTicketRepository] Fetching full analytics stats...');

    // 1. Obtener todos los tickets con sus relaciones para procesar en memoria (más robusto)
    const allTickets = await this.prisma.ticket.findMany({
      include: {
        status: true,
        category: true,
        user: true,
      }
    });

    console.log(`[PrismaTicketRepository] Total tickets found for analytics: ${allTickets.length}`);

    // 2. Calcular KPIs
    const kpis = {
      total: allTickets.length,
      pending: allTickets.filter(t => t.status && ['NUEVO', 'EN_PROCESO'].includes(t.status.name.toUpperCase())).length,
      completed: allTickets.filter(t => t.status && (t.status.name.toUpperCase() === 'CERRADO' || t.status.name.toUpperCase() === 'COMPLETADO')).length,
      urgent: allTickets.filter(t => t.priority && ['URGENTE', 'MEDIA'].includes(t.priority.toUpperCase())).length,
    };

    // 3. Distribución por Categoría
    const categoryMap: Record<string, number> = {};
    allTickets.forEach(t => {
      const name = t.category?.name || 'Sin Categoría';
      categoryMap[name] = (categoryMap[name] || 0) + 1;
    });
    const byCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // 4. Carga por Usuario
    const userMap: Record<string, number> = {};
    allTickets.forEach(t => {
      const name = t.user?.name || 'Usuario Desconocido';
      userMap[name] = (userMap[name] || 0) + 1;
    });
    const byUser = Object.entries(userMap).map(([name, tickets]) => ({ name, tickets }));

    // 5. Evolución últimos 7 días
    const evolution = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const creados = allTickets.filter(t => 
        new Date(t.createdAt) >= date && new Date(t.createdAt) < nextDate
      ).length;

      const cerrados = allTickets.filter(t => 
        new Date(t.updatedAt) >= date && new Date(t.updatedAt) < nextDate && 
        (t.status.name.toUpperCase() === 'CERRADO' || t.status.name.toUpperCase() === 'COMPLETADO')
      ).length;

      evolution.push({
        name: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        creados,
        cerrados
      });
    }

    const result = { kpis, byCategory, byUser, evolution };
    console.log('[PrismaTicketRepository] Analytics result:', JSON.stringify(result, null, 2));
    
    return result;
  }

  async update(id: string, ticket: Partial<Ticket>): Promise<Ticket> {
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        title: ticket.title,
        description: ticket.description,
        workflowStateId: ticket.workflowStateId,
        categoryId: ticket.categoryId,
        priority: ticket.priority as any,
        isArchived: ticket.isArchived,
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
