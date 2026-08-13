export type ActivityType = 'REUNION' | 'INSPECCION' | 'VISITA' | 'TALLER' | 'OTRO';
export type ActivityStatus = 'PROGRAMADA' | 'EJECUTADA';

export class Activity {
  constructor(partial: Partial<Activity>) {
    Object.assign(this, partial);
  }

  id: string;
  tipo: ActivityType;
  descripcion: string;
  fecha: Date;
  estado: ActivityStatus;
  audioUrl?: string | null;
  fotoUrl?: string | null;
  location?: number | null; // Legacy lat
  latitude?: number | null;
  longitude?: number | null;
  userId: string;
  communityId: string;
  communityName?: string;
  commitments?: unknown[];
  createdAt: Date;
  updatedAt: Date;
}
