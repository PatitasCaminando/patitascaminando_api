import { Inject, Injectable } from '@nestjs/common';
import type { DonationOffer } from '../../../domain/models/donations/donation';
import {
  DONATION_REPOSITORY,
  type DonationRepositoryPort,
  type UpdateDonationStatusInput,
} from '../../../domain/ports/output/donation-repository';

@Injectable()
export class UpdateDonationStatusUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY)
    private readonly donationRepository: DonationRepositoryPort,
  ) {}

  execute(
    id: string,
    input: UpdateDonationStatusInput,
  ): Promise<DonationOffer> {
    return this.donationRepository.updateOfferStatus(id, input);
  }
}
