import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAdoptionApplicationDto {
  @IsString()
  firstNames: string;

  @IsString()
  lastNames: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  desiredAnimalDescription: string;

  @IsString()
  adoptionReason: string;

  @IsOptional()
  @IsUUID()
  specificAnimalId?: string;

  @IsOptional()
  @IsString()
  additionalMessage?: string;

  @IsBoolean()
  dataProcessingAccepted: boolean;
}
