import { Community } from '../entities/community.entity';

export interface ICommunityRepository {
  create(community: Partial<Community>): Promise<Community>;
  findById(id: string): Promise<Community | null>;
  findAll(): Promise<Community[]>;
  findNearest(
    latitude: number,
    longitude: number,
    maxDistanceKm?: number,
  ): Promise<Community | null>;
  update(id: string, community: Partial<Community>): Promise<Community>;
  delete(id: string): Promise<void>;
}

export const ICommunityRepository = Symbol('ICommunityRepository');
