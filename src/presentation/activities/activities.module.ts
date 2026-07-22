import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ProcessTerraVozUseCase } from '../../application/use-cases/process-terra-voz.use-case';
import { PrismaActivityRepository } from '../../infrastructure/repositories/prisma-activity.repository';
import { PrismaCommitmentRepository } from '../../infrastructure/repositories/prisma-commitment.repository';
import { IActivityRepository } from '../../domain/repositories/activity.repository.interface';
import { ICommitmentRepository } from '../../domain/repositories/commitment.repository.interface';
import { AiModule } from '../../infrastructure/ai/ai.module';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [AiModule, PrismaModule],
  controllers: [ActivitiesController],
  providers: [
    ProcessTerraVozUseCase,
    {
      provide: IActivityRepository,
      useClass: PrismaActivityRepository,
    },
    {
      provide: ICommitmentRepository,
      useClass: PrismaCommitmentRepository,
    },
  ],
  exports: [IActivityRepository, ICommitmentRepository],
})
export class ActivitiesModule {}
