import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class ProcessTerraVozDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsString()
  @IsOptional()
  communityId?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export interface TerraVozParsedData {
  tipo: 'REUNION' | 'INSPECCION' | 'VISITA' | 'TALLER' | 'OTRO';
  descripcion: string;
  fecha: string;
  comunidadNombre?: string | null;
  commitments: {
    descripcion: string;
    responsable: string;
    fecha_cumplimiento?: string;
  }[];
}

export interface TerraVozResult {
  activity: {
    id: string;
    tipo: string;
    descripcion: string;
    fecha: Date;
    audioUrl?: string | null;
    fotoUrl?: string | null;
    location?: number | null;
    userId: string;
    communityId: string;
    commitments?: unknown[];
    createdAt?: Date;
    updatedAt?: Date;
  };
  commitmentsCreated: number;
  communityName?: string;
  transcript: string;
  message: string;
}
