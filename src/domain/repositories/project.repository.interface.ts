import { Project } from '../entities/project.entity';

export interface IProjectRepository {
  create(project: Partial<Project>): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findAll(filters?: { communityId?: string; type?: string; status?: string }): Promise<Project[]>;
  update(id: string, project: Partial<Project>): Promise<Project>;
  delete(id: string): Promise<void>;
}

export const IProjectRepository = Symbol('IProjectRepository');
