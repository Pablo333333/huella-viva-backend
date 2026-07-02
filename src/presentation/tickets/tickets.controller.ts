import { Controller, Post, Body, UseGuards, Patch, Param, Get, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { OcrService } from '../../infrastructure/ocr/ocr.service';
import { PredictiveService } from '../../infrastructure/predictive/predictive.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly changeTicketStateUseCase: ChangeTicketStateUseCase,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly getTicketDocumentsUseCase: GetTicketDocumentsUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly getTicketCommentsUseCase: GetTicketCommentsUseCase,
    private readonly generateDocumentUseCase: GenerateDocumentUseCase,
    private readonly summarizeTicketConversationUseCase: SummarizeTicketConversationUseCase,
    private readonly prisma: PrismaService,
    private readonly ocrService: OcrService,
    private readonly predictiveService: PredictiveService,
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    @Inject(ITicketHistoryRepository)
    private readonly ticketHistoryRepository: ITicketHistoryRepository,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERARIO)
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.createTicketUseCase.execute(createTicketDto, user.userId);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeTicketStatusDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.changeTicketStateUseCase.execute(id, dto.newStateId, user.userId);
  }

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('workflowStateId') workflowStateId?: string,
    @Query('q') q?: string,
  ) {
    if (q) {
      return this.ticketRepository.findAll({ categoryId, workflowStateId, q });
    }
    return this.ticketRepository.findAll({ categoryId, workflowStateId });
  }

  @Get('stats')
  async getStats() {
    return this.ticketRepository.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketRepository.findById(id);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return this.ticketHistoryRepository.findByTicketId(id);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req: any, file: any, cb: any) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { userId: string },
  ) {
    const existingDoc = await this.prisma.document.findFirst({
      where: {
        ticketId: id,
        name: file.originalname,
        isLatest: true,
      },
    });

    let version = 1;
    if (existingDoc) {
      version = existingDoc.version + 1;
      await this.prisma.document.update({
        where: { id: existingDoc.id },
        data: { isLatest: false },
      });
    }

    return this.uploadDocumentUseCase.execute({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
      userId: user.userId,
      ticketId: id,
      version,
      isLatest: true,
    } as any);
  }

  @Get(':id/documents')
  async getDocuments(@Param('id') id: string) {
    return this.getTicketDocumentsUseCase.execute(id);
  }

  @Post(':id/comments')
  async createComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.createCommentUseCase.execute({
      content,
      userId: user.userId,
      ticketId: id,
    });
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.getTicketCommentsUseCase.execute(id);
  }

  @Post(':id/summarize')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  async summarize(@Param('id') id: string) {
    return { summary: await this.summarizeTicketConversationUseCase.execute(id) };
  }

  @Get(':id/generate-pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.generateDocumentUseCase.execute(id);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Post('analyze-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req: any, file: any, cb: any) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    const text = await this.ocrService.extractText(file.path);
    if (!text) return { error: 'No se pudo extraer texto de la imagen' };
    
    const suggestions = await this.predictiveService.analyzeDocumentText(text);
    return { ...suggestions, extractedText: text };
  }
}
