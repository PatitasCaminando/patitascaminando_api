import type {
  AdoptionApplication,
  AdoptionStatus,
} from '../../models/adoptions/adoption';
import type {
  PaginatedResult,
  PaginationInput,
} from '../../models/common/pagination';

export const ADOPTION_REPOSITORY = Symbol('ADOPTION_REPOSITORY');

export interface CreateAdoptionApplicationInput {
  firstNames: string;
  lastNames: string;
  phone: string;
  email: string;
  desiredAnimalDescription: string;
  adoptionReason: string;
  specificAnimalId?: string;
  additionalMessage?: string;
  dataProcessingAccepted: boolean;
}

export interface UpdateAdoptionStatusInput {
  status: AdoptionStatus;
  internalObservations?: string;
  changedBy?: string;
}

export interface AdoptionRepositoryPort {
  createApplication(
    input: CreateAdoptionApplicationInput,
  ): Promise<AdoptionApplication>;
  findAdminApplications(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<AdoptionApplication>>;
  updateApplicationStatus(
    id: string,
    input: UpdateAdoptionStatusInput,
  ): Promise<AdoptionApplication>;
}
