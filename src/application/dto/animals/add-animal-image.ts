import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class AddAnimalImageDto {
  @IsString()
  mediaId: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}
