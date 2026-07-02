import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
import { PrismaService } from '../prisma/prisma.service';
export declare class PrismaCommentRepository implements ICommentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<Comment>): Promise<Comment>;
    findByTicketId(ticketId: string): Promise<Comment[]>;
    findById(id: string): Promise<Comment | null>;
}
