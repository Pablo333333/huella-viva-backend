import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
import { PrismaService } from '../prisma/prisma.service';
export declare class PrismaDocumentRepository implements IDocumentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<Document>): Promise<Document>;
    findByTicketId(ticketId: string): Promise<Document[]>;
    findById(id: string): Promise<Document | null>;
}
