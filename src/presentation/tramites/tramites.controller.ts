import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { Role } from '@prisma/client';
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
import { Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('tramites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TramitesController {
  constructor(
    private readonly createTramiteUseCase: CreateTramiteUseCase,
    private readonly changeTramiteStateUseCase: ChangeTramiteStateUseCase,
    private readonly summarizeTramiteUseCase: SummarizeTramiteUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly predictiveService: PredictiveService,
    private readonly ocrService: OcrService,
    @Inject(ITramiteRepository)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    @Inject(IDocumentRepository)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  create(@Request() req: any, @Body() createTramiteDto: CreateTramiteDto) {
    return this.createTramiteUseCase.execute(req.user.userId, createTramiteDto);
  }

  @Get()
  findAll(@Query('q') q?: string) {
    return this.tramiteRepository.findAll({ q });
  }

  @Get('my')
  findMy(@Request() req: any) {
    return this.tramiteRepository.findByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tramiteRepository.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  update(@Param('id') id: string, @Body() updateTramiteDto: UpdateTramiteDto) {
    const data = {
      ...updateTramiteDto,
      fechaLimite: updateTramiteDto.fechaLimite ? new Date(updateTramiteDto.fechaLimite) : undefined,
    };
    return this.tramiteRepository.update(id, data as any);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  changeStatus(@Param('id') id: string, @Body('newStateId') newStateId: string, @Request() req: any) {
    return this.changeTramiteStateUseCase.execute(id, newStateId, req.user.userId);
  }

  @Get(':id/summary')
  async getSummary(@Param('id') id: string) {
    const summary = await this.summarizeTramiteUseCase.execute(id);
    return { summary };
  }

  @Post(':id/comments')
  createComment(@Param('id') id: string, @Body('content') content: string, @Request() req: any) {
    return this.createCommentUseCase.execute({
      content,
      userId: req.user.userId,
      tramiteId: id,
    });
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.commentRepository.findByTramiteId(id);
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
  uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.uploadDocumentUseCase.execute({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
      userId: req.user.userId,
      tramiteId: id,
    });
  }

  @Get(':id/documents')
  getDocuments(@Param('id') id: string) {
    return this.documentRepository.findByTramiteId(id);
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

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.tramiteRepository.delete(id);
  }
}
