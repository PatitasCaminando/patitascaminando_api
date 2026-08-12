import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreateOperatorUseCase } from './application/use-cases/admin/create-operator';
import { GetOperatorUseCase } from './application/use-cases/admin/get-operator';
import { GetOperatorsUseCase } from './application/use-cases/admin/get-operators';
import { UpdateOperatorUseCase } from './application/use-cases/admin/update-operator';
import { UpdateOperatorStatusUseCase } from './application/use-cases/admin/update-operator-status';
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
import { UploadAnimalImageUseCase } from './application/use-cases/animals/upload-animal-image';
import { GetCurrentUserUseCase } from './application/use-cases/auth/get-current-user';
import { LoginUserUseCase } from './application/use-cases/auth/login-user';
import { RequestPasswordResetUseCase } from './application/use-cases/auth/request-password-reset';
import { CreateDonationOfferUseCase } from './application/use-cases/donations/create-donation-offer';
import { GetAdminDonationOffersUseCase } from './application/use-cases/donations/get-admin-donation-offers';
import { UpdateDonationStatusUseCase } from './application/use-cases/donations/update-donation-status';
import { GetAdminNotificationUseCase } from './application/use-cases/notifications/get-admin-notification';
import { GetAdminNotificationsUseCase } from './application/use-cases/notifications/get-admin-notifications';
import { MarkNotificationAsReadUseCase } from './application/use-cases/notifications/mark-notification-as-read';
import { CreateSiteSectionUseCase } from './application/use-cases/site-sections/create-site-section';
import { DeleteSiteSectionUseCase } from './application/use-cases/site-sections/delete-site-section';
import { GetAdminSiteSectionsUseCase } from './application/use-cases/site-sections/get-admin-site-sections';
import { GetPublicSiteSectionsUseCase } from './application/use-cases/site-sections/get-public-site-sections';
import { UpdateSiteSectionUseCase } from './application/use-cases/site-sections/update-site-section';
import { ADOPTION_REPOSITORY } from './domain/ports/output/adoption-repository';
import { ANIMAL_REPOSITORY } from './domain/ports/output/animal-repository';
import { AUTH_REPOSITORY } from './domain/ports/output/auth-repository';
import { DONATION_REPOSITORY } from './domain/ports/output/donation-repository';
import { NOTIFICATION_REPOSITORY } from './domain/ports/output/notification-repository';
import { SITE_SECTION_REPOSITORY } from './domain/ports/output/site-section-repository';
import { USER_REPOSITORY } from './domain/ports/output/user-repository';
import { AdminAdoptionsController } from './infrastructure/controllers/admin/adoptions';
import { AdminAnimalsController } from './infrastructure/controllers/admin/animals';
import { AdminDonationsController } from './infrastructure/controllers/admin/donations';
import { AdminNotificationsController } from './infrastructure/controllers/admin/notifications';
import { AdminSiteSectionsController } from './infrastructure/controllers/admin/site-sections';
import { AdminUsersController } from './infrastructure/controllers/admin/users';
import { AuthController } from './infrastructure/controllers/auth';
import { HealthController } from './infrastructure/controllers/health';
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
import { NotificationSupabaseRepository } from './infrastructure/persistence/supabase/repositories/notification-supabase';
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
    AdminNotificationsController,
    HealthController,
  ],
  providers: [
    CreateOperatorUseCase,
    GetOperatorsUseCase,
    GetOperatorUseCase,
    UpdateOperatorUseCase,
    UpdateOperatorStatusUseCase,
    LoginUserUseCase,
    RequestPasswordResetUseCase,
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
    UploadAnimalImageUseCase,
    DeleteAnimalUseCase,
    AddAnimalImageUseCase,
    DeleteAnimalImageUseCase,
    CreateAdoptionApplicationUseCase,
    GetAdminAdoptionApplicationsUseCase,
    UpdateAdoptionStatusUseCase,
    CreateDonationOfferUseCase,
    GetAdminDonationOffersUseCase,
    UpdateDonationStatusUseCase,
    GetAdminNotificationsUseCase,
    GetAdminNotificationUseCase,
    MarkNotificationAsReadUseCase,
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
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationSupabaseRepository,
    },
  ],
})
export class AppModule {}
