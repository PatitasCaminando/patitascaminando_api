import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateAdoptionApplicationDto } from '../../../application/dto/adoptions/create-adoption-application';
import { CreateAdoptionApplicationUseCase } from '../../../application/use-cases/adoptions/create-adoption-application';
import { GetPublicHousingTypesUseCase } from '../../../application/use-cases/adoptions/get-public-housing-types';
import type {
  AdoptionApplication,
  HousingType,
} from '../../../domain/models/adoptions/adoption';

@Controller('public/adoptions')
export class PublicAdoptionsController {
  constructor(
    private readonly getPublicHousingTypesUseCase: GetPublicHousingTypesUseCase,
    private readonly createAdoptionApplicationUseCase: CreateAdoptionApplicationUseCase,
  ) {}

  @Get('housing-types')
  getHousingTypes(): Promise<HousingType[]> {
    return this.getPublicHousingTypesUseCase.execute();
  }

  @Post('applications')
  createApplication(
    @Body() body: CreateAdoptionApplicationDto,
  ): Promise<AdoptionApplication> {
    return this.createAdoptionApplicationUseCase.execute(body);
  }
}
