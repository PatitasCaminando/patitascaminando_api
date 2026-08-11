export type DonationStatus =
  | 'ofrecida'
  | 'contactada'
  | 'entrega_coordinada'
  | 'recibida'
  | 'no_aceptada'
  | 'cancelada';

export type DonationNotificationStatus = 'pendiente' | 'generada' | 'error';

export interface DonationOffer {
  id: string;
  firstNames: string;
  lastNames: string;
  phone: string;
  email: string;
  selectedItems: string[];
  approximateQuantity: string | null;
  productName: string | null;
  itemCondition: string | null;
  expirationDate: string | null;
  deliveryAvailability: string | null;
  otherDescription: string | null;
  descriptionObservation: string;
  dataProcessingAccepted: boolean;
  dataProcessingAcceptedAt: string;
  status: DonationStatus;
  internalObservations: string | null;
  notificationStatus: DonationNotificationStatus;
  notificationError: string | null;
  submittedAt: string;
  updatedAt: string;
  rowVersion: number;
}
