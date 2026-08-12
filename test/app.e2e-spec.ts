import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ADOPTION_REPOSITORY } from '../src/domain/ports/output/adoption-repository';
import { ANIMAL_REPOSITORY } from '../src/domain/ports/output/animal-repository';
import { AUTH_REPOSITORY } from '../src/domain/ports/output/auth-repository';
import { DONATION_REPOSITORY } from '../src/domain/ports/output/donation-repository';
import { NOTIFICATION_REPOSITORY } from '../src/domain/ports/output/notification-repository';
import { SITE_SECTION_REPOSITORY } from '../src/domain/ports/output/site-section-repository';
import { USER_REPOSITORY } from '../src/domain/ports/output/user-repository';
import { RolesPermissionsGuard } from '../src/infrastructure/http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from '../src/infrastructure/http/auth/guards/supabase-auth';
import {
  SUPABASE_ADMIN_CLIENT,
  SUPABASE_PUBLIC_CLIENT,
} from '../src/infrastructure/persistence/supabase/supabase.tokens';

type HttpResponse<TBody> = {
  body: TBody;
};

type AnimalResponse = typeof animal;

type PaginatedAnimalsResponse = {
  items: AnimalResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UploadedImageResponse = {
  mediaId: string;
  bucket: string;
  path: string;
};

type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

type NotificationResponse = typeof notification;

const authenticatedUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'admin@patitas.test',
};

const animal = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Luna',
  species: 'perro',
  sex: 'hembra',
  approximateAge: '2 anios',
  size: 'mediano',
  description: 'Perrita tranquila.',
  generalCondition: 'Buen estado general.',
  photoPaths: ['media-assets/pending/luna.jpg'],
  status: 'disponible',
  isActive: true,
  isPubliclyVisible: true,
  createdAt: '2026-08-08T12:00:00.000Z',
  updatedAt: '2026-08-08T12:00:00.000Z',
  images: [
    {
      id: 'media-assets/pending/luna.jpg',
      animalId: '22222222-2222-4222-8222-222222222222',
      mediaId: 'media-assets/pending/luna.jpg',
      isPrimary: true,
      orderIndex: 0,
      createdAt: '2026-08-08T12:00:00.000Z',
      updatedAt: '2026-08-08T12:00:00.000Z',
      deletedAt: null,
    },
  ],
};

const adoptionApplication = {
  id: '33333333-3333-4333-8333-333333333333',
  firstNames: 'Ana',
  lastNames: 'Perez',
  phone: '0999999999',
  email: 'ana@example.com',
  desiredAnimalDescription: 'Desea adoptar a Luna.',
  adoptionReason: 'Quiere darle un hogar estable.',
  specificAnimalId: animal.id,
  additionalMessage: null,
  dataProcessingAccepted: true,
  dataProcessingAcceptedAt: '2026-08-08T12:00:00.000Z',
  status: 'recibida',
  internalObservations: null,
  notificationStatus: 'generada',
  notificationError: null,
  submittedAt: '2026-08-08T12:00:00.000Z',
  updatedAt: '2026-08-08T12:00:00.000Z',
  rowVersion: 1,
};

const donationOffer = {
  id: '44444444-4444-4444-8444-444444444444',
  firstNames: 'Carlos',
  lastNames: 'Mora',
  phone: '0988888888',
  email: 'carlos@example.com',
  selectedItems: ['Alimento', 'Cobijas'],
  approximateQuantity: '2 fundas',
  productName: null,
  itemCondition: null,
  expirationDate: null,
  deliveryAvailability: 'Puede entregar en la fundacion.',
  otherDescription: null,
  descriptionObservation: 'Donacion en especie.',
  dataProcessingAccepted: true,
  dataProcessingAcceptedAt: '2026-08-08T12:00:00.000Z',
  status: 'ofrecida',
  internalObservations: null,
  notificationStatus: 'generada',
  notificationError: null,
  submittedAt: '2026-08-08T12:00:00.000Z',
  updatedAt: '2026-08-08T12:00:00.000Z',
  rowVersion: 1,
};

const notification = {
  id: '55555555-5555-4555-8555-555555555555',
  recipientUserId: authenticatedUser.id,
  formType: 'adoption',
  adoptionApplicationId: adoptionApplication.id,
  donationOfferId: null,
  personName: 'Ana Perez',
  title: 'Nueva solicitud de adopcion',
  message: 'Ana Perez envio una solicitud de adopcion.',
  isRead: false,
  readAt: null,
  recipientEmail: authenticatedUser.email,
  emailSubject: null,
  emailBody: null,
  emailStatus: 'pendiente',
  emailAttemptCount: 0,
  emailLastAttemptAt: null,
  emailSentAt: null,
  emailError: null,
  createdAt: '2026-08-08T12:00:00.000Z',
};

describe('Patitas Caminando API (e2e)', () => {
  let app: INestApplication<App>;

  const animalRepository = {
    findPublicAnimals: jest.fn(),
    findPublicAnimalBySlug: jest.fn(),
    findAdminAnimals: jest.fn(),
    createAnimal: jest.fn(),
    updateAnimal: jest.fn(),
    deleteAnimal: jest.fn(),
    addImage: jest.fn(),
    uploadImageFile: jest.fn(),
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };

  const adoptionRepository = {
    createApplication: jest.fn(),
    findAdminApplications: jest.fn(),
    updateApplicationStatus: jest.fn(),
  };

  const donationRepository = {
    createOffer: jest.fn(),
    findAdminOffers: jest.fn(),
    updateOfferStatus: jest.fn(),
  };

  const notificationRepository = {
    findByRecipient: jest.fn(),
    findByIdForRecipient: jest.fn(),
    markAsRead: jest.fn(),
  };

  const authRepository = {
    login: jest.fn(),
    requestPasswordReset: jest.fn(),
    createOperator: jest.fn(),
  };

  const userRepository = {
    findCurrentUserById: jest.fn(),
    findProfileByUserId: jest.fn(),
    updateProfileByUserId: jest.fn(),
    findOperators: jest.fn(),
    findOperatorById: jest.fn(),
    updateOperator: jest.fn(),
  };

  const siteSectionRepository = {
    findPublicSections: jest.fn(),
    findAdminSections: jest.fn(),
    createSection: jest.fn(),
    updateSection: jest.fn(),
    deleteSection: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => {
            getRequest: () => { user?: typeof authenticatedUser };
          };
        }) => {
          const req = context.switchToHttp().getRequest();
          req.user = authenticatedUser;
          return true;
        },
      })
      .overrideGuard(RolesPermissionsGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(ANIMAL_REPOSITORY)
      .useValue(animalRepository)
      .overrideProvider(ADOPTION_REPOSITORY)
      .useValue(adoptionRepository)
      .overrideProvider(DONATION_REPOSITORY)
      .useValue(donationRepository)
      .overrideProvider(NOTIFICATION_REPOSITORY)
      .useValue(notificationRepository)
      .overrideProvider(AUTH_REPOSITORY)
      .useValue(authRepository)
      .overrideProvider(USER_REPOSITORY)
      .useValue(userRepository)
      .overrideProvider(SITE_SECTION_REPOSITORY)
      .useValue(siteSectionRepository)
      .overrideProvider(SUPABASE_PUBLIC_CLIENT)
      .useValue({})
      .overrideProvider(SUPABASE_ADMIN_CLIENT)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde el estado de salud de la API', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect(({ body }: HttpResponse<HealthResponse>) => {
        expect(body.status).toBe('ok');
        expect(body.service).toBe('patitascaminando_api');
        expect(body.timestamp).toEqual(expect.any(String));
      });
  });

  it('lista animales publicos con paginado', async () => {
    animalRepository.findPublicAnimals.mockResolvedValue({
      items: [animal],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    await request(app.getHttpServer())
      .get('/public/animals?page=1&limit=10')
      .expect(200)
      .expect(({ body }: HttpResponse<PaginatedAnimalsResponse>) => {
        expect(body).toMatchObject({
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        });
        expect(body.items).toHaveLength(1);
        expect(body.items[0].id).toBe(animal.id);
      });

    expect(animalRepository.findPublicAnimals).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  it('obtiene el detalle publico de un animal por id', async () => {
    animalRepository.findPublicAnimalBySlug.mockResolvedValue(animal);

    await request(app.getHttpServer())
      .get(`/public/animals/${animal.id}`)
      .expect(200)
      .expect(({ body }: HttpResponse<AnimalResponse>) => {
        expect(body.id).toBe(animal.id);
        expect(body.name).toBe('Luna');
      });

    expect(animalRepository.findPublicAnimalBySlug).toHaveBeenCalledWith(
      animal.id,
    );
  });

  it('crea una solicitud publica de adopcion sin autenticacion', async () => {
    adoptionRepository.createApplication.mockResolvedValue(adoptionApplication);

    await request(app.getHttpServer())
      .post('/public/adoptions/applications')
      .send({
        firstNames: 'Ana',
        lastNames: 'Perez',
        phone: '0999999999',
        email: 'ana@example.com',
        desiredAnimalDescription: 'Desea adoptar a Luna.',
        adoptionReason: 'Quiere darle un hogar estable.',
        specificAnimalId: animal.id,
        dataProcessingAccepted: true,
      })
      .expect(201)
      .expect(({ body }: HttpResponse<typeof adoptionApplication>) => {
        expect(body.id).toBe(adoptionApplication.id);
        expect(body.status).toBe('recibida');
      });
  });

  it('crea un ofrecimiento publico de donacion sin autenticacion', async () => {
    donationRepository.createOffer.mockResolvedValue(donationOffer);

    await request(app.getHttpServer())
      .post('/public/donations/offers')
      .send({
        firstNames: 'Carlos',
        lastNames: 'Mora',
        phone: '0988888888',
        email: 'carlos@example.com',
        selectedItems: ['Alimento', 'Cobijas'],
        approximateQuantity: '2 fundas',
        deliveryAvailability: 'Puede entregar en la fundacion.',
        descriptionObservation: 'Donacion en especie.',
        dataProcessingAccepted: true,
      })
      .expect(201)
      .expect(({ body }: HttpResponse<typeof donationOffer>) => {
        expect(body.id).toBe(donationOffer.id);
        expect(body.status).toBe('ofrecida');
      });
  });

  it('crea un animal desde backoffice con el usuario autenticado', async () => {
    animalRepository.createAnimal.mockResolvedValue(animal);

    await request(app.getHttpServer())
      .post('/admin/animals')
      .set('Authorization', 'Bearer fake-token')
      .send({
        name: 'Luna',
        species: 'perro',
        sex: 'hembra',
        approximateAge: '2 anios',
        size: 'mediano',
        description: 'Perrita tranquila.',
        generalCondition: 'Buen estado general.',
        photoPaths: ['media-assets/pending/luna.jpg'],
        status: 'disponible',
        isActive: true,
        isPubliclyVisible: true,
      })
      .expect(201)
      .expect(({ body }: HttpResponse<AnimalResponse>) => {
        expect(body.id).toBe(animal.id);
        expect(body.photoPaths).toEqual(['media-assets/pending/luna.jpg']);
      });

    expect(animalRepository.createAnimal).toHaveBeenCalledWith(
      expect.objectContaining({
        createdBy: authenticatedUser.id,
        name: 'Luna',
      }),
    );
  });

  it('sube una imagen antes de crear el animal', async () => {
    animalRepository.uploadImageFile.mockResolvedValue({
      mediaId: 'media-assets/pending/luna.jpg',
      bucket: 'media-assets',
      path: 'pending/luna.jpg',
    });

    await request(app.getHttpServer())
      .post('/admin/animals/images/upload')
      .set('Authorization', 'Bearer fake-token')
      .attach('file', Buffer.from('fake image'), {
        filename: 'luna.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201)
      .expect(({ body }: HttpResponse<UploadedImageResponse>) => {
        expect(body).toEqual({
          mediaId: 'media-assets/pending/luna.jpg',
          bucket: 'media-assets',
          path: 'pending/luna.jpg',
        });
      });
  });

  it('lista notificaciones solo para el usuario autenticado', async () => {
    notificationRepository.findByRecipient.mockResolvedValue([notification]);

    await request(app.getHttpServer())
      .get('/admin/notifications')
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }: HttpResponse<NotificationResponse[]>) => {
        expect(body).toHaveLength(1);
        expect(body[0].recipientUserId).toBe(authenticatedUser.id);
      });

    expect(notificationRepository.findByRecipient).toHaveBeenCalledWith(
      authenticatedUser.id,
    );
  });

  it('marca una notificacion como leida para el usuario autenticado', async () => {
    notificationRepository.markAsRead.mockResolvedValue({
      ...notification,
      isRead: true,
      readAt: '2026-08-08T12:10:00.000Z',
    });

    await request(app.getHttpServer())
      .patch(`/admin/notifications/${notification.id}/read`)
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }: HttpResponse<NotificationResponse>) => {
        expect(body.id).toBe(notification.id);
        expect(body.isRead).toBe(true);
      });

    expect(notificationRepository.markAsRead).toHaveBeenCalledWith(
      notification.id,
      authenticatedUser.id,
    );
  });
});
