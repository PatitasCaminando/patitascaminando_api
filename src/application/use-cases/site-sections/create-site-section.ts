import { Inject, Injectable } from '@nestjs/common';
import type { SiteSection } from '../../../domain/models/site-sections/site-section';
import {
  SITE_SECTION_REPOSITORY,
  type CreateSiteSectionInput,
  type SiteSectionRepositoryPort,
} from '../../../domain/ports/output/site-section-repository';

@Injectable()
export class CreateSiteSectionUseCase {
  constructor(
    @Inject(SITE_SECTION_REPOSITORY)
    private readonly siteSectionRepository: SiteSectionRepositoryPort,
  ) {}

  execute(input: CreateSiteSectionInput): Promise<SiteSection> {
    return this.siteSectionRepository.createSection(input);
  }
}
