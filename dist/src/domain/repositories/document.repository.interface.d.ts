import { Document } from '../entities/document.entity';
export interface IDocumentRepository {
    create(data: Partial<Document>): Promise<Document>;
    findByTicketId(ticketId: string): Promise<Document[]>;
    findById(id: string): Promise<Document | null>;
}
export declare const IDocumentRepository: unique symbol;
