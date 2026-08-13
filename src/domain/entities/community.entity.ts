export class Community {
  constructor(partial: Partial<Community>) {
    Object.assign(this, partial);
  }

  id: string;
  nombre: string;
  poblacion: number;
  location?: number | null; // Legacy lat
  latitude?: number | null;
  longitude?: number | null;
  boundary?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
