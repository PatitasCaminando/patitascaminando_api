import { Body, Controller, Post } from '@nestjs/common';
import { CreateAdoptionApplicationDto } from '../../../application/dto/adoptions/create-adoption-application';
import { CreateAdoptionApplicationUseCase } from '../../../application/use-cases/adoptions/create-adoption-application';
import type { AdoptionApplication } from '../../../domain/models/adoptions/adoption';

@Controller('public/adoptions')
export class PublicAdoptionsController {
  constructor(
    private readonly createAdoptionApplicationUseCase: CreateAdoptionApplicationUseCase,
  ) {}

  @Post('applications')
  createApplication(
    @Body() body: CreateAdoptionApplicationDto,
  ): Promise<AdoptionApplication> {
    return this.createAdoptionApplicationUseCase.execute(body);
  }
}
