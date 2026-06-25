import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { CreateTramiteDto } from '../dtos/tramite.dto';
import { Tramite } from '../../domain/entities/tramite.entity';
import { AuditService } from '../../infrastructure/audit/audit.service';
export declare class CreateTramiteUseCase {
    private readonly tramiteRepository;
    private readonly auditService;
    constructor(tramiteRepository: ITramiteRepository, auditService: AuditService);
    execute(remitenteId: string, dto: CreateTramiteDto): Promise<Tramite>;
}
