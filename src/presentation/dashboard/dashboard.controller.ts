import { Controller, Get, Query } from '@nestjs/common';
import { GetDashboardMetricsUseCase } from '../../application/use-cases/dashboard/get-dashboard-metrics.use-case';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
  ) {}

  @Get('metrics')
  async getMetrics(
    @Query('communityId') communityId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.getDashboardMetricsUseCase.execute({ communityId, userId });
  }
}
