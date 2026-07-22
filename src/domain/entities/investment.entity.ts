export class Investment {
  constructor(partial: Partial<Investment>) {
    Object.assign(this, partial);
  }

  id: string;
  descripcion: string;
  monto: number;
  location?: number | null; // Float temporal
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}
