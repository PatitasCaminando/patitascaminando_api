import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreateOperatorUseCase } from './application/use-cases/admin/create-operator';
import { CreateAdoptionApplicationUseCase } from './application/use-cases/adoptions/create-adoption-application';
import { GetAdminAdoptionApplicationsUseCase } from './application/use-cases/adoptions/get-admin-adoption-applications';
import { UpdateAdoptionStatusUseCase } from './application/use-cases/adoptions/update-adoption-status';
import { AddAnimalImageUseCase } from './application/use-cases/animals/add-animal-image';
import { CreateAnimalUseCase } from './application/use-cases/animals/create-animal';
import { DeleteAnimalImageUseCase } from './application/use-cases/animals/delete-animal-image';
import { DeleteAnimalUseCase } from './application/use-cases/animals/delete-animal';
import { GetAdminAnimalsUseCase } from './application/use-cases/animals/get-admin-animals';
import { GetPublicAnimalBySlugUseCase } from './application/use-cases/animals/get-public-animal-by-slug';
import { GetPublicAnimalsUseCase } from './application/use-cases/animals/get-public-animals';
import { UpdateAnimalUseCase } from './application/use-cases/animals/update-animal';
import { GetCurrentUserUseCase } from './application/use-cases/auth/get-current-user';
import { LoginUserUseCase } from './application/use-cases/auth/login-user';
import { CreateDonationOfferUseCase } from './application/use-cases/donations/create-donation-offer';
import { GetAdminDonationOffersUseCase } from './application/use-cases/donations/get-admin-donation-offers';
import { UpdateDonationStatusUseCase } from './application/use-cases/donations/update-donation-status';
import { CreateSiteSectionUseCase } from './application/use-cases/site-sections/create-site-section';
import { DeleteSiteSectionUseCase } from './application/use-cases/site-sections/delete-site-section';
import { GetAdminSiteSectionsUseCase } from './application/use-cases/site-sections/get-admin-site-sections';
import { GetPublicSiteSectionsUseCase } from './application/use-cases/site-sections/get-public-site-sections';
import { UpdateSiteSectionUseCase } from './application/use-cases/site-sections/update-site-section';
import { ADOPTION_REPOSITORY } from './domain/ports/output/adoption-repository';
import { ANIMAL_REPOSITORY } from './domain/ports/output/animal-repository';
import { AUTH_REPOSITORY } from './domain/ports/output/auth-repository';
import { DONATION_REPOSITORY } from './domain/ports/output/donation-repository';
import { SITE_SECTION_REPOSITORY } from './domain/ports/output/site-section-repository';
import { USER_REPOSITORY } from './domain/ports/output/user-repository';
import { AdminAdoptionsController } from './infrastructure/controllers/admin/adoptions';
import { AdminAnimalsController } from './infrastructure/controllers/admin/animals';
import { AdminDonationsController } from './infrastructure/controllers/admin/donations';
import { AdminSiteSectionsController } from './infrastructure/controllers/admin/site-sections';
import { AdminUsersController } from './infrastructure/controllers/admin/users';
import { AuthController } from './infrastructure/controllers/auth';
import { PublicAdoptionsController } from './infrastructure/controllers/public/adoptions';
import { PublicAnimalsController } from './infrastructure/controllers/public/animals';
import { PublicDonationsController } from './infrastructure/controllers/public/donations';
import { PublicSiteSectionsController } from './infrastructure/controllers/public/site-sections';
import { RolesPermissionsGuard } from './infrastructure/http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from './infrastructure/http/auth/guards/supabase-auth';
import { AdoptionSupabaseRepository } from './infrastructure/persistence/supabase/repositories/adoption-supabase';
import { AnimalSupabaseRepository } from './infrastructure/persistence/supabase/repositories/animal-supabase';
import { AuthSupabaseRepository } from './infrastructure/persistence/supabase/repositories/auth-supabase';
import { DonationSupabaseRepository } from './infrastructure/persistence/supabase/repositories/donation-supabase';
import { SiteSectionSupabaseRepository } from './infrastructure/persistence/supabase/repositories/site-section-supabase';
import { UserSupabaseRepository } from './infrastructure/persistence/supabase/repositories/user-supabase';
import { SupabaseModule } from './infrastructure/persistence/supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
  ],
  controllers: [
    AuthController,
    AdminUsersController,
    PublicSiteSectionsController,
    AdminSiteSectionsController,
    PublicAnimalsController,
    AdminAnimalsController,
    PublicAdoptionsController,
    AdminAdoptionsController,
    PublicDonationsController,
    AdminDonationsController,
  ],
  providers: [
    CreateOperatorUseCase,
    LoginUserUseCase,
    GetCurrentUserUseCase,
    GetPublicSiteSectionsUseCase,
    GetAdminSiteSectionsUseCase,
    CreateSiteSectionUseCase,
    UpdateSiteSectionUseCase,
    DeleteSiteSectionUseCase,
    GetPublicAnimalsUseCase,
    GetPublicAnimalBySlugUseCase,
    GetAdminAnimalsUseCase,
    CreateAnimalUseCase,
    UpdateAnimalUseCase,
    DeleteAnimalUseCase,
    AddAnimalImageUseCase,
    DeleteAnimalImageUseCase,
    CreateAdoptionApplicationUseCase,
    GetAdminAdoptionApplicationsUseCase,
    UpdateAdoptionStatusUseCase,
    CreateDonationOfferUseCase,
    GetAdminDonationOffersUseCase,
    UpdateDonationStatusUseCase,
    SupabaseAuthGuard,
    RolesPermissionsGuard,
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthSupabaseRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserSupabaseRepository,
    },
    {
      provide: SITE_SECTION_REPOSITORY,
      useClass: SiteSectionSupabaseRepository,
    },
    {
      provide: ANIMAL_REPOSITORY,
      useClass: AnimalSupabaseRepository,
    },
    {
      provide: ADOPTION_REPOSITORY,
      useClass: AdoptionSupabaseRepository,
    },
    {
      provide: DONATION_REPOSITORY,
      useClass: DonationSupabaseRepository,
    },
  ],
})
export class AppModule {}
