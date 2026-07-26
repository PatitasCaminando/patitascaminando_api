import { IsIn, IsOptional, IsString } from 'class-validator';
import type { AdoptionStatus } from '../../../domain/models/adoptions/adoption';

export class UpdateAdoptionStatusDto {
  @IsIn([
    'recibida',
    'contactada',
    'cita_programada',
    'aprobada',
    'rechazada',
    'cancelada',
  ])
  status: AdoptionStatus;

  @IsOptional()
  @IsString()
  internalObservations?: string;
}
