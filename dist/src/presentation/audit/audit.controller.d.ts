import { AuditService } from '../../infrastructure/audit/audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    verify(id: string): Promise<{
        isValid: boolean;
        chain: any[];
    }>;
}
