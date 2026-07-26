import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AddAnimalImageUseCase } from './application/use-cases/animals/add-animal-image';
import { CreateAnimalUseCase } from './application/use-cases/animals/create-animal';
import { DeleteAnimalImageUseCase } from './application/use-cases/animals/delete-animal-image';
import { DeleteAnimalUseCase } from './application/use-cases/animals/delete-animal';
import { GetAdminAnimalsUseCase } from './application/use-cases/animals/get-admin-animals';
import { GetPublicAnimalBySlugUseCase } from './application/use-cases/animals/get-public-animal-by-slug';
import { GetPublicAnimalsUseCase } from './application/use-cases/animals/get-public-animals';
import { UpdateAnimalUseCase } from './application/use-cases/animals/update-animal';
import { CreateAdoptionApplicationUseCase } from './application/use-cases/adoptions/create-adoption-application';
import { CreateHousingTypeUseCase } from './application/use-cases/adoptions/create-housing-type';
import { DeleteHousingTypeUseCase } from './application/use-cases/adoptions/delete-housing-type';
import { GetAdminAdoptionApplicationsUseCase } from './application/use-cases/adoptions/get-admin-adoption-applications';
import { GetAdminHousingTypesUseCase } from './application/use-cases/adoptions/get-admin-housing-types';
import { GetMyAdoptionApplicationsUseCase } from './application/use-cases/adoptions/get-my-adoption-applications';
import { GetPublicHousingTypesUseCase } from './application/use-cases/adoptions/get-public-housing-types';
import { UpdateAdoptionStatusUseCase } from './application/use-cases/adoptions/update-adoption-status';
import { UpdateHousingTypeUseCase } from './application/use-cases/adoptions/update-housing-type';
import { CreateDonationOfferUseCase } from './application/use-cases/donations/create-donation-offer';
import { GetAdminDonationOffersUseCase } from './application/use-cases/donations/get-admin-donation-offers';
import { UpdateDonationStatusUseCase } from './application/use-cases/donations/update-donation-status';
import { CreateOperatorUseCase } from './application/use-cases/admin/create-operator';
import { GetCurrentUserUseCase } from './application/use-cases/auth/get-current-user';
import { LoginUserUseCase } from './application/use-cases/auth/login-user';
import { RegisterUserUseCase } from './application/use-cases/auth/register-user';
import {
  AssignRolePermissionUseCase,
  AssignUserBadgeUseCase,
  CreateAvatarUseCase,
  CreateBadgeUseCase,
  CreatePermissionUseCase,
  CreateRoleUseCase,
  DeleteAvatarUseCase,
  DeleteBadgeUseCase,
  DeletePermissionUseCase,
  DeleteRoleUseCase,
  GetAdminAvatarsUseCase,
  GetAdminBadgesUseCase,
  GetPermissionsUseCase,
  GetPublicAvatarsUseCase,
  GetPublicBadgesUseCase,
  GetRolePermissionsUseCase,
  GetRolesUseCase,
  GetUserBadgesUseCase,
  RemoveRolePermissionUseCase,
  RemoveUserBadgeUseCase,
  UpdateAvatarUseCase,
  UpdateBadgeUseCase,
  UpdatePermissionUseCase,
  UpdateRoleUseCase,
} from './application/use-cases/identity-management/identity-management';
import { CreateHeroCardUseCase } from './application/use-cases/landing/create-hero-card';
import { CreateLandingImpactBlockUseCase } from './application/use-cases/landing/create-impact-block';
import { CreateLandingInfoCardUseCase } from './application/use-cases/landing/create-info-card';
import { CreateLandingSectionUseCase } from './application/use-cases/landing/create-section';
import { DeleteHeroCardUseCase } from './application/use-cases/landing/delete-hero-card';
import { DeleteLandingImpactBlockUseCase } from './application/use-cases/landing/delete-impact-block';
import { DeleteLandingInfoCardUseCase } from './application/use-cases/landing/delete-info-card';
import { DeleteLandingSectionUseCase } from './application/use-cases/landing/delete-section';
import { GetAdminLandingUseCase } from './application/use-cases/landing/get-admin-landing';
import { GetPublicLandingUseCase } from './application/use-cases/landing/get-public-landing';
import { UpdateHeroCardUseCase } from './application/use-cases/landing/update-hero-card';
import { UpdateLandingImpactBlockUseCase } from './application/use-cases/landing/update-impact-block';
import { UpdateLandingInfoCardUseCase } from './application/use-cases/landing/update-info-card';
import { UpdateLandingSectionUseCase } from './application/use-cases/landing/update-section';
import { DeleteMediaUseCase } from './application/use-cases/media/delete-media';
import { GetMediaUseCase } from './application/use-cases/media/get-media';
import { UpdateMediaUseCase } from './application/use-cases/media/update-media';
import { UploadMediaUseCase } from './application/use-cases/media/upload-media';
import { CreateContactInfoUseCase } from './application/use-cases/settings/create-contact-info';
import { CreateFaqItemUseCase } from './application/use-cases/settings/create-faq-item';
import { CreateSocialLinkUseCase } from './application/use-cases/settings/create-social-link';
import { DeleteContactInfoUseCase } from './application/use-cases/settings/delete-contact-info';
import { DeleteFaqItemUseCase } from './application/use-cases/settings/delete-faq-item';
import { DeleteSocialLinkUseCase } from './application/use-cases/settings/delete-social-link';
import { GetAdminContactInfoUseCase } from './application/use-cases/settings/get-admin-contact-info';
import { GetAdminFaqItemsUseCase } from './application/use-cases/settings/get-admin-faq-items';
import { GetAdminSocialLinksUseCase } from './application/use-cases/settings/get-admin-social-links';
import { GetPublicContactInfoUseCase } from './application/use-cases/settings/get-public-contact-info';
import { GetPublicFaqItemsUseCase } from './application/use-cases/settings/get-public-faq-items';
import { GetPublicSocialLinksUseCase } from './application/use-cases/settings/get-public-social-links';
import { UpdateContactInfoUseCase } from './application/use-cases/settings/update-contact-info';
import { UpdateFaqItemUseCase } from './application/use-cases/settings/update-faq-item';
import { UpdateSocialLinkUseCase } from './application/use-cases/settings/update-social-link';
import { GetMyProfileUseCase } from './application/use-cases/users/get-my-profile';
import { UpdateMyProfileUseCase } from './application/use-cases/users/update-my-profile';
import { ANIMAL_REPOSITORY } from './domain/ports/output/animal-repository';
import { ADOPTION_REPOSITORY } from './domain/ports/output/adoption-repository';
import { AUTH_REPOSITORY } from './domain/ports/output/auth-repository';
import { DONATION_REPOSITORY } from './domain/ports/output/donation-repository';
import { IDENTITY_MANAGEMENT_REPOSITORY } from './domain/ports/output/identity-management-repository';
import { LANDING_REPOSITORY } from './domain/ports/output/landing-repository';
import { MEDIA_REPOSITORY } from './domain/ports/output/media-repository';
import { SETTINGS_REPOSITORY } from './domain/ports/output/settings-repository';
import { USER_REPOSITORY } from './domain/ports/output/user-repository';
import { AdminLandingController } from './infrastructure/controllers/admin/landing';
import { AdminAdoptionsController } from './infrastructure/controllers/admin/adoptions';
import { AdminAnimalsController } from './infrastructure/controllers/admin/animals';
import { AdminIdentityManagementController } from './infrastructure/controllers/admin/identity-management';
import { AdminDonationsController } from './infrastructure/controllers/admin/donations';
import { AdminMediaController } from './infrastructure/controllers/admin/media';
import { AdminSettingsController } from './infrastructure/controllers/admin/settings';
import { AdminUsersController } from './infrastructure/controllers/admin/users';
import { AuthController } from './infrastructure/controllers/auth';
import { AdoptionsController } from './infrastructure/controllers/adoptions';
import { PublicLandingController } from './infrastructure/controllers/public/landing';
import { PublicAdoptionsController } from './infrastructure/controllers/public/adoptions';
import { PublicAnimalsController } from './infrastructure/controllers/public/animals';
import { PublicIdentityManagementController } from './infrastructure/controllers/public/identity-management';
import { PublicDonationsController } from './infrastructure/controllers/public/donations';
import { PublicSettingsController } from './infrastructure/controllers/public/settings';
import { UsersController } from './infrastructure/controllers/users';
import { RolesPermissionsGuard } from './infrastructure/http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from './infrastructure/http/auth/guards/supabase-auth';
import { AuthSupabaseRepository } from './infrastructure/persistence/supabase/repositories/auth-supabase';
import { AdoptionSupabaseRepository } from './infrastructure/persistence/supabase/repositories/adoption-supabase';
import { AnimalSupabaseRepository } from './infrastructure/persistence/supabase/repositories/animal-supabase';
import { DonationSupabaseRepository } from './infrastructure/persistence/supabase/repositories/donation-supabase';
import { IdentityManagementSupabaseRepository } from './infrastructure/persistence/supabase/repositories/identity-management-supabase';
import { LandingSupabaseRepository } from './infrastructure/persistence/supabase/repositories/landing-supabase';
import { MediaSupabaseRepository } from './infrastructure/persistence/supabase/repositories/media-supabase';
import { SettingsSupabaseRepository } from './infrastructure/persistence/supabase/repositories/settings-supabase';
import { SupabaseModule } from './infrastructure/persistence/supabase/supabase.module';
import { UserSupabaseRepository } from './infrastructure/persistence/supabase/repositories/user-supabase';

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
    UsersController,
    PublicLandingController,
    AdminLandingController,
    PublicAnimalsController,
    AdminAnimalsController,
    PublicAdoptionsController,
    PublicDonationsController,
    AdoptionsController,
    AdminAdoptionsController,
    AdminDonationsController,
    AdminMediaController,
    PublicSettingsController,
    AdminSettingsController,
    PublicIdentityManagementController,
    AdminIdentityManagementController,
  ],
  providers: [
    CreateOperatorUseCase,
    RegisterUserUseCase,
    LoginUserUseCase,
    GetCurrentUserUseCase,
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    GetPublicAnimalsUseCase,
    GetPublicAnimalBySlugUseCase,
    GetAdminAnimalsUseCase,
    CreateAnimalUseCase,
    UpdateAnimalUseCase,
    DeleteAnimalUseCase,
    AddAnimalImageUseCase,
    DeleteAnimalImageUseCase,
    GetPublicHousingTypesUseCase,
    GetAdminHousingTypesUseCase,
    CreateHousingTypeUseCase,
    UpdateHousingTypeUseCase,
    DeleteHousingTypeUseCase,
    CreateAdoptionApplicationUseCase,
    GetMyAdoptionApplicationsUseCase,
    GetAdminAdoptionApplicationsUseCase,
    UpdateAdoptionStatusUseCase,
    CreateDonationOfferUseCase,
    GetAdminDonationOffersUseCase,
    UpdateDonationStatusUseCase,
    GetPublicLandingUseCase,
    GetAdminLandingUseCase,
    CreateLandingSectionUseCase,
    CreateHeroCardUseCase,
    CreateLandingImpactBlockUseCase,
    CreateLandingInfoCardUseCase,
    UpdateLandingSectionUseCase,
    UpdateHeroCardUseCase,
    UpdateLandingImpactBlockUseCase,
    UpdateLandingInfoCardUseCase,
    DeleteLandingSectionUseCase,
    DeleteHeroCardUseCase,
    DeleteLandingImpactBlockUseCase,
    DeleteLandingInfoCardUseCase,
    GetMediaUseCase,
    UploadMediaUseCase,
    UpdateMediaUseCase,
    DeleteMediaUseCase,
    GetPublicContactInfoUseCase,
    GetAdminContactInfoUseCase,
    CreateContactInfoUseCase,
    UpdateContactInfoUseCase,
    DeleteContactInfoUseCase,
    GetPublicSocialLinksUseCase,
    GetAdminSocialLinksUseCase,
    CreateSocialLinkUseCase,
    UpdateSocialLinkUseCase,
    DeleteSocialLinkUseCase,
    GetPublicFaqItemsUseCase,
    GetAdminFaqItemsUseCase,
    CreateFaqItemUseCase,
    UpdateFaqItemUseCase,
    DeleteFaqItemUseCase,
    GetPublicAvatarsUseCase,
    GetAdminAvatarsUseCase,
    CreateAvatarUseCase,
    UpdateAvatarUseCase,
    DeleteAvatarUseCase,
    GetPublicBadgesUseCase,
    GetAdminBadgesUseCase,
    CreateBadgeUseCase,
    UpdateBadgeUseCase,
    DeleteBadgeUseCase,
    GetUserBadgesUseCase,
    AssignUserBadgeUseCase,
    RemoveUserBadgeUseCase,
    GetRolesUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    GetPermissionsUseCase,
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
    GetRolePermissionsUseCase,
    AssignRolePermissionUseCase,
    RemoveRolePermissionUseCase,
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
      provide: LANDING_REPOSITORY,
      useClass: LandingSupabaseRepository,
    },
    {
      provide: MEDIA_REPOSITORY,
      useClass: MediaSupabaseRepository,
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
      provide: SETTINGS_REPOSITORY,
      useClass: SettingsSupabaseRepository,
    },
    {
      provide: IDENTITY_MANAGEMENT_REPOSITORY,
      useClass: IdentityManagementSupabaseRepository,
    },
  ],
})
export class AppModule {}
