import { Inject, Injectable } from '@nestjs/common';
import type { DonationOffer } from '../../../domain/models/donations/donation';
import {
  DONATION_REPOSITORY,
  type CreateDonationOfferInput,
  type DonationRepositoryPort,
} from '../../../domain/ports/output/donation-repository';

@Injectable()
export class CreateDonationOfferUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY)
    private readonly donationRepository: DonationRepositoryPort,
  ) {}

  execute(input: CreateDonationOfferInput): Promise<DonationOffer> {
    return this.donationRepository.createOffer(input);
  }
}
