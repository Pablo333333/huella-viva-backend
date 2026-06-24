import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(comment: Comment): Promise<Comment> {
    const created = await this.prisma.comment.create({
      data: {
        content: comment.content,
        ticketId: comment.ticketId,
        tramiteId: comment.tramiteId,
        userId: comment.userId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return new Comment(created);
  }

  async findByTicketId(ticketId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { ticketId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => new Comment(c));
  }

  async findByTramiteId(tramiteId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { tramiteId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => new Comment(c));
  }
}
