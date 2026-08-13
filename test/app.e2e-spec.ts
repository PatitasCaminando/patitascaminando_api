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

type AuthSessionResponse = typeof authSession;
type CurrentUserResponse = typeof currentUser;
type OperatorResponse = typeof operator;
type SiteSectionResponse = typeof siteSection;
type AnimalImageResponse = (typeof animal.images)[number];
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

const authSession = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'bearer',
  expiresIn: 3600,
  expiresAt: null,
  user: {
    id: authenticatedUser.id,
    email: authenticatedUser.email,
  },
};

const currentUser = {
  id: authenticatedUser.id,
  email: authenticatedUser.email,
  profile: {
    id: '66666666-6666-4666-8666-666666666666',
    avatarId: null,
    firstNames: 'Admin',
    lastNames: 'Patitas',
    phone: '0999999999',
    birthDate: null,
    address: null,
    housingSector: null,
    status: 'active',
    userType: 'staff',
    createdAt: '2026-08-08T12:00:00.000Z',
    updatedAt: '2026-08-08T12:00:00.000Z',
  },
  roles: ['admin'],
  permissions: ['animals.manage', 'adoptions.manage'],
};

const operator = {
  id: '77777777-7777-4777-8777-777777777777',
  email: 'operador@patitas.test',
  firstNames: 'Operador',
  lastNames: 'Uno',
  phone: '0977777777',
  isActive: true,
  receiveFormNotifications: true,
  createdAt: '2026-08-08T12:00:00.000Z',
  updatedAt: '2026-08-08T12:00:00.000Z',
};

const siteSection = {
  id: '88888888-8888-4888-8888-888888888888',
  sectionKey: 'contacto',
  title: 'Contacto',
  content: {
    phone: '0999999999',
  },
  isPublished: true,
  displayOrder: 1,
  createdAt: '2026-08-08T12:00:00.000Z',
  updatedAt: '2026-08-08T12:00:00.000Z',
};

describe('Patitas Caminando API (e2e)', () => {
  let app: INestApplication<App>;

  const animalRepository = {
    findPublicAnimals: jest.fn(),
    findPublicAnimalBySlug: jest.fn(),
    findAdminAnimals: jest.fn(),
    existsSimilarAnimal: jest.fn(),
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

  it('inicia sesion de usuario', async () => {
    authRepository.login.mockResolvedValue(authSession);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: authenticatedUser.email,
        password: 'secret123',
      })
      .expect(201)
      .expect(({ body }: HttpResponse<AuthSessionResponse>) => {
        expect(body.accessToken).toBe('access-token');
        expect(body.user.email).toBe(authenticatedUser.email);
      });

    expect(authRepository.login).toHaveBeenCalledWith({
      email: authenticatedUser.email,
      password: 'secret123',
    });
  });

  it('solicita restablecimiento de contrasena', async () => {
    authRepository.requestPasswordReset.mockResolvedValue({
      email: authenticatedUser.email,
      requested: true,
    });

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({
        email: authenticatedUser.email,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          email: authenticatedUser.email,
          requested: true,
        });
      });

    expect(authRepository.requestPasswordReset).toHaveBeenCalledWith({
      email: authenticatedUser.email,
    });
  });

  it('obtiene el usuario autenticado actual', async () => {
    userRepository.findCurrentUserById.mockResolvedValue(currentUser);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }: HttpResponse<CurrentUserResponse>) => {
        expect(body.id).toBe(authenticatedUser.id);
        expect(body.profile.firstNames).toBe('Admin');
      });

    expect(userRepository.findCurrentUserById).toHaveBeenCalledWith(
      authenticatedUser,
    );
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

  it('lista secciones publicas del sitio', async () => {
    siteSectionRepository.findPublicSections.mockResolvedValue([siteSection]);

    await request(app.getHttpServer())
      .get('/public/site-sections')
      .expect(200)
      .expect(({ body }: HttpResponse<SiteSectionResponse[]>) => {
        expect(body).toHaveLength(1);
        expect(body[0].sectionKey).toBe('contacto');
      });

    expect(siteSectionRepository.findPublicSections).toHaveBeenCalled();
  });

  it('lista animales desde backoffice con paginado', async () => {
    animalRepository.findAdminAnimals.mockResolvedValue({
      items: [animal],
      page: 2,
      limit: 5,
      total: 6,
      totalPages: 2,
    });

    await request(app.getHttpServer())
      .get('/admin/animals?page=2&limit=5')
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }: HttpResponse<PaginatedAnimalsResponse>) => {
        expect(body.page).toBe(2);
        expect(body.items[0].id).toBe(animal.id);
      });

    expect(animalRepository.findAdminAnimals).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
    });
  });

  it('crea un animal desde backoffice con el usuario autenticado', async () => {
    animalRepository.existsSimilarAnimal.mockResolvedValue(false);
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

  it('rechaza crear un animal duplicado desde backoffice', async () => {
    animalRepository.existsSimilarAnimal.mockResolvedValue(true);

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
      .expect(409)
      .expect(({ body }) => {
        expect(body.message).toBe(
          'Ya existe un animal registrado con los mismos datos principales.',
        );
      });

    expect(animalRepository.createAnimal).not.toHaveBeenCalled();
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

  it('actualiza un animal desde backoffice', async () => {
    animalRepository.updateAnimal.mockResolvedValue({
      ...animal,
      status: 'en_proceso',
    });

    await request(app.getHttpServer())
      .patch(`/admin/animals/${animal.id}`)
      .set('Authorization', 'Bearer fake-token')
      .send({
        status: 'en_proceso',
      })
      .expect(200)
      .expect(({ body }: HttpResponse<AnimalResponse>) => {
        expect(body.status).toBe('en_proceso');
      });

    expect(animalRepository.updateAnimal).toHaveBeenCalledWith(animal.id, {
      status: 'en_proceso',
    });
  });

  it('elimina un animal desde backoffice', async () => {
    animalRepository.deleteAnimal.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .delete(`/admin/animals/${animal.id}`)
      .set('Authorization', 'Bearer fake-token')
      .expect(204);

    expect(animalRepository.deleteAnimal).toHaveBeenCalledWith(animal.id);
  });

  it('agrega una imagen existente a un animal', async () => {
    animalRepository.addImage.mockResolvedValue(animal.images[0]);

    await request(app.getHttpServer())
      .post(`/admin/animals/${animal.id}/images`)
      .set('Authorization', 'Bearer fake-token')
      .send({
        mediaId: 'media-assets/pending/luna.jpg',
        isPrimary: true,
        orderIndex: 0,
      })
      .expect(201)
      .expect(({ body }: HttpResponse<AnimalImageResponse>) => {
        expect(body.mediaId).toBe('media-assets/pending/luna.jpg');
      });

    expect(animalRepository.addImage).toHaveBeenCalledWith(animal.id, {
      mediaId: 'media-assets/pending/luna.jpg',
      isPrimary: true,
      orderIndex: 0,
    });
  });

  it('sube una imagen para un animal existente', async () => {
    animalRepository.uploadImage.mockResolvedValue(animal.images[0]);

    await request(app.getHttpServer())
      .post(`/admin/animals/${animal.id}/images/upload`)
      .set('Authorization', 'Bearer fake-token')
      .attach('file', Buffer.from('fake image'), {
        filename: 'luna.webp',
        contentType: 'image/webp',
      })
      .expect(201)
      .expect(({ body }: HttpResponse<AnimalImageResponse>) => {
        expect(body.animalId).toBe(animal.id);
      });

    expect(animalRepository.uploadImage).toHaveBeenCalledWith(
      animal.id,
      expect.objectContaining({
        mimeType: 'image/webp',
        originalName: 'luna.webp',
      }),
    );
  });

  it('rechaza subir imagen sin archivo', async () => {
    await request(app.getHttpServer())
      .post('/admin/animals/images/upload')
      .set('Authorization', 'Bearer fake-token')
      .expect(400);

    expect(animalRepository.uploadImageFile).not.toHaveBeenCalled();
  });

  it('rechaza subir imagen con formato no permitido', async () => {
    await request(app.getHttpServer())
      .post('/admin/animals/images/upload')
      .set('Authorization', 'Bearer fake-token')
      .attach('file', Buffer.from('fake image'), {
        filename: 'luna.gif',
        contentType: 'image/gif',
      })
      .expect(400);

    expect(animalRepository.uploadImageFile).not.toHaveBeenCalled();
  });

  it('rechaza subir imagen que supera el tamano permitido', async () => {
    process.env.MAX_ANIMAL_IMAGE_SIZE_MB = '1';

    try {
      await request(app.getHttpServer())
        .post('/admin/animals/images/upload')
        .set('Authorization', 'Bearer fake-token')
        .attach('file', Buffer.alloc(2 * 1024 * 1024), {
          filename: 'luna.jpg',
          contentType: 'image/jpeg',
        })
        .expect(400);
    } finally {
      delete process.env.MAX_ANIMAL_IMAGE_SIZE_MB;
    }

    expect(animalRepository.uploadImageFile).not.toHaveBeenCalled();
  });

  it('elimina una imagen de un animal', async () => {
    const imageId = '99999999-9999-4999-8999-999999999999';

    animalRepository.deleteImage.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .delete(`/admin/animals/${animal.id}/images/${imageId}`)
      .set('Authorization', 'Bearer fake-token')
      .expect(204);

    expect(animalRepository.deleteImage).toHaveBeenCalledWith(
      animal.id,
      imageId,
    );
  });

  it('lista solicitudes de adopcion desde backoffice', async () => {
    adoptionRepository.findAdminApplications.mockResolvedValue({
      items: [adoptionApplication],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    await request(app.getHttpServer())
      .get('/admin/adoptions/applications?page=1&limit=10')
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }) => {
        expect(body.items[0].id).toBe(adoptionApplication.id);
      });

    expect(adoptionRepository.findAdminApplications).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  it('actualiza estado de una solicitud de adopcion', async () => {
    adoptionRepository.updateApplicationStatus.mockResolvedValue({
      ...adoptionApplication,
      status: 'contactada',
      internalObservations: 'Se llamo a la solicitante.',
    });

    await request(app.getHttpServer())
      .patch(`/admin/adoptions/applications/${adoptionApplication.id}/status`)
      .set('Authorization', 'Bearer fake-token')
      .send({
        status: 'contactada',
        internalObservations: 'Se llamo a la solicitante.',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('contactada');
      });

    expect(adoptionRepository.updateApplicationStatus).toHaveBeenCalledWith(
      adoptionApplication.id,
      {
        status: 'contactada',
        internalObservations: 'Se llamo a la solicitante.',
        changedBy: authenticatedUser.id,
      },
    );
  });

  it('lista ofrecimientos de donacion desde backoffice', async () => {
    donationRepository.findAdminOffers.mockResolvedValue({
      items: [donationOffer],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    await request(app.getHttpServer())
      .get('/admin/donations/offers?page=1&limit=10')
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }) => {
        expect(body.items[0].id).toBe(donationOffer.id);
      });

    expect(donationRepository.findAdminOffers).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
  });

  it('actualiza estado de un ofrecimiento de donacion', async () => {
    donationRepository.updateOfferStatus.mockResolvedValue({
      ...donationOffer,
      status: 'recibida',
      internalObservations: 'Donacion recibida.',
    });

    await request(app.getHttpServer())
      .patch(`/admin/donations/offers/${donationOffer.id}/status`)
      .set('Authorization', 'Bearer fake-token')
      .send({
        status: 'recibida',
        internalObservations: 'Donacion recibida.',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('recibida');
      });

    expect(donationRepository.updateOfferStatus).toHaveBeenCalledWith(
      donationOffer.id,
      {
        status: 'recibida',
        internalObservations: 'Donacion recibida.',
      },
    );
  });

  it('obtiene una notificacion por id para el usuario autenticado', async () => {
    notificationRepository.findByIdForRecipient.mockResolvedValue(notification);

    await request(app.getHttpServer())
      .get(`/admin/notifications/${notification.id}`)
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }: HttpResponse<NotificationResponse>) => {
        expect(body.id).toBe(notification.id);
      });

    expect(notificationRepository.findByIdForRecipient).toHaveBeenCalledWith(
      notification.id,
      authenticatedUser.id,
    );
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

  it('lista operadores desde backoffice', async () => {
    userRepository.findOperators.mockResolvedValue([operator]);

    await request(app.getHttpServer())
      .get('/admin/users/operators')
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }: HttpResponse<OperatorResponse[]>) => {
        expect(body[0].id).toBe(operator.id);
      });

    expect(userRepository.findOperators).toHaveBeenCalled();
  });

  it('obtiene un operador por id desde backoffice', async () => {
    userRepository.findOperatorById.mockResolvedValue(operator);

    await request(app.getHttpServer())
      .get(`/admin/users/operators/${operator.id}`)
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }: HttpResponse<OperatorResponse>) => {
        expect(body.email).toBe(operator.email);
      });

    expect(userRepository.findOperatorById).toHaveBeenCalledWith(operator.id);
  });

  it('crea un operador desde backoffice', async () => {
    authRepository.createOperator.mockResolvedValue({
      id: operator.id,
      email: operator.email,
    });

    await request(app.getHttpServer())
      .post('/admin/users/operators')
      .set('Authorization', 'Bearer fake-token')
      .send({
        email: operator.email,
        password: 'secret123',
        firstNames: operator.firstNames,
        lastNames: operator.lastNames,
        phone: operator.phone,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          id: operator.id,
          email: operator.email,
        });
      });

    expect(authRepository.createOperator).toHaveBeenCalledWith({
      email: operator.email,
      password: 'secret123',
      firstNames: operator.firstNames,
      lastNames: operator.lastNames,
      phone: operator.phone,
      assignedBy: authenticatedUser.id,
    });
  });

  it('responde 500 si crear operador devuelve una respuesta invalida', async () => {
    authRepository.createOperator.mockResolvedValue({});

    await request(app.getHttpServer())
      .post('/admin/users/operators')
      .set('Authorization', 'Bearer fake-token')
      .send({
        email: operator.email,
        password: 'secret123',
      })
      .expect(500);
  });

  it('actualiza un operador desde backoffice', async () => {
    userRepository.updateOperator.mockResolvedValue({
      ...operator,
      firstNames: 'Operador Editado',
    });

    await request(app.getHttpServer())
      .patch(`/admin/users/operators/${operator.id}`)
      .set('Authorization', 'Bearer fake-token')
      .send({
        firstNames: 'Operador Editado',
      })
      .expect(200)
      .expect(({ body }: HttpResponse<OperatorResponse>) => {
        expect(body.firstNames).toBe('Operador Editado');
      });

    expect(userRepository.updateOperator).toHaveBeenCalledWith(operator.id, {
      firstNames: 'Operador Editado',
    });
  });

  it('actualiza el estado de un operador desde backoffice', async () => {
    userRepository.updateOperator.mockResolvedValue({
      ...operator,
      isActive: false,
    });

    await request(app.getHttpServer())
      .patch(`/admin/users/operators/${operator.id}/status`)
      .set('Authorization', 'Bearer fake-token')
      .send({
        isActive: false,
      })
      .expect(200)
      .expect(({ body }: HttpResponse<OperatorResponse>) => {
        expect(body.isActive).toBe(false);
      });

    expect(userRepository.updateOperator).toHaveBeenCalledWith(operator.id, {
      isActive: false,
    });
  });

  it('lista secciones del sitio desde backoffice', async () => {
    siteSectionRepository.findAdminSections.mockResolvedValue([siteSection]);

    await request(app.getHttpServer())
      .get('/admin/site-sections')
      .set('Authorization', 'Bearer fake-token')
      .expect(200)
      .expect(({ body }: HttpResponse<SiteSectionResponse[]>) => {
        expect(body[0].id).toBe(siteSection.id);
      });

    expect(siteSectionRepository.findAdminSections).toHaveBeenCalled();
  });

  it('crea una seccion del sitio desde backoffice', async () => {
    siteSectionRepository.createSection.mockResolvedValue(siteSection);

    await request(app.getHttpServer())
      .post('/admin/site-sections')
      .set('Authorization', 'Bearer fake-token')
      .send({
        sectionKey: 'contacto',
        title: 'Contacto',
        content: {
          phone: '0999999999',
        },
        isPublished: true,
        displayOrder: 1,
      })
      .expect(201)
      .expect(({ body }: HttpResponse<SiteSectionResponse>) => {
        expect(body.sectionKey).toBe('contacto');
      });

    expect(siteSectionRepository.createSection).toHaveBeenCalledWith({
      sectionKey: 'contacto',
      title: 'Contacto',
      content: {
        phone: '0999999999',
      },
      isPublished: true,
      displayOrder: 1,
    });
  });

  it('actualiza una seccion del sitio desde backoffice', async () => {
    siteSectionRepository.updateSection.mockResolvedValue({
      ...siteSection,
      title: 'Contacto actualizado',
    });

    await request(app.getHttpServer())
      .patch(`/admin/site-sections/${siteSection.id}`)
      .set('Authorization', 'Bearer fake-token')
      .send({
        title: 'Contacto actualizado',
      })
      .expect(200)
      .expect(({ body }: HttpResponse<SiteSectionResponse>) => {
        expect(body.title).toBe('Contacto actualizado');
      });

    expect(siteSectionRepository.updateSection).toHaveBeenCalledWith(
      siteSection.id,
      {
        title: 'Contacto actualizado',
      },
    );
  });

  it('elimina una seccion del sitio desde backoffice', async () => {
    siteSectionRepository.deleteSection.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .delete(`/admin/site-sections/${siteSection.id}`)
      .set('Authorization', 'Bearer fake-token')
      .expect(204);

    expect(siteSectionRepository.deleteSection).toHaveBeenCalledWith(
      siteSection.id,
    );
  });
});
