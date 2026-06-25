import { PrismaService } from '../prisma/prisma.service';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
export declare class PrismaCommentRepository implements ICommentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(comment: Comment): Promise<Comment>;
    findByTicketId(ticketId: string): Promise<Comment[]>;
    findByTramiteId(tramiteId: string): Promise<Comment[]>;
}
