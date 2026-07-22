export type ActivityType = 'REUNION' | 'INSPECCION' | 'VISITA' | 'TALLER' | 'OTRO';

export class Activity {
  constructor(partial: Partial<Activity>) {
    Object.assign(this, partial);
  }

  id: string;
  tipo: ActivityType;
  descripcion: string;
  fecha: Date;
  audioUrl?: string | null;
  fotoUrl?: string | null;
  location?: number | null; // Float temporal
  userId: string;
  communityId: string;
  createdAt: Date;
  updatedAt: Date;
}
