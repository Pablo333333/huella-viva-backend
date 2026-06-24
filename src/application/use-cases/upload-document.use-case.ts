import { Inject, Injectable } from '@nestjs/common';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';
import { OcrService } from '../../infrastructure/ocr/ocr.service';

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    @Inject(IDocumentRepository)
    private readonly documentRepository: IDocumentRepository,
    private readonly ocrService: OcrService,
  ) {}

  async execute(data: { name: string; url: string; type: string; userId: string; ticketId?: string; tramiteId?: string }): Promise<Document> {
    const document = new Document({
      name: data.name,
      url: data.url,
      type: data.type,
      userId: data.userId,
      ticketId: data.ticketId,
      tramiteId: data.tramiteId,
    });

    const createdDocument = await this.documentRepository.create(document);

    // Disparar OCR en segundo plano si es una imagen o PDF
    if (data.type.includes('image') || data.type.includes('pdf')) {
      this.processOcr(createdDocument.id, data.url);
    }

    return createdDocument;
  }

  private async processOcr(documentId: string, fileUrl: string) {
    // El fileUrl suele ser algo como /uploads/filename.ext
    // Necesitamos la ruta física
    const filePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    
    try {
      const text = await this.ocrService.extractText(filePath);
      if (text) {
        // Actualizar el documento con el texto extraído
        // Aquí necesitaríamos un método update en el repositorio
        // Por ahora lo haremos directamente si el repositorio lo permite o añadiremos el método
        await this.documentRepository.updateExtractedText(documentId, text);
      }
    } catch (error) {
      console.error('Error procesando OCR en segundo plano:', error);
    }
  }
}
