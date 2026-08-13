import { Activity } from '../entities/activity.entity';

export interface IActivityRepository {
  create(activity: Partial<Activity>): Promise<Activity>;
  findById(id: string): Promise<Activity | null>;
  findAll(filters?: {
    communityId?: string;
    userId?: string;
    type?: string;
    estado?: string;
  }): Promise<Activity[]>;
  update(id: string, activity: Partial<Activity>): Promise<Activity>;
  delete(id: string): Promise<void>;
  getTimeline(communityId: string): Promise<Activity[]>;
}

export const IActivityRepository = Symbol('IActivityRepository');
