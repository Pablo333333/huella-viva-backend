import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { Document } from '../../domain/entities/document.entity';

@Injectable()
export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(document: Document): Promise<Document> {
    const created = await this.prisma.document.create({
      data: {
        name: document.name,
        url: document.url,
        type: document.type,
        userId: document.userId,
        ticketId: document.ticketId,
        tramiteId: document.tramiteId,
      },
    });

    return new Document(created);
  }

  async findById(id: string): Promise<Document | null> {
    const doc = await this.prisma.document.findUnique({
      where: { id },
    });

    return doc ? new Document(doc) : null;
  }

  async findByTicketId(ticketId: string): Promise<Document[]> {
    const docs = await this.prisma.document.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d) => new Document(d));
  }

  async findByTramiteId(tramiteId: string): Promise<Document[]> {
    const docs = await this.prisma.document.findMany({
      where: { tramiteId },
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d) => new Document(d));
  }

  async updateExtractedText(id: string, text: string): Promise<void> {
    await this.prisma.document.update({
      where: { id },
      data: { extractedText: text },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({
      where: { id },
    });
  }
}
