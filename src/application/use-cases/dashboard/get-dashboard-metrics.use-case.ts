import { Inject, Injectable } from '@nestjs/common';
import { IActivityRepository } from '../../../domain/repositories/activity.repository.interface';
import { ICommitmentRepository } from '../../../domain/repositories/commitment.repository.interface';
import { ICommunityRepository } from '../../../domain/repositories/community.repository.interface';

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(
    @Inject(IActivityRepository)
    private readonly activityRepository: IActivityRepository,
    @Inject(ICommitmentRepository)
    private readonly commitmentRepository: ICommitmentRepository,
    @Inject(ICommunityRepository)
    private readonly communityRepository: ICommunityRepository,
  ) {}

  async execute() {
    const activities = await this.activityRepository.findAll();
    const communities = await this.communityRepository.findAll();
    
    // Obtenemos todos los compromisos de todas las actividades
    let allCommitments = [];
    for (const activity of activities) {
      const commitments = await this.commitmentRepository.findByActivityId(activity.id);
      allCommitments.push(...commitments);
    }

    const totalActivities = activities.length;
    const totalCommunities = communities.length;
    
    const fulfilledCommitments = allCommitments.filter(c => c.estado === 'CUMPLIDO').length;
    const totalCommitments = allCommitments.length;
    
    const confidenceIndex = totalCommitments > 0 
      ? Math.round((fulfilledCommitments / totalCommitments) * 100) 
      : 0;

    // Distribución de actividades por tipo
    const activityTypes = {
      REUNION: activities.filter(a => a.tipo === 'REUNION').length,
      VISITA: activities.filter(a => a.tipo === 'VISITA').length,
      INSPECCION: activities.filter(a => a.tipo === 'INSPECCION').length,
      TALLER: activities.filter(a => a.tipo === 'TALLER').length,
    };

    return {
      kpis: {
        totalActivities,
        totalCommunities,
        totalCommitments,
        fulfilledCommitments,
        confidenceIndex,
      },
      distribution: Object.entries(activityTypes).map(([name, value]) => ({ name, value })),
      recentActivitiesCount: activities.filter(a => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(a.fecha) >= weekAgo;
      }).length,
    };
  }
}
