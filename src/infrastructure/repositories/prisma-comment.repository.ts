import { Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Comment>): Promise<Comment> {
    const comment = await this.prisma.comment.create({
      data: {
        content: data.content!,
        userId: data.userId!,
        ticketId: data.ticketId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return {
      ...comment,
      user: comment.user as { name: string; email: string },
    };
  }

  async findByTicketId(ticketId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { ticketId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map(comment => ({
      ...comment,
      user: comment.user as { name: string; email: string },
    }));
  }

  async findById(id: string): Promise<Comment | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    if (!comment) return null;

    return {
      ...comment,
      user: comment.user as { name: string; email: string },
    };
  }
}
