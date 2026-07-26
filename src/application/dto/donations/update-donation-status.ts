import { IsIn, IsOptional, IsString } from 'class-validator';
import type { DonationStatus } from '../../../domain/models/donations/donation';

export class UpdateDonationStatusDto {
  @IsIn([
    'ofrecida',
    'contactada',
    'entrega_coordinada',
    'recibida',
    'no_aceptada',
    'cancelada',
  ])
  status: DonationStatus;

  @IsOptional()
  @IsString()
  internalObservations?: string;
}
