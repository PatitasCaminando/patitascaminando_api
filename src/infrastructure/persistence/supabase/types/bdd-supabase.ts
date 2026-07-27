export type ProfileRow = {
  id: string;
  avatar_id: string | null;
  first_names: string | null;
  last_names: string | null;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  housing_sector: string | null;
  status: 'active' | 'inactive' | 'blocked';
  user_type: 'public' | 'staff';
  created_at: string;
  updated_at: string;
};

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

export type UserRoleRow = {
  role_key: string;
  roles: {
    key: string;
    name: string;
    description: string | null;
    is_internal: boolean;
    created_at: string;
  } | null;
};

export type RolePermissionRow = {
  role_key: string;
  permissions: {
    key: string;
    module: string;
    description: string;
    created_at: string;
  } | null;
};

export type AvatarOptionRow = {
  id: string;
  key: string;
  name: string;
  image_url: string;
  is_default: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type BadgeRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type UserBadgeRow = {
  id: string;
  user_id: string;
  badge_id: string;
  source_module: string | null;
  source_id: string | null;
  awarded_at: string;
  awarded_by: string | null;
  badges?: BadgeRow | null;
};

export type ManagedRoleRow = {
  key: string;
  name: string;
  description: string | null;
  is_internal: boolean;
  created_at: string;
};

export type ManagedPermissionRow = {
  key: string;
  module: string;
  description: string;
  created_at: string;
};

export type ManagedRolePermissionRow = {
  role_key: string;
  permission_key: string;
  created_at: string;
  permissions?: ManagedPermissionRow | null;
};

export type MediaAssetRow = {
  id: string;
  bucket: string;
  path: string;
  public_url: string | null;
  alt_text: string | null;
  media_type: 'image' | 'video' | 'document' | 'other';
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LandingSectionRow = {
  id: string;
  key: string;
  title: string | null;
  highlighted_text: string | null;
  subtitle: string | null;
  main_media_id: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type HeroCardRow = {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  cta_label: string | null;
  cta_href: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LandingImpactBlockRow = {
  id: string;
  section_id: string;
  prefix_text: string | null;
  metric_value: number;
  suffix_text: string | null;
  description: string | null;
  icon: string | null;
  cta_label: string | null;
  cta_href: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LandingInfoCardRow = {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  cta_label: string | null;
  cta_href: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PublicationCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PublicationRow = {
  id: string;
  category_id: string | null;
  cover_media_id: string | null;
  created_by: string | null;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  content: string | null;
  type: 'post' | 'campaign' | 'event' | 'news' | 'about';
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  featured_section: string | null;
  event_date: string | null;
  date_label: string | null;
  cta_label: string | null;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  publication_categories?: PublicationCategoryRow | null;
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

export type AnimalImageRow = {
  id: string;
  animal_id: string;
  media_id: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  media_assets?: MediaAssetRow | null;
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

export type VolunteerRequirementRow = {
  id: string;
  title: string;
  description: string | null;
  type: 'material' | 'schedule' | 'condition' | 'other';
  is_required: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type VolunteerApplicationRow = {
  id: string;
  user_id: string;
  motivation: string;
  availability_type: 'weekdays' | 'weekends' | 'both';
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  is_adult_confirmed: boolean;
  reviewed_by: string | null;
  review_message: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type VolunteerProfileRow = {
  id: string;
  user_id: string;
  approved_application_id: string;
  status: 'active' | 'inactive' | 'suspended';
  approved_at: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ContactInfoRow = {
  id: string;
  whatsapp_number: string | null;
  phone_label: string | null;
  email: string | null;
  address: string | null;
  map_embed_url: string | null;
  google_maps_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SocialLinkRow = {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  icon: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type FaqItemRow = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
