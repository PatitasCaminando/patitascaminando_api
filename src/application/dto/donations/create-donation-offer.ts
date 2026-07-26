import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDonationOfferDto {
  @IsString()
  firstNames: string;

  @IsString()
  lastNames: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  selectedItems: string[];

  @IsOptional()
  @IsString()
  approximateQuantity?: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  itemCondition?: string;

  @IsOptional()
  @IsString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  deliveryAvailability?: string;

  @IsOptional()
  @IsString()
  otherDescription?: string;

  @IsString()
  descriptionObservation: string;

  @IsBoolean()
  dataProcessingAccepted: boolean;
}
