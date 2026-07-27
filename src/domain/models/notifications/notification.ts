export type NotificationFormType = 'adopcion' | 'donacion';
export type NotificationEmailStatus = 'pendiente' | 'enviado' | 'fallido';

export interface Notification {
  id: string;
  recipientUserId: string;
  formType: NotificationFormType;
  adoptionApplicationId: string | null;
  donationOfferId: string | null;
  personName: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  recipientEmail: string;
  emailSubject: string;
  emailBody: string;
  emailStatus: NotificationEmailStatus;
  emailAttemptCount: number;
  emailLastAttemptAt: string | null;
  emailSentAt: string | null;
  emailError: string | null;
  createdAt: string;
}
