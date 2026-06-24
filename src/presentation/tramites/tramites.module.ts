import { Module } from '@nestjs/common';
import { TramitesController } from './tramites.controller';
import { CreateTramiteUseCase } from '../../application/use-cases/create-tramite.use-case';
import { ChangeTramiteStateUseCase } from '../../application/use-cases/change-tramite-state.use-case';
import { SummarizeTramiteUseCase } from '../../application/use-cases/summarize-tramite.use-case';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.use-case';
import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { IDocumentRepository } from '../../domain/repositories/document.repository.interface';
import { PrismaTramiteRepository } from '../../infrastructure/repositories/prisma-tramite.repository';
import { PrismaCommentRepository } from '../../infrastructure/repositories/prisma-comment.repository';
import { PrismaDocumentRepository } from '../../infrastructure/repositories/prisma-document.repository';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AiModule } from '../../infrastructure/ai/ai.module';
import { OcrModule } from '../../infrastructure/ocr/ocr.module';
import { PredictiveModule } from '../../infrastructure/predictive/predictive.module';
import { AuditModule } from '../../infrastructure/audit/audit.module';

@Module({
  imports: [PrismaModule, AiModule, OcrModule, PredictiveModule, AuditModule],
  controllers: [TramitesController],
  providers: [
    CreateTramiteUseCase,
    ChangeTramiteStateUseCase,
    SummarizeTramiteUseCase,
    CreateCommentUseCase,
    UploadDocumentUseCase,
    {
      provide: ITramiteRepository,
      useClass: PrismaTramiteRepository,
    },
    {
      provide: ICommentRepository,
      useClass: PrismaCommentRepository,
    },
    {
      provide: IDocumentRepository,
      useClass: PrismaDocumentRepository,
    },
  ],
  exports: [ITramiteRepository],
})
export class TramitesModule {}
