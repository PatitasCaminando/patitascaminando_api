export type AnimalSpecies = string;
export type AnimalSex = string;
export type AnimalSize = string;
export type AnimalStatus =
  'disponible' | 'en_proceso' | 'adoptado' | 'no_disponible' | 'archivado';

export interface AnimalImage {
  id: string;
  animalId: string;
  mediaId: string;
  isPrimary: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Animal {
  id: string;
  name: string;
  species: AnimalSpecies;
  sex: AnimalSex;
  size: AnimalSize;
  approximateAge: string;
  status: AnimalStatus;
  description: string;
  generalCondition: string;
  photoPaths: string[];
  isSterilized: boolean | null;
  isVaccinated: boolean | null;
  isDewormed: boolean | null;
  isActive: boolean;
  isPubliclyVisible: boolean;
  createdAt: string;
  updatedAt: string;
  images?: AnimalImage[];
}
