export type ProjectStatus = 'CULMINADO' | 'EN_GESTION' | 'EN_EJECUCION';
export type ProjectType = 'EDUCACION' | 'SALUD' | 'AGUA' | 'SANEAMIENTO' | 'INFRAESTRUCTURA' | 'OTROS';

export class Project {
  constructor(partial: Partial<Project>) {
    Object.assign(this, partial);
  }

  id: string;
  nombre: string;
  tipo: ProjectType;
  presupuesto: number;
  financiador?: string | null;
  estado: ProjectStatus;
  communityId: string;
  createdAt: Date;
  updatedAt: Date;
}
