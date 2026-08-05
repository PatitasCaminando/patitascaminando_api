import type {
  DonationOffer,
  DonationStatus,
} from '../../models/donations/donation';
import type {
  PaginatedResult,
  PaginationInput,
} from '../../models/common/pagination';

export const DONATION_REPOSITORY = Symbol('DONATION_REPOSITORY');

export interface CreateDonationOfferInput {
  firstNames: string;
  lastNames: string;
  phone: string;
  email: string;
  selectedItems: string[];
  approximateQuantity?: string;
  productName?: string;
  itemCondition?: string;
  expirationDate?: string;
  deliveryAvailability?: string;
  otherDescription?: string;
  descriptionObservation: string;
  dataProcessingAccepted: boolean;
}

export interface UpdateDonationStatusInput {
  status: DonationStatus;
  internalObservations?: string;
}

export interface DonationRepositoryPort {
  createOffer(input: CreateDonationOfferInput): Promise<DonationOffer>;
  findAdminOffers(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<DonationOffer>>;
  updateOfferStatus(
    id: string,
    input: UpdateDonationStatusInput,
  ): Promise<DonationOffer>;
}
