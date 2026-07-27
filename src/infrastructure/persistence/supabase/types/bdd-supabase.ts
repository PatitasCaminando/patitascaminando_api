export type StaffProfileRow = {
  id: string;
  role: 'admin' | 'operator';
  is_active: boolean;
  receive_form_notifications: boolean;
  created_at: string;
  updated_at: string;
};

export type SiteSectionRow = {
  id: string;
  section_key:
    'rescatistas' | 'bienestar_animal' | 'contacto' | 'redes_sociales';
  title: string | null;
  content: Record<string, unknown>;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type AnimalProfileRow = {
  id: string;
  name: string;
  species: string;
  sex: string;
  approximate_age: string;
  size: string;
  description: string;
  general_condition: string;
  photo_paths: string[];
  status:
    'disponible' | 'en_proceso' | 'adoptado' | 'no_disponible' | 'archivado';
  is_active: boolean;
  is_publicly_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type HousingTypeRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  requires_other_detail: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type AdoptionApplicationRow = {
  id: string;
  first_names: string;
  last_names: string;
  phone: string;
  email: string;
  desired_animal_description: string;
  adoption_reason: string;
  specific_animal_id: string | null;
  additional_message: string | null;
  data_processing_accepted: boolean;
  data_processing_accepted_at: string;
  status:
    | 'recibida'
    | 'contactada'
    | 'cita_programada'
    | 'aprobada'
    | 'rechazada'
    | 'cancelada';
  internal_observations: string | null;
  notification_status: 'pendiente' | 'generada' | 'error';
  notification_error: string | null;
  submitted_at: string;
  updated_at: string;
  row_version: number;
};

export type DonationOfferRow = {
  id: string;
  first_names: string;
  last_names: string;
  phone: string;
  email: string;
  selected_items: string[];
  approximate_quantity: string | null;
  product_name: string | null;
  item_condition: string | null;
  expiration_date: string | null;
  delivery_availability: string | null;
  other_description: string | null;
  description_observation: string;
  data_processing_accepted: boolean;
  data_processing_accepted_at: string;
  status:
    | 'ofrecida'
    | 'contactada'
    | 'entrega_coordinada'
    | 'recibida'
    | 'no_aceptada'
    | 'cancelada';
  internal_observations: string | null;
  notification_status: 'pendiente' | 'generada' | 'error';
  notification_error: string | null;
  submitted_at: string;
  updated_at: string;
  row_version: number;
};

export type NotificationRow = {
  id: string;
  recipient_user_id: string;
  form_type: 'adopcion' | 'donacion';
  adoption_application_id: string | null;
  donation_offer_id: string | null;
  person_name: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  recipient_email: string;
  email_subject: string;
  email_body: string;
  email_status: 'pendiente' | 'enviado' | 'fallido';
  email_attempt_count: number;
  email_last_attempt_at: string | null;
  email_sent_at: string | null;
  email_error: string | null;
  created_at: string;
};
