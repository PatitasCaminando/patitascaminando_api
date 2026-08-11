import { Inject, Injectable } from '@nestjs/common';
import type { AdoptionApplication } from '../../../domain/models/adoptions/adoption';
import type {
  PaginatedResult,
  PaginationInput,
} from '../../../domain/models/common/pagination';
import {
  ADOPTION_REPOSITORY,
  type AdoptionRepositoryPort,
} from '../../../domain/ports/output/adoption-repository';

@Injectable()
export class GetAdminAdoptionApplicationsUseCase {
  constructor(
    @Inject(ADOPTION_REPOSITORY)
    private readonly adoptionRepository: AdoptionRepositoryPort,
  ) {}

  execute(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<AdoptionApplication>> {
    return this.adoptionRepository.findAdminApplications(pagination);
  }
}
