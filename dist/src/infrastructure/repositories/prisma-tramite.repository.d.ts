import { PrismaService } from '../prisma/prisma.service';
import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { Tramite } from '../../domain/entities/tramite.entity';
export declare class PrismaTramiteRepository implements ITramiteRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: Partial<Tramite>): Promise<Tramite>;
    findAll(filters?: {
        q?: string;
    }): Promise<Tramite[]>;
    findById(id: string): Promise<Tramite | null>;
    update(id: string, data: Partial<Tramite>): Promise<Tramite>;
    delete(id: string): Promise<void>;
    findByUser(userId: string): Promise<Tramite[]>;
    private mapToEntity;
}
