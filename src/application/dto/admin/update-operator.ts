import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateOperatorDto {
  @IsOptional()
  @IsString()
  firstNames?: string;

  @IsOptional()
  @IsString()
  lastNames?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  receiveFormNotifications?: boolean;
}
