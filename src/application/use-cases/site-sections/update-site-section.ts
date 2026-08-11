import { Inject, Injectable } from '@nestjs/common';
import type { SiteSection } from '../../../domain/models/site-sections/site-section';
import {
  SITE_SECTION_REPOSITORY,
  type SiteSectionRepositoryPort,
  type UpdateSiteSectionInput,
} from '../../../domain/ports/output/site-section-repository';

@Injectable()
export class UpdateSiteSectionUseCase {
  constructor(
    @Inject(SITE_SECTION_REPOSITORY)
    private readonly siteSectionRepository: SiteSectionRepositoryPort,
  ) {}

  execute(id: string, input: UpdateSiteSectionInput): Promise<SiteSection> {
    return this.siteSectionRepository.updateSection(id, input);
  }
}
