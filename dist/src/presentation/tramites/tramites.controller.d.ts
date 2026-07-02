import { CreateTramiteUseCase } from '../../application/use-cases/create-tramite.use-case';
import { ChangeTramiteStateUseCase } from '../../application/use-cases/change-tramite-state.use-case';
import { SummarizeTramiteUseCase } from '../../application/use-cases/summarize-tramite.use-case';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.use-case';
import { PredictiveService } from '../../infrastructure/predictive/predictive.service';
import { OcrService } from '../../infrastructure/ocr/ocr.service';
import { CreateTramiteDto, UpdateTramiteDto } from '../../application/dtos/tramite.dto';
import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
export declare class TramitesController {
    private readonly createTramiteUseCase;
    private readonly changeTramiteStateUseCase;
    private readonly summarizeTramiteUseCase;
    private readonly createCommentUseCase;
    private readonly uploadDocumentUseCase;
    private readonly predictiveService;
    private readonly ocrService;
    private readonly tramiteRepository;
    private readonly commentRepository;
    private readonly documentRepository;
    constructor(createTramiteUseCase: CreateTramiteUseCase, changeTramiteStateUseCase: ChangeTramiteStateUseCase, summarizeTramiteUseCase: SummarizeTramiteUseCase, createCommentUseCase: CreateCommentUseCase, uploadDocumentUseCase: UploadDocumentUseCase, predictiveService: PredictiveService, ocrService: OcrService, tramiteRepository: ITramiteRepository, commentRepository: ICommentRepository, documentRepository: IDocumentRepository);
    create(req: any, createTramiteDto: CreateTramiteDto): Promise<import("../../domain/entities/tramite.entity").Tramite>;
    findAll(q?: string): Promise<import("../../domain/entities/tramite.entity").Tramite[]>;
    findMy(req: any): Promise<import("../../domain/entities/tramite.entity").Tramite[]>;
    findOne(id: string): Promise<import("../../domain/entities/tramite.entity").Tramite | null>;
    update(id: string, updateTramiteDto: UpdateTramiteDto): Promise<import("../../domain/entities/tramite.entity").Tramite>;
    changeStatus(id: string, newStateId: string, req: any): Promise<void>;
    getSummary(id: string): Promise<{
        summary: string;
    }>;
    createComment(id: string, content: string, req: any): Promise<import("../../domain/entities/comment.entity").Comment>;
    getComments(id: string): Promise<import("../../domain/entities/comment.entity").Comment[]>;
    uploadFile(id: string, file: Express.Multer.File, req: any): Promise<import("../../domain/entities/document.entity").Document>;
    getDocuments(id: string): Promise<import("../../domain/entities/document.entity").Document[]>;
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
    remove(id: string): Promise<void>;
}
