import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddAnimalImageDto } from '../../../application/dto/animals/add-animal-image';
import { CreateAnimalDto } from '../../../application/dto/animals/create-animal';
import { UpdateAnimalDto } from '../../../application/dto/animals/update-animal';
import { PaginationQueryDto } from '../../../application/dto/common/pagination-query';
import { AddAnimalImageUseCase } from '../../../application/use-cases/animals/add-animal-image';
import { CreateAnimalUseCase } from '../../../application/use-cases/animals/create-animal';
import { DeleteAnimalImageUseCase } from '../../../application/use-cases/animals/delete-animal-image';
import { DeleteAnimalUseCase } from '../../../application/use-cases/animals/delete-animal';
import { GetAdminAnimalsUseCase } from '../../../application/use-cases/animals/get-admin-animals';
import { UpdateAnimalUseCase } from '../../../application/use-cases/animals/update-animal';
import type { AuthenticatedUser } from '../../../domain/models/auth/authenticated-user';
import type {
  Animal,
  AnimalImage,
} from '../../../domain/models/animals/animal';
import type { PaginatedResult } from '../../../domain/models/common/pagination';
import { CurrentUser } from '../../http/auth/decorators/current-user';
import { Permissions } from '../../http/auth/decorators/permissions';
import { RolesPermissionsGuard } from '../../http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from '../../http/auth/guards/supabase-auth';

@Controller('admin/animals')
@UseGuards(SupabaseAuthGuard, RolesPermissionsGuard)
@Permissions('animals.manage')
export class AdminAnimalsController {
  constructor(
    private readonly getAdminAnimalsUseCase: GetAdminAnimalsUseCase,
    private readonly createAnimalUseCase: CreateAnimalUseCase,
    private readonly updateAnimalUseCase: UpdateAnimalUseCase,
    private readonly deleteAnimalUseCase: DeleteAnimalUseCase,
    private readonly addAnimalImageUseCase: AddAnimalImageUseCase,
    private readonly deleteAnimalImageUseCase: DeleteAnimalImageUseCase,
  ) {}

  @Get()
  getAnimals(@Query() query: PaginationQueryDto): Promise<PaginatedResult<Animal>> {
    return this.getAdminAnimalsUseCase.execute(query);
  }

  @Post()
  createAnimal(
    @Body() body: CreateAnimalDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Animal> {
    return this.createAnimalUseCase.execute({
      ...body,
      createdBy: user.id,
    });
  }

  @Patch(':id')
  updateAnimal(
    @Param('id') id: string,
    @Body() body: UpdateAnimalDto,
  ): Promise<Animal> {
    return this.updateAnimalUseCase.execute(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteAnimal(@Param('id') id: string): Promise<void> {
    return this.deleteAnimalUseCase.execute(id);
  }

  @Post(':id/images')
  addImage(
    @Param('id') animalId: string,
    @Body() body: AddAnimalImageDto,
  ): Promise<AnimalImage> {
    return this.addAnimalImageUseCase.execute(animalId, body);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(204)
  deleteImage(
    @Param('id') animalId: string,
    @Param('imageId') imageId: string,
  ): Promise<void> {
    return this.deleteAnimalImageUseCase.execute(animalId, imageId);
  }
}
