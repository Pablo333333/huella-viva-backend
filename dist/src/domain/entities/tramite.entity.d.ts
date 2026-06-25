import { TramiteType } from '@prisma/client';
export declare class Tramite {
    readonly id: string;
    readonly tipo: TramiteType;
    readonly remitenteId: string;
    readonly destinatarioId: string;
    readonly estadoId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly fechaLimite: Date | null;
    readonly remitenteName?: string | undefined;
    readonly destinatarioName?: string | undefined;
    readonly estadoName?: string | undefined;
    constructor(id: string, tipo: TramiteType, remitenteId: string, destinatarioId: string, estadoId: string, createdAt: Date, updatedAt: Date, fechaLimite: Date | null, remitenteName?: string | undefined, destinatarioName?: string | undefined, estadoName?: string | undefined);
}
