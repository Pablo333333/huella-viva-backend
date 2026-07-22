import { Commitment } from '../entities/commitment.entity';

export interface ICommitmentRepository {
  create(commitment: Partial<Commitment>): Promise<Commitment>;
  findByActivityId(activityId: string): Promise<Commitment[]>;
  update(id: string, commitment: Partial<Commitment>): Promise<Commitment>;
  delete(id: string): Promise<void>;
}

export const ICommitmentRepository = Symbol('ICommitmentRepository');
