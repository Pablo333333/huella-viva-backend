export class Community {
  constructor(partial: Partial<Community>) {
    Object.assign(this, partial);
  }

  id: string;
  nombre: string;
  poblacion: number;
  location?: number | null; // Float temporal
  boundary?: string | null; // String temporal
  createdAt: Date;
  updatedAt: Date;
}
