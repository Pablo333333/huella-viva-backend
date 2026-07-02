import type { Response } from 'express';
import { CreateTicketUseCase } from '../../application/use-cases/create-ticket.use-case';
import { ChangeTicketStateUseCase } from '../../application/use-cases/change-ticket-state.use-case';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.use-case';
import { GetTicketDocumentsUseCase } from '../../application/use-cases/get-ticket-documents.use-case';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { GetTicketCommentsUseCase } from '../../application/use-cases/get-ticket-comments.use-case';
import { GenerateDocumentUseCase } from '../../application/use-cases/generate-document.use-case';
import { SummarizeTicketConversationUseCase } from '../../application/use-cases/summarize-ticket-conversation.use-case';
import { CreateTicketDto } from '../../application/dtos/create-ticket.dto';
import { ChangeTicketStatusDto } from '../../application/dtos/change-ticket-status.dto';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OcrService } from '../../infrastructure/ocr/ocr.service';
import { PredictiveService } from '../../infrastructure/predictive/predictive.service';
import { CloudinaryService } from '../../infrastructure/documents/cloudinary.service';
export declare class TicketsController {
    private readonly createTicketUseCase;
    private readonly changeTicketStateUseCase;
    private readonly uploadDocumentUseCase;
    private readonly getTicketDocumentsUseCase;
    private readonly createCommentUseCase;
    private readonly getTicketCommentsUseCase;
    private readonly generateDocumentUseCase;
    private readonly summarizeTicketConversationUseCase;
    private readonly prisma;
    private readonly ocrService;
    private readonly predictiveService;
    private readonly cloudinaryService;
    private readonly ticketRepository;
    private readonly ticketHistoryRepository;
    constructor(createTicketUseCase: CreateTicketUseCase, changeTicketStateUseCase: ChangeTicketStateUseCase, uploadDocumentUseCase: UploadDocumentUseCase, getTicketDocumentsUseCase: GetTicketDocumentsUseCase, createCommentUseCase: CreateCommentUseCase, getTicketCommentsUseCase: GetTicketCommentsUseCase, generateDocumentUseCase: GenerateDocumentUseCase, summarizeTicketConversationUseCase: SummarizeTicketConversationUseCase, prisma: PrismaService, ocrService: OcrService, predictiveService: PredictiveService, cloudinaryService: CloudinaryService, ticketRepository: ITicketRepository, ticketHistoryRepository: ITicketHistoryRepository);
    create(createTicketDto: CreateTicketDto, user: {
        userId: string;
    }, file?: Express.Multer.File): Promise<import("../../domain/entities/ticket.entity").Ticket>;
    changeStatus(id: string, dto: ChangeTicketStatusDto, user: {
        userId: string;
    }): Promise<void>;
    findAll(categoryId?: string, workflowStateId?: string, q?: string): Promise<import("../../domain/entities/ticket.entity").Ticket[]>;
    getStats(): Promise<any>;
    findOne(id: string): Promise<import("../../domain/entities/ticket.entity").Ticket | null>;
    getHistory(id: string): Promise<import("../../domain/entities/ticket-history.entity").TicketHistory[]>;
    uploadFile(id: string, file: Express.Multer.File, user: {
        userId: string;
    }): Promise<import("../../domain/entities/document.entity").Document>;
    getDocuments(id: string): Promise<import("../../domain/entities/document.entity").Document[]>;
    createComment(id: string, content: string, user: {
        userId: string;
    }): Promise<import("../../domain/entities/comment.entity").Comment>;
    getComments(id: string): Promise<import("../../domain/entities/comment.entity").Comment[]>;
    summarize(id: string): Promise<{
        summary: string;
    }>;
    generatePdf(id: string, res: Response): Promise<void>;
    analyzeImage(file: Express.Multer.File): Promise<{
        error: string;
    } | {
        extractedText: string;
        tipo: string;
        prioridad: "URGENTE" | "MEDIA" | "BAJA";
        responsableSugerido?: string;
        resumen: string;
        titulo?: string;
        error?: undefined;
    }>;
}
