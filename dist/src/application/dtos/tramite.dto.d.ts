import { TramiteType } from '@prisma/client';
export declare class CreateTramiteDto {
    tipo: TramiteType;
    destinatarioId: string;
    estadoId: string;
    fechaLimite?: string;
}
export declare class UpdateTramiteDto {
    tipo?: TramiteType;
    destinatarioId?: string;
    estadoId?: string;
    fechaLimite?: string;
}
