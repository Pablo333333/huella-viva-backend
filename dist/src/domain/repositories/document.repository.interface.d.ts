import { Document } from '../entities/document.entity';
export interface IDocumentRepository {
    create(document: Document): Promise<Document>;
    findById(id: string): Promise<Document | null>;
    findByTicketId(ticketId: string): Promise<Document[]>;
    findByTramiteId(tramiteId: string): Promise<Document[]>;
    updateExtractedText(id: string, text: string): Promise<void>;
    delete(id: string): Promise<void>;
}
export declare const IDocumentRepository: unique symbol;
