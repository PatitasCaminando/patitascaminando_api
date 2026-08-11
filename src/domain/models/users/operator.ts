export interface Operator {
  id: string;
  email: string | null;
  firstNames: string | null;
  lastNames: string | null;
  phone: string | null;
  isActive: boolean;
  receiveFormNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}
