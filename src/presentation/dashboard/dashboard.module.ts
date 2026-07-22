import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { GetDashboardMetricsUseCase } from '../../application/use-cases/dashboard/get-dashboard-metrics.use-case';
import { ActivitiesModule } from '../activities/activities.module';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { ICommunityRepository } from '../../domain/repositories/community.repository.interface';
import { PrismaCommunityRepository } from '../../infrastructure/repositories/prisma-community.repository';

@Module({
  imports: [ActivitiesModule, PrismaModule],
  controllers: [DashboardController],
  providers: [
    GetDashboardMetricsUseCase,
    {
      provide: ICommunityRepository,
      useClass: PrismaCommunityRepository,
    },
  ],
})
export class DashboardModule {}
