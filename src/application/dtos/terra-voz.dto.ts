import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

function toOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

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

  /** Latitud GPS del dispositivo (multipart llega como string). */
  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsNumber()
  latitude?: number;

  /** Longitud GPS del dispositivo. */
  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsNumber()
  longitude?: number;
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
    latitude?: number | null;
    longitude?: number | null;
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
