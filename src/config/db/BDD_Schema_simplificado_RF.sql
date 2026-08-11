-- ============================================================================
-- FUNDACIÓN PATITAS CAMINANDO
-- ESQUEMA SIMPLIFICADO SEGÚN REQUERIMIENTOS FUNCIONALES
-- PostgreSQL / Supabase
-- ============================================================================
-- TABLAS PROPIAS: 6
--   1. staff_profiles          Personal interno, rol y estado
--   2. site_sections           Contenido, contacto y redes sociales
--   3. animals                 Animales y fotografías
--   4. adoption_applications   Formularios de adopción
--   5. donation_offers         Donaciones en especie y sus artículos
--   6. notifications           Notificación interna y control del correo
--
-- Dependencia externa:
--   auth.users                 Credenciales y recuperación de contraseña
--
-- No incluye funcionalidades fuera del alcance inicial: pagos, cuentas
-- bancarias, chat, WhatsApp automático, citas automáticas, geolocalización,
-- expedientes veterinarios, estadísticas avanzadas ni auditoría completa.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. FUNCIONES GENERALES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at_and_version()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    NEW.row_version := OLD.row_version + 1;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_physical_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'El registro % debe conservarse y no puede eliminarse físicamente.',
        OLD.id;
END;
$$;

-- ============================================================================
-- 2. PERSONAL INTERNO
-- ============================================================================
-- Las credenciales, contraseñas y tokens de recuperación se administran en
-- auth.users mediante Supabase Auth. No se duplican datos sensibles aquí.
-- Los permisos son fijos según el rol definido en RF-11, por lo cual no se
-- necesitan tablas separadas de roles y permisos.

CREATE TABLE public.staff_profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE RESTRICT,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'operator')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Los administradores activos siempre reciben avisos.
    -- En operadores determina si están autorizados para recibirlos.
    receive_form_notifications BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CONTENIDO PÚBLICO
-- ============================================================================
-- Una sola tabla administra las secciones públicas. El contenido JSONB permite
-- guardar únicamente los datos propios de cada sección sin crear tablas para
-- contacto y redes sociales.
--
-- Ejemplos de content:
-- contacto:
-- {"phone":"...", "whatsapp":"...", "email":"...", "service_area":"..."}
-- redes_sociales:
-- {"links":[{"platform":"Facebook", "url":"https://..."}]}

CREATE TABLE public.site_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    section_key VARCHAR(40) NOT NULL UNIQUE
        CHECK (section_key IN (
            'rescatistas',
            'bienestar_animal',
            'contacto',
            'redes_sociales'
        )),

    title VARCHAR(250),
    content JSONB NOT NULL DEFAULT '{}'::JSONB,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_published_section_has_content CHECK (
        is_published = FALSE OR content <> '{}'::JSONB
    )
);

-- ============================================================================
-- 4. ANIMALES
-- ============================================================================
-- Las fotografías se almacenan como rutas dentro de un arreglo. La validación
-- de formato y tamaño del archivo se realiza en backend antes de guardar.

CREATE TABLE public.animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(200) NOT NULL,
    species VARCHAR(100) NOT NULL,
    sex VARCHAR(50) NOT NULL,
    approximate_age VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    general_condition TEXT NOT NULL,

    photo_paths TEXT[] NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'disponible'
        CHECK (status IN (
            'disponible',
            'en_proceso',
            'adoptado',
            'no_disponible',
            'archivado'
        )),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_publicly_visible BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_animal_required_text CHECK (
        NULLIF(BTRIM(name), '') IS NOT NULL
        AND NULLIF(BTRIM(species), '') IS NOT NULL
        AND NULLIF(BTRIM(sex), '') IS NOT NULL
        AND NULLIF(BTRIM(approximate_age), '') IS NOT NULL
        AND NULLIF(BTRIM(size), '') IS NOT NULL
        AND NULLIF(BTRIM(description), '') IS NOT NULL
        AND NULLIF(BTRIM(general_condition), '') IS NOT NULL
    ),

    CONSTRAINT chk_animal_has_photo CHECK (
        CARDINALITY(photo_paths) >= 1
        AND ARRAY_POSITION(photo_paths, NULL) IS NULL
    ),

    CONSTRAINT chk_archived_animal_hidden CHECK (
        status <> 'archivado'
        OR (is_active = FALSE AND is_publicly_visible = FALSE)
    )
);

-- ============================================================================
-- 5. SOLICITUDES DE ADOPCIÓN
-- ============================================================================
-- El visitante no necesita cuenta. specific_animal_id es opcional.

CREATE TABLE public.adoption_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_names VARCHAR(150) NOT NULL,
    last_names VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,

    desired_animal_description TEXT NOT NULL,
    adoption_reason TEXT NOT NULL,

    specific_animal_id UUID
        REFERENCES public.animals(id)
        ON DELETE RESTRICT,

    additional_message TEXT,

    data_processing_accepted BOOLEAN NOT NULL,
    data_processing_accepted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(30) NOT NULL DEFAULT 'recibida'
        CHECK (status IN (
            'recibida',
            'contactada',
            'cita_programada',
            'aprobada',
            'rechazada',
            'cancelada'
        )),

    internal_observations TEXT,

    -- Permite registrar si la generación de notificaciones tuvo problemas.
    notification_status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (notification_status IN ('pendiente', 'generada', 'error')),
    notification_error TEXT,

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    row_version BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT chk_adoption_required_text CHECK (
        NULLIF(BTRIM(first_names), '') IS NOT NULL
        AND NULLIF(BTRIM(last_names), '') IS NOT NULL
        AND NULLIF(BTRIM(desired_animal_description), '') IS NOT NULL
        AND NULLIF(BTRIM(adoption_reason), '') IS NOT NULL
    ),

    CONSTRAINT chk_adoption_email CHECK (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),

    CONSTRAINT chk_adoption_phone CHECK (
        LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) BETWEEN 7 AND 15
    ),

    CONSTRAINT chk_adoption_consent CHECK (
        data_processing_accepted = TRUE
    )
);

-- ============================================================================
-- 6. DONACIONES EN ESPECIE
-- ============================================================================
-- selected_items permite seleccionar varias categorías sin crear un catálogo
-- ni una tabla de detalle. Los datos adicionales describen el ofrecimiento.
-- No existen campos monetarios o financieros.

CREATE TABLE public.donation_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_names VARCHAR(150) NOT NULL,
    last_names VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,

    selected_items TEXT[] NOT NULL,
    approximate_quantity VARCHAR(100),
    product_name VARCHAR(200),
    item_condition VARCHAR(200),
    expiration_date DATE,
    delivery_availability TEXT,
    other_description TEXT,

    description_observation TEXT NOT NULL,

    data_processing_accepted BOOLEAN NOT NULL,
    data_processing_accepted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(30) NOT NULL DEFAULT 'ofrecida'
        CHECK (status IN (
            'ofrecida',
            'contactada',
            'entrega_coordinada',
            'recibida',
            'no_aceptada',
            'cancelada'
        )),

    internal_observations TEXT,

    notification_status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (notification_status IN ('pendiente', 'generada', 'error')),
    notification_error TEXT,

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    row_version BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT chk_donation_required_text CHECK (
        NULLIF(BTRIM(first_names), '') IS NOT NULL
        AND NULLIF(BTRIM(last_names), '') IS NOT NULL
        AND NULLIF(BTRIM(description_observation), '') IS NOT NULL
    ),

    CONSTRAINT chk_donation_email CHECK (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),

    CONSTRAINT chk_donation_phone CHECK (
        LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) BETWEEN 7 AND 15
    ),

    CONSTRAINT chk_donation_consent CHECK (
        data_processing_accepted = TRUE
    ),

    CONSTRAINT chk_donation_items_required CHECK (
        CARDINALITY(selected_items) >= 1
        AND ARRAY_POSITION(selected_items, NULL) IS NULL
    ),

    CONSTRAINT chk_donation_allowed_items CHECK (
        selected_items <@ ARRAY[
            'alimento_perros',
            'alimento_gatos',
            'medicinas',
            'productos_higiene',
            'utensilios_limpieza',
            'camas',
            'mantas',
            'juguetes',
            'correas',
            'collares',
            'platos',
            'transportadoras',
            'otros'
        ]::TEXT[]
    ),

    CONSTRAINT chk_other_item_description CHECK (
        NOT ('otros' = ANY(selected_items))
        OR NULLIF(BTRIM(other_description), '') IS NOT NULL
    )
);

-- ============================================================================
-- 7. NOTIFICACIONES INTERNAS Y CONTROL DE CORREO
-- ============================================================================
-- Cada fila representa la notificación de un destinatario. En el mismo registro
-- se conserva el estado de lectura y el resultado del correo, eliminando la
-- necesidad de tablas separadas de eventos y cola de correo.

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    recipient_user_id UUID NOT NULL
        REFERENCES public.staff_profiles(id)
        ON DELETE RESTRICT,

    form_type VARCHAR(20) NOT NULL
        CHECK (form_type IN ('adopcion', 'donacion')),

    adoption_application_id UUID
        REFERENCES public.adoption_applications(id)
        ON DELETE RESTRICT,

    donation_offer_id UUID
        REFERENCES public.donation_offers(id)
        ON DELETE RESTRICT,

    person_name VARCHAR(301) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    recipient_email VARCHAR(255) NOT NULL,
    email_subject VARCHAR(250) NOT NULL,
    email_body TEXT NOT NULL,

    email_status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (email_status IN ('pendiente', 'enviado', 'fallido')),

    email_attempt_count INTEGER NOT NULL DEFAULT 0
        CHECK (email_attempt_count >= 0),

    email_last_attempt_at TIMESTAMPTZ,
    email_sent_at TIMESTAMPTZ,
    email_error TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_notification_single_form CHECK (
        (form_type = 'adopcion'
         AND adoption_application_id IS NOT NULL
         AND donation_offer_id IS NULL)
        OR
        (form_type = 'donacion'
         AND donation_offer_id IS NOT NULL
         AND adoption_application_id IS NULL)
    ),

    CONSTRAINT chk_notification_read_state CHECK (
        (is_read = FALSE AND read_at IS NULL)
        OR (is_read = TRUE AND read_at IS NOT NULL)
    ),

    CONSTRAINT chk_notification_email_state CHECK (
        (email_status = 'pendiente' AND email_sent_at IS NULL)
        OR (email_status = 'enviado' AND email_sent_at IS NOT NULL)
        OR (email_status = 'fallido' AND email_sent_at IS NULL)
    )
);

CREATE UNIQUE INDEX uq_notification_adoption_recipient
ON public.notifications(recipient_user_id, adoption_application_id)
WHERE adoption_application_id IS NOT NULL;

CREATE UNIQUE INDEX uq_notification_donation_recipient
ON public.notifications(recipient_user_id, donation_offer_id)
WHERE donation_offer_id IS NOT NULL;

-- ============================================================================
-- 8. FUNCIONES DE AUTORIZACIÓN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.staff_profiles sp
        WHERE sp.id = auth.uid()
          AND sp.is_active = TRUE
          AND sp.role IN ('admin', 'operator')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.staff_profiles sp
        WHERE sp.id = auth.uid()
          AND sp.is_active = TRUE
          AND sp.role = 'admin'
    );
$$;

-- Uso exclusivo del backend de recuperación de contraseña. Permite comprobar
-- que el correo pertenece a una cuenta interna activa sin revelar el resultado
-- directamente al visitante.
CREATE OR REPLACE FUNCTION public.is_active_staff_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM auth.users au
        JOIN public.staff_profiles sp ON sp.id = au.id
        WHERE LOWER(au.email) = LOWER(p_email)
          AND sp.is_active = TRUE
          AND sp.role IN ('admin', 'operator')
    );
$$;

-- ============================================================================
-- 9. VALIDACIONES Y AUTOMATIZACIONES
-- ============================================================================

-- Al archivar un animal se desactiva y se oculta automáticamente.
CREATE OR REPLACE FUNCTION public.normalize_animal_visibility()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'archivado' THEN
        NEW.is_active := FALSE;
        NEW.is_publicly_visible := FALSE;
    END IF;

    RETURN NEW;
END;
$$;

-- Un animal con solicitudes relacionadas debe archivarse en lugar de borrarse.
CREATE OR REPLACE FUNCTION public.prevent_animal_delete_with_applications()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.adoption_applications aa
        WHERE aa.specific_animal_id = OLD.id
    ) THEN
        RAISE EXCEPTION
            'El animal posee solicitudes relacionadas; debe archivarse.';
    END IF;

    RETURN OLD;
END;
$$;

-- Mantiene coherencia entre is_read y read_at.
CREATE OR REPLACE FUNCTION public.sync_notification_read_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_at := COALESCE(NEW.read_at, CURRENT_TIMESTAMP);
    ELSIF NEW.is_read = FALSE THEN
        NEW.read_at := NULL;
    END IF;

    RETURN NEW;
END;
$$;

-- Genera notificaciones después de guardar correctamente el formulario.
-- No envía el correo directamente: crea el registro pendiente para que un
-- servicio de backend lo procese. Así, un fallo del correo no elimina el
-- formulario ni la notificación interna.
CREATE OR REPLACE FUNCTION public.generate_form_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    recipient RECORD;
    active_admin_count INTEGER := 0;
    v_form_type VARCHAR(20);
    v_person_name TEXT;
    v_title TEXT;
    v_message TEXT;
    v_email_subject TEXT;
    v_email_body TEXT;
BEGIN
    IF TG_TABLE_NAME = 'adoption_applications' THEN
        v_form_type := 'adopcion';
        v_person_name := CONCAT_WS(' ', NEW.first_names, NEW.last_names);
        v_title := 'Nueva solicitud de adopción';
        v_message := 'Se registró una nueva solicitud de adopción de ' || v_person_name || '.';
        v_email_subject := 'Nueva solicitud de adopción';
        v_email_body := CONCAT(
            'Tipo: Adopción', E'\n',
            'Nombre: ', v_person_name, E'\n',
            'Teléfono: ', NEW.phone, E'\n',
            'Correo: ', NEW.email, E'\n',
            'Resumen: ', NEW.desired_animal_description, E'\n',
            'Revise el registro en el panel administrativo.'
        );
    ELSE
        v_form_type := 'donacion';
        v_person_name := CONCAT_WS(' ', NEW.first_names, NEW.last_names);
        v_title := 'Nuevo ofrecimiento de donación';
        v_message := 'Se registró un nuevo ofrecimiento de donación de ' || v_person_name || '.';
        v_email_subject := 'Nuevo ofrecimiento de donación';
        v_email_body := CONCAT(
            'Tipo: Donación en especie', E'\n',
            'Nombre: ', v_person_name, E'\n',
            'Teléfono: ', NEW.phone, E'\n',
            'Correo: ', NEW.email, E'\n',
            'Resumen: ', NEW.description_observation, E'\n',
            'Revise el registro en el panel administrativo.'
        );
    END IF;

    FOR recipient IN
        SELECT sp.id, sp.role, au.email
        FROM public.staff_profiles sp
        JOIN auth.users au ON au.id = sp.id
        WHERE sp.is_active = TRUE
          AND au.email IS NOT NULL
          AND (
              sp.role = 'admin'
              OR (
                  sp.role = 'operator'
                  AND sp.receive_form_notifications = TRUE
              )
          )
    LOOP
        INSERT INTO public.notifications (
            recipient_user_id,
            form_type,
            adoption_application_id,
            donation_offer_id,
            person_name,
            title,
            message,
            recipient_email,
            email_subject,
            email_body
        ) VALUES (
            recipient.id,
            v_form_type,
            CASE WHEN v_form_type = 'adopcion' THEN NEW.id ELSE NULL END,
            CASE WHEN v_form_type = 'donacion' THEN NEW.id ELSE NULL END,
            v_person_name,
            v_title,
            v_message,
            recipient.email,
            v_email_subject,
            v_email_body
        );

        IF recipient.role = 'admin' THEN
            active_admin_count := active_admin_count + 1;
        END IF;
    END LOOP;

    IF active_admin_count = 0 THEN
        IF v_form_type = 'adopcion' THEN
            UPDATE public.adoption_applications
            SET notification_status = 'error',
                notification_error = 'No existen administradores activos con correo registrado.'
            WHERE id = NEW.id;
        ELSE
            UPDATE public.donation_offers
            SET notification_status = 'error',
                notification_error = 'No existen administradores activos con correo registrado.'
            WHERE id = NEW.id;
        END IF;
    ELSE
        IF v_form_type = 'adopcion' THEN
            UPDATE public.adoption_applications
            SET notification_status = 'generada',
                notification_error = NULL
            WHERE id = NEW.id;
        ELSE
            UPDATE public.donation_offers
            SET notification_status = 'generada',
                notification_error = NULL
            WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    IF TG_TABLE_NAME = 'adoption_applications' THEN
        UPDATE public.adoption_applications
        SET notification_status = 'error',
            notification_error = SQLERRM
        WHERE id = NEW.id;
    ELSE
        UPDATE public.donation_offers
        SET notification_status = 'error',
            notification_error = SQLERRM
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

CREATE TRIGGER trg_staff_profiles_updated_at
BEFORE UPDATE ON public.staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_site_sections_updated_at
BEFORE UPDATE ON public.site_sections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_animals_visibility
BEFORE INSERT OR UPDATE ON public.animals
FOR EACH ROW EXECUTE FUNCTION public.normalize_animal_visibility();

CREATE TRIGGER trg_animals_updated_at
BEFORE UPDATE ON public.animals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_animals_delete_validation
BEFORE DELETE ON public.animals
FOR EACH ROW EXECUTE FUNCTION public.prevent_animal_delete_with_applications();

CREATE TRIGGER trg_adoption_updated_at_version
BEFORE UPDATE ON public.adoption_applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_and_version();

CREATE TRIGGER trg_donation_updated_at_version
BEFORE UPDATE ON public.donation_offers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_and_version();

CREATE TRIGGER trg_adoption_prevent_delete
BEFORE DELETE ON public.adoption_applications
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

CREATE TRIGGER trg_donation_prevent_delete
BEFORE DELETE ON public.donation_offers
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

CREATE TRIGGER trg_notification_prevent_delete
BEFORE DELETE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.prevent_physical_delete();

CREATE TRIGGER trg_notification_read_at
BEFORE UPDATE OF is_read, read_at ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.sync_notification_read_at();

CREATE TRIGGER trg_adoption_generate_notifications
AFTER INSERT ON public.adoption_applications
FOR EACH ROW EXECUTE FUNCTION public.generate_form_notifications();

CREATE TRIGGER trg_donation_generate_notifications
AFTER INSERT ON public.donation_offers
FOR EACH ROW EXECUTE FUNCTION public.generate_form_notifications();

-- ============================================================================
-- 11. ÍNDICES
-- ============================================================================

CREATE INDEX idx_staff_profiles_role_active
ON public.staff_profiles(role, is_active);

CREATE INDEX idx_site_sections_public
ON public.site_sections(is_published, display_order);

CREATE INDEX idx_animals_public
ON public.animals(is_active, is_publicly_visible, status);

CREATE INDEX idx_adoption_status_date
ON public.adoption_applications(status, submitted_at DESC);

CREATE INDEX idx_adoption_specific_animal
ON public.adoption_applications(specific_animal_id);

CREATE INDEX idx_donation_status_date
ON public.donation_offers(status, submitted_at DESC);

CREATE INDEX idx_notifications_recipient_read
ON public.notifications(recipient_user_id, is_read, created_at DESC);

CREATE INDEX idx_notifications_email_queue
ON public.notifications(email_status, created_at)
WHERE email_status IN ('pendiente', 'fallido');

-- ============================================================================
-- 12. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PERSONAL INTERNO ------------------------------------------------------------

CREATE POLICY staff_select_own_or_admin
ON public.staff_profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY staff_insert_admin
ON public.staff_profiles
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY staff_update_admin
ON public.staff_profiles
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- CONTENIDO PÚBLICO -----------------------------------------------------------

CREATE POLICY site_sections_public_select
ON public.site_sections
FOR SELECT TO anon, authenticated
USING (is_published = TRUE);

CREATE POLICY site_sections_admin_select
ON public.site_sections
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY site_sections_admin_insert
ON public.site_sections
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY site_sections_admin_update
ON public.site_sections
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY site_sections_admin_delete
ON public.site_sections
FOR DELETE TO authenticated
USING (public.is_admin());

-- ANIMALES --------------------------------------------------------------------

CREATE POLICY animals_public_select
ON public.animals
FOR SELECT TO anon, authenticated
USING (
    is_active = TRUE
    AND is_publicly_visible = TRUE
    AND status <> 'archivado'
);

CREATE POLICY animals_staff_select
ON public.animals
FOR SELECT TO authenticated
USING (public.is_active_staff());

CREATE POLICY animals_staff_insert
ON public.animals
FOR INSERT TO authenticated
WITH CHECK (public.is_active_staff());

CREATE POLICY animals_staff_update
ON public.animals
FOR UPDATE TO authenticated
USING (public.is_active_staff())
WITH CHECK (public.is_active_staff());

CREATE POLICY animals_staff_delete
ON public.animals
FOR DELETE TO authenticated
USING (public.is_active_staff());

-- FORMULARIOS -----------------------------------------------------------------

CREATE POLICY adoption_public_insert
ON public.adoption_applications
FOR INSERT TO anon, authenticated
WITH CHECK (
    status = 'recibida'
    AND data_processing_accepted = TRUE
    AND internal_observations IS NULL
    AND notification_status = 'pendiente'
    AND notification_error IS NULL
    AND row_version = 1
);

CREATE POLICY adoption_staff_select
ON public.adoption_applications
FOR SELECT TO authenticated
USING (public.is_active_staff());

CREATE POLICY adoption_staff_update
ON public.adoption_applications
FOR UPDATE TO authenticated
USING (public.is_active_staff())
WITH CHECK (public.is_active_staff());

CREATE POLICY donation_public_insert
ON public.donation_offers
FOR INSERT TO anon, authenticated
WITH CHECK (
    status = 'ofrecida'
    AND data_processing_accepted = TRUE
    AND internal_observations IS NULL
    AND notification_status = 'pendiente'
    AND notification_error IS NULL
    AND row_version = 1
);

CREATE POLICY donation_staff_select
ON public.donation_offers
FOR SELECT TO authenticated
USING (public.is_active_staff());

CREATE POLICY donation_staff_update
ON public.donation_offers
FOR UPDATE TO authenticated
USING (public.is_active_staff())
WITH CHECK (public.is_active_staff());

-- NOTIFICACIONES --------------------------------------------------------------

CREATE POLICY notifications_recipient_select
ON public.notifications
FOR SELECT TO authenticated
USING (
    recipient_user_id = auth.uid()
    AND public.is_active_staff()
);

CREATE POLICY notifications_recipient_update
ON public.notifications
FOR UPDATE TO authenticated
USING (
    recipient_user_id = auth.uid()
    AND public.is_active_staff()
)
WITH CHECK (
    recipient_user_id = auth.uid()
    AND public.is_active_staff()
);

-- ============================================================================
-- 13. PERMISOS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.site_sections, public.animals
TO anon, authenticated;

GRANT INSERT (
    first_names,
    last_names,
    phone,
    email,
    desired_animal_description,
    adoption_reason,
    specific_animal_id,
    additional_message,
    data_processing_accepted
) ON public.adoption_applications TO anon, authenticated;

GRANT INSERT (
    first_names,
    last_names,
    phone,
    email,
    selected_items,
    approximate_quantity,
    product_name,
    item_condition,
    expiration_date,
    delivery_availability,
    other_description,
    description_observation,
    data_processing_accepted
) ON public.donation_offers TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.staff_profiles
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_sections, public.animals
TO authenticated;

GRANT SELECT ON public.adoption_applications, public.donation_offers
TO authenticated;

GRANT UPDATE (status, internal_observations)
ON public.adoption_applications TO authenticated;

GRANT UPDATE (status, internal_observations)
ON public.donation_offers TO authenticated;

GRANT SELECT ON public.notifications TO authenticated;
GRANT UPDATE (is_read, read_at) ON public.notifications TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_active_staff() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

REVOKE ALL ON FUNCTION public.is_active_staff_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_staff_email(TEXT) TO service_role;

-- ============================================================================
-- 14. DATOS INICIALES DE CONTENIDO
-- ============================================================================

INSERT INTO public.site_sections (
    section_key,
    title,
    content,
    is_published,
    display_order
)
VALUES
    ('rescatistas', 'Información de los rescatistas', '{}'::JSONB, FALSE, 1),
    ('bienestar_animal', 'Bienestar animal', '{}'::JSONB, FALSE, 2),
    ('contacto', 'Contacto', '{}'::JSONB, FALSE, 3),
    ('redes_sociales', 'Redes sociales', '{}'::JSONB, FALSE, 4)
ON CONFLICT (section_key) DO NOTHING;

-- ============================================================================
-- 15. ADMINISTRADOR INICIAL
-- ============================================================================
-- Crear primero en Supabase Auth:
--   correo: admin@rescatistas.local
--   contraseña temporal: Cambiar123!
--
-- Después, insertar su UUID real:
--
-- INSERT INTO public.staff_profiles (
--     id,
--     role,
--     is_active,
--     receive_form_notifications
-- ) VALUES (
--     '<UUID_GENERADO_EN_AUTH_USERS>',
--     'admin',
--     TRUE,
--     TRUE
-- );
-- ============================================================================
