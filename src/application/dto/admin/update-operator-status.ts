import { IsBoolean } from 'class-validator';

export class UpdateOperatorStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
