import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
export declare class GetTicketDocumentsUseCase {
    private readonly documentRepository;
    constructor(documentRepository: IDocumentRepository);
    execute(ticketId: string): Promise<Document[]>;
}
