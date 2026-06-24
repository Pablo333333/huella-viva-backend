import { Inject, Injectable } from '@nestjs/common';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';

@Injectable()
export class GetTicketDocumentsUseCase {
  constructor(
    @Inject(IDocumentRepository)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(ticketId: string): Promise<Document[]> {
    return this.documentRepository.findByTicketId(ticketId);
  }
}
