import { PrismaService } from '../prisma/prisma.service';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
export declare class PrismaDocumentRepository implements IDocumentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(document: Document): Promise<Document>;
    findById(id: string): Promise<Document | null>;
    findByTicketId(ticketId: string): Promise<Document[]>;
    findByTramiteId(tramiteId: string): Promise<Document[]>;
    updateExtractedText(id: string, text: string): Promise<void>;
    delete(id: string): Promise<void>;
}
