import { TramiteType } from '@prisma/client';

export class Tramite {
  constructor(
    public readonly id: string,
    public readonly tipo: TramiteType,
    public readonly remitenteId: string,
    public readonly destinatarioId: string,
    public readonly estadoId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly fechaLimite?: Date,
    public readonly remitenteName?: string,
    public readonly destinatarioName?: string,
    public readonly estadoName?: string,
    public readonly latitude?: number,
    public readonly longitude?: number,
  ) {}
}
