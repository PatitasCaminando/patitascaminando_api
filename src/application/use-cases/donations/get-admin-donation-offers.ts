import { Inject, Injectable } from '@nestjs/common';
import type {
  PaginatedResult,
  PaginationInput,
} from '../../../domain/models/common/pagination';
import type { DonationOffer } from '../../../domain/models/donations/donation';
import {
  DONATION_REPOSITORY,
  type DonationRepositoryPort,
} from '../../../domain/ports/output/donation-repository';

@Injectable()
export class GetAdminDonationOffersUseCase {
  constructor(
    @Inject(DONATION_REPOSITORY)
    private readonly donationRepository: DonationRepositoryPort,
  ) {}

  execute(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<DonationOffer>> {
    return this.donationRepository.findAdminOffers(pagination);
  }
}
