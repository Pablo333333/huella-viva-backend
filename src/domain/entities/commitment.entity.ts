export type CommitmentStatus = 'PROGRAMADO' | 'EN_PROCESO' | 'CUMPLIDO';

export class Commitment {
  constructor(partial: Partial<Commitment>) {
    Object.assign(this, partial);
  }

  id: string;
  descripcion: string;
  responsable: string;
  fecha_cumplimiento?: Date | null;
  estado: CommitmentStatus;
  activityId: string;
  createdAt: Date;
  updatedAt: Date;
}
