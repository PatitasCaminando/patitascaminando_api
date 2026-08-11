import { Body, Controller, Post } from '@nestjs/common';
import { CreateDonationOfferDto } from '../../../application/dto/donations/create-donation-offer';
import { CreateDonationOfferUseCase } from '../../../application/use-cases/donations/create-donation-offer';
import type { DonationOffer } from '../../../domain/models/donations/donation';

@Controller('public/donations')
export class PublicDonationsController {
  constructor(
    private readonly createDonationOfferUseCase: CreateDonationOfferUseCase,
  ) {}

  @Post('offers')
  createOffer(@Body() body: CreateDonationOfferDto): Promise<DonationOffer> {
    return this.createDonationOfferUseCase.execute(body);
  }
}
