import { Inject, Injectable } from '@nestjs/common';
import { IActivityRepository } from '../../../domain/repositories/activity.repository.interface';
import { ICommitmentRepository } from '../../../domain/repositories/commitment.repository.interface';
import { ICommunityRepository } from '../../../domain/repositories/community.repository.interface';

export interface DashboardMetricsFilters {
  communityId?: string;
  userId?: string;
}

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

  async execute(filters: DashboardMetricsFilters = {}) {
    const activities = await this.activityRepository.findAll({
      communityId: filters.communityId,
      userId: filters.communityId ? undefined : filters.userId,
    });
    const catalogCommunities = await this.communityRepository.findAll();

    const allCommitments = [];
    for (const activity of activities) {
      const commitments = await this.commitmentRepository.findByActivityId(activity.id);
      allCommitments.push(...commitments);
    }

    const totalActivities = activities.length;
    const programadasCount = activities.filter((a) => a.estado === 'PROGRAMADA').length;
    const ejecutadasCount = activities.filter((a) => a.estado === 'EJECUTADA').length;

    const activeCommunityIds = new Set(activities.map((a) => a.communityId));
    const totalCommunities = filters.communityId
      ? Math.max(activeCommunityIds.size, filters.communityId ? 1 : 0)
      : catalogCommunities.length;
    const activeCommunities = activeCommunityIds.size;

    const fulfilledCommitments = allCommitments.filter((c) => c.estado === 'CUMPLIDO').length;
    const totalCommitments = allCommitments.length;
    const hitos = fulfilledCommitments;

    const confidenceIndex =
      totalCommitments > 0
        ? Math.round((fulfilledCommitments / totalCommitments) * 100)
        : 0;

    const activityTypes = {
      REUNION: activities.filter((a) => a.tipo === 'REUNION').length,
      VISITA: activities.filter((a) => a.tipo === 'VISITA').length,
      INSPECCION: activities.filter((a) => a.tipo === 'INSPECCION').length,
      TALLER: activities.filter((a) => a.tipo === 'TALLER').length,
      OTRO: activities.filter((a) => a.tipo === 'OTRO').length,
    };

    return {
      kpis: {
        totalActivities,
        programadasCount,
        ejecutadasCount,
        totalCommunities,
        activeCommunities,
        totalCommitments,
        fulfilledCommitments,
        hitos,
        confidenceIndex,
      },
      distribution: Object.entries(activityTypes).map(([name, value]) => ({
        name,
        value,
      })),
      recentActivitiesCount: activities.filter((a) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(a.fecha) >= weekAgo;
      }).length,
    };
  }
}
