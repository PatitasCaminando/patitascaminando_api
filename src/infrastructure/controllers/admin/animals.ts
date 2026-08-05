import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { UploadAnimalImageUseCase } from '../../../application/use-cases/animals/upload-animal-image';
import type { AuthenticatedUser } from '../../../domain/models/auth/authenticated-user';
import type {
  Animal,
  AnimalImage,
} from '../../../domain/models/animals/animal';
import type { PaginatedResult } from '../../../domain/models/common/pagination';
import type { UploadedAnimalImage } from '../../../domain/ports/output/animal-repository';
import { CurrentUser } from '../../http/auth/decorators/current-user';
import { Permissions } from '../../http/auth/decorators/permissions';
import { RolesPermissionsGuard } from '../../http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from '../../http/auth/guards/supabase-auth';

type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

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
    private readonly uploadAnimalImageUseCase: UploadAnimalImageUseCase,
    private readonly deleteAnimalImageUseCase: DeleteAnimalImageUseCase,
  ) {}

  @Get()
  getAnimals(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<Animal>> {
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

  @Post('images/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImageBeforeCreate(
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<UploadedAnimalImage> {
    if (!file) {
      throw new BadRequestException('Debe enviar una imagen en el campo file.');
    }

    return this.uploadAnimalImageUseCase.executeWithoutAnimal({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });
  }

  @Post(':id/images/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') animalId: string,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<AnimalImage> {
    if (!file) {
      throw new BadRequestException('Debe enviar una imagen en el campo file.');
    }

    return this.uploadAnimalImageUseCase.execute(animalId, {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });
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
