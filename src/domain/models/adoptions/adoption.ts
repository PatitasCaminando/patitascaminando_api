export type AdoptionStatus =
  | 'recibida'
  | 'contactada'
  | 'cita_programada'
  | 'aprobada'
  | 'rechazada'
  | 'cancelada';

export type AdoptionNotificationStatus = 'pendiente' | 'generada' | 'error';

export interface AdoptionApplication {
  id: string;
  firstNames: string;
  lastNames: string;
  phone: string;
  email: string;
  desiredAnimalDescription: string;
  adoptionReason: string;
  specificAnimalId: string | null;
  additionalMessage: string | null;
  dataProcessingAccepted: boolean;
  dataProcessingAcceptedAt: string;
  status: AdoptionStatus;
  internalObservations: string | null;
  notificationStatus: AdoptionNotificationStatus;
  notificationError: string | null;
  submittedAt: string;
  updatedAt: string;
  rowVersion: number;
}

export interface AdoptionStatusHistory {
  id: string;
  applicationId: string;
  previousStatus: AdoptionStatus | null;
  newStatus: AdoptionStatus;
  message: string | null;
  changedBy: string | null;
  createdAt: string;
}
