import { Inject, Injectable } from '@nestjs/common';
import {
  SITE_SECTION_REPOSITORY,
  type SiteSectionRepositoryPort,
} from '../../../domain/ports/output/site-section-repository';

@Injectable()
export class DeleteSiteSectionUseCase {
  constructor(
    @Inject(SITE_SECTION_REPOSITORY)
    private readonly siteSectionRepository: SiteSectionRepositoryPort,
  ) {}

  execute(id: string): Promise<void> {
    return this.siteSectionRepository.deleteSection(id);
  }
}
