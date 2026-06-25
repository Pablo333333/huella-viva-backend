import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
import { OcrService } from '../../infrastructure/ocr/ocr.service';
export declare class UploadDocumentUseCase {
    private readonly documentRepository;
    private readonly ocrService;
    constructor(documentRepository: IDocumentRepository, ocrService: OcrService);
    execute(data: {
        name: string;
        url: string;
        type: string;
        userId: string;
        ticketId?: string;
        tramiteId?: string;
    }): Promise<Document>;
    private processOcr;
}
