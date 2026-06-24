import { Tramite } from '../entities/tramite.entity';

export interface ITramiteRepository {
  create(tramite: Partial<Tramite>): Promise<Tramite>;
  findAll(filters?: { q?: string }): Promise<Tramite[]>;
  findById(id: string): Promise<Tramite | null>;
  update(id: string, tramite: Partial<Tramite>): Promise<Tramite>;
  delete(id: string): Promise<void>;
  findByUser(userId: string): Promise<Tramite[]>;
}

export const ITramiteRepository = Symbol('ITramiteRepository');
