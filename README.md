# Patitas Caminando API

Backend NestJS para la plataforma de la Fundacion Patitas Caminando. El proyecto esta alineado con el documento `ESPECIFICACION DE REQUERIMIENTOS FUNCIONALES` y con el esquema `BDD_Schema_simplificado_RF.sql`.

La API se centra en el alcance simplificado de la fundacion: contenido publico, animales, solicitudes de adopcion, donaciones en especie, autenticacion del personal interno, operadores y notificaciones administrativas.

## Stack

```txt
NestJS
TypeScript
Supabase Auth
Supabase PostgreSQL
Supabase Storage
Postman
```

## Alcance Actual

El backend implementa los modulos propios definidos en la BDD simplificada:

```txt
staff_profiles
site_sections
animals
adoption_applications
donation_offers
notifications
```

No se mantienen modulos heredados del proyecto anterior como `landing`, `media`, `publications`, `settings`, `volunteers` o `identity-management`. La informacion publica se administra mediante `site_sections`.

## Variables De Entorno

Crear un archivo `.env` con:

```txt
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PASSWORD_RESET_REDIRECT_URL=http://localhost:5173/reset-password
SUPABASE_ANIMAL_IMAGES_BUCKET=animals
MAX_ANIMAL_IMAGE_SIZE_MB=5
```

`SUPABASE_SERVICE_ROLE_KEY` es privada. No debe subirse al repositorio ni usarse desde el frontend.

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run start:dev
```

URL local:

```txt
http://localhost:3000
```

Si el puerto 3000 esta ocupado, detener el proceso que lo usa o cambiar el puerto en la configuracion de ejecucion.

## Validacion

```bash
npm run format
npm run lint
npm run build
```

## Base De Datos

Ejecutar `BDD_Schema_simplificado_RF.sql` en Supabase SQL Editor para crear tablas, constraints, indices, RLS, policies, triggers y datos iniciales.

La BDD delega credenciales, sesiones y recuperacion de contrasena en:

```txt
auth.users
```

Las tablas propias no guardan contrasenas ni tokens.

## Administrador Inicial

El primer administrador se crea manualmente en Supabase Auth y luego se vincula en `staff_profiles`.

Ejemplo:

```sql
INSERT INTO public.staff_profiles (
  id,
  role,
  is_active,
  receive_form_notifications
) VALUES (
  '<UUID_DEL_USUARIO_EN_AUTH_USERS>',
  'admin',
  TRUE,
  TRUE
);
```

Despues de eso, el administrador puede crear operadores desde:

```http
POST /admin/users/operators
```

## Autenticacion Y Roles

El login es unico para el personal interno:

```http
POST /auth/login
```

Sirve para administradores y operadores. La diferencia no esta en otro endpoint, sino en el registro de `staff_profiles.role`.

Roles:

```txt
admin
operator
```

Permisos actuales:

```txt
animals.manage
adoptions.manage
donations.manage
notifications.manage
users.manage
```

`users.manage` aplica para administrador. Los operadores pueden gestionar animales, adopciones, donaciones y notificaciones si estan activos.

## Recuperacion De Contrasena

La recuperacion de contrasena se gestiona con Supabase Auth. La API inicia el proceso para validar que sea una cuenta interna activa sin revelar si el correo existe; Supabase genera el enlace temporal y el frontend completa el cambio de contrasena.

Flujo esperado:

1. El usuario interno pulsa "Olvide mi contrasena" en el frontend.
2. El frontend solicita el correo.
3. El frontend llama a la API:

```http
POST /auth/forgot-password
```

Body:

```json
{
  "email": "admin@rescatistas.local"
}
```

Respuesta:

```json
{
  "message": "Si el correo ingresado esta asociado a una cuenta activa, recibira las instrucciones para restablecer su contrasena."
}
```

4. La API comprueba internamente `is_active_staff_email` y, si corresponde, solicita a Supabase el envio del correo de recuperacion.
5. El usuario abre el enlace.
6. El frontend muestra la pantalla para nueva contrasena.
7. El frontend actualiza la contrasena:

```ts
await supabase.auth.updateUser({
  password: newPassword,
});
```

En Supabase se deben configurar las Redirect URLs:

```txt
http://localhost:5173/**
https://tu-dominio.com/**
```

Esto cumple el requisito de recuperacion usando el proveedor de autenticacion definido por la arquitectura.

## Manejo De Imagenes

La BDD simplificada guarda rutas de imagen en `animals.photo_paths`. La API actual guarda paths como:

```json
{
  "photoPaths": ["animals/luna-1.jpg"]
}
```

El archivo fisico debe almacenarse en Supabase Storage desde el frontend o mediante un endpoint futuro con Multer. En esta version, la API administra las rutas, no sube binarios.

## Notificaciones

La BDD contiene triggers que generan notificaciones al crear:

```txt
adoption_applications
donation_offers
```

Las notificaciones se crean para:

```txt
administradores activos
operadores activos con receive_form_notifications = TRUE
```

La API permite consultar las notificaciones del usuario autenticado y marcarlas como leidas.

El envio real de correo queda preparado por campos como:

```txt
email_subject
email_body
email_status
email_attempt_count
email_sent_at
email_error
```

La notificacion interna esta implementada. El envio SMTP o worker de correo puede agregarse como mejora si el despliegue exige correo automatico real.

## Endpoints

Todos los endpoints privados usan:

```http
Authorization: Bearer <accessToken>
```

El token se obtiene con `POST /auth/login`.

### Respuesta Paginada

Los listados de animales, solicitudes de adopcion y ofrecimientos de donacion aceptan:

```http
?page=1&limit=10
```

Respuesta:

```json
{
  "items": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 0
}
```

### Auth

#### POST /auth/login

Inicia sesion de un usuario interno.

Body:

```json
{
  "email": "admin@example.com",
  "password": "Cambiar123!"
}
```

Uso:

```txt
Administrador y operador.
```

Devuelve:

```txt
accessToken
refreshToken
user
```

#### GET /auth/me

Devuelve el usuario interno autenticado, su perfil, roles y permisos.

Uso:

```txt
Validar sesion actual y cargar permisos en el front.
```

### Public

#### GET /public/site-sections

Lista secciones publicadas del sitio.

Uso:

```txt
Mostrar informacion publica como rescatistas, bienestar animal, contacto y redes sociales.
```

#### GET /public/animals?page=1&limit=10

Lista animales activos, visibles publicamente y no archivados. Responde paginado.

Uso:

```txt
Catalogo publico de animales disponibles o en proceso.
```

#### GET /public/animals/:slug

Devuelve el detalle publico de un animal. En la implementacion actual el parametro se usa como identificador del animal.

Uso:

```txt
Vista detalle del animal seleccionado.
```

#### POST /public/adoptions/applications

Registra una solicitud publica de adopcion.

Body principal:

```json
{
  "firstNames": "Dayana",
  "lastNames": "Castillo",
  "phone": "0999999999",
  "email": "dayana@example.com",
  "desiredAnimalDescription": "Perrito pequeno y tranquilo",
  "adoptionReason": "Deseo brindar un hogar responsable",
  "specificAnimalId": null,
  "additionalMessage": "Puedo coordinar una visita esta semana",
  "dataProcessingAccepted": true
}
```

Efecto:

```txt
Crea adoption_applications y la BDD genera notificaciones internas.
```

#### POST /public/donations/offers

Registra una oferta publica de donacion en especie.

Body principal:

```json
{
  "firstNames": "Dayana",
  "lastNames": "Castillo",
  "phone": "0999999999",
  "email": "dayana@example.com",
  "selectedItems": ["alimento_perros", "mantas"],
  "approximateQuantity": "2 fundas",
  "productName": "Alimento adulto",
  "itemCondition": "Nuevo",
  "expirationDate": "2026-12-31",
  "deliveryAvailability": "Fines de semana",
  "otherDescription": "",
  "descriptionObservation": "Deseo donar alimento y mantas en buen estado",
  "dataProcessingAccepted": true
}
```

Efecto:

```txt
Crea donation_offers y la BDD genera notificaciones internas.
```

### Admin - Site Sections

#### GET /admin/site-sections

Lista todas las secciones, publicadas o no.

Requiere:

```txt
admin
```

#### POST /admin/site-sections

Crea una seccion publica administrable.

Body:

```json
{
  "sectionKey": "contacto",
  "title": "Contacto",
  "content": {
    "phone": "0999999999",
    "whatsapp": "0999999999",
    "email": "contacto@patitascaminando.local"
  },
  "isPublished": true,
  "displayOrder": 1
}
```

#### PATCH /admin/site-sections/:id

Actualiza una seccion.

#### DELETE /admin/site-sections/:id

Elimina una seccion.

### Admin - Animals

#### GET /admin/animals?page=1&limit=10

Lista animales para administracion. Responde paginado.

#### POST /admin/animals

Crea un animal.

Body:

```json
{
  "name": "Luna",
  "species": "perro",
  "sex": "hembra",
  "size": "mediano",
  "approximateAge": "2 anos",
  "status": "disponible",
  "description": "Perrita sociable y tranquila",
  "generalCondition": "Buen estado general",
  "photoPaths": ["animals/luna-1.jpg"],
  "isActive": true,
  "isPubliclyVisible": true
}
```

Si la imagen se sube desde el backend, primero usar `POST /admin/animals/images/upload` y enviar la ruta devuelta en `photoPaths`.

#### PATCH /admin/animals/:id

Actualiza datos, estado, visibilidad o fotos de un animal.

#### DELETE /admin/animals/:id

Archiva un animal. La API no hace borrado fisico; cambia estado y visibilidad.

#### POST /admin/animals/images/upload

Sube una imagen desde el backoffice antes de crear el animal. Devuelve una ruta para usarla en `photoPaths`.

Request:

```txt
Content-Type: multipart/form-data
Campo: file
Formatos: JPG, PNG, WEBP
Tamano maximo: MAX_ANIMAL_IMAGE_SIZE_MB
```

Respuesta:

```json
{
  "mediaId": "animals/pending/<archivo>.jpg",
  "bucket": "animals",
  "path": "pending/<archivo>.jpg"
}
```

#### POST /admin/animals/:id/images

Agrega una ruta de imagen al arreglo `photoPaths`.

Body:

```json
{
  "mediaId": "animals/luna-2.jpg",
  "isPrimary": false,
  "orderIndex": 1
}
```

Nota: `mediaId` representa la ruta almacenada en Supabase Storage.

#### POST /admin/animals/:id/images/upload

Sube una imagen desde el backoffice al bucket de Supabase Storage configurado en `SUPABASE_ANIMAL_IMAGES_BUCKET` y agrega la ruta resultante a `animals.photo_paths`.

Request:

```txt
Content-Type: multipart/form-data
Campo: file
Formatos: JPG, PNG, WEBP
Tamano maximo: MAX_ANIMAL_IMAGE_SIZE_MB
```

Respuesta:

```json
{
  "id": "animals/<animalId>/<archivo>.jpg",
  "animalId": "<animalId>",
  "mediaId": "animals/<animalId>/<archivo>.jpg",
  "isPrimary": false,
  "orderIndex": 1
}
```

#### DELETE /admin/animals/:id/images/:imageId

Quita una ruta de imagen del animal.

### Admin - Adoptions

#### GET /admin/adoptions/applications?page=1&limit=10

Lista solicitudes de adopcion recibidas. Responde paginado.

#### PATCH /admin/adoptions/applications/:id/status

Actualiza el estado administrativo de una solicitud.

Body:

```json
{
  "status": "contactada",
  "internalObservations": "Se contacto por telefono"
}
```

### Admin - Donations

#### GET /admin/donations/offers?page=1&limit=10

Lista donaciones en especie recibidas. Responde paginado.

#### PATCH /admin/donations/offers/:id/status

Actualiza el estado administrativo de una donacion.

Body:

```json
{
  "status": "contactada",
  "internalObservations": "Se coordinara entrega"
}
```

### Admin - Notifications

#### GET /admin/notifications

Lista las notificaciones del usuario interno autenticado.

Uso:

```txt
Panel de notificaciones de administrador u operador.
```

#### GET /admin/notifications/:id

Devuelve una notificacion especifica del usuario autenticado.

#### PATCH /admin/notifications/:id/read

Marca una notificacion como leida.

### Admin - Operadores

#### GET /admin/users/operators

Lista los operadores registrados. Solo administrador.

#### GET /admin/users/operators/:id

Devuelve el detalle de un operador. Solo administrador.

#### POST /admin/users/operators

Crea un operador desde una cuenta administradora.

Body:

```json
{
  "email": "operador@example.com",
  "password": "Cambiar123!",
  "firstNames": "Operador",
  "lastNames": "Patitas",
  "phone": "0999999999"
}
```

Efecto:

```txt
Crea usuario en Supabase Auth y perfil interno en staff_profiles con rol operator.
```

#### PATCH /admin/users/operators/:id

Actualiza datos basicos y configuracion del operador. Solo administrador.

Body:

```json
{
  "firstNames": "Operador",
  "lastNames": "Patitas",
  "phone": "0999999999",
  "receiveFormNotifications": true
}
```

#### PATCH /admin/users/operators/:id/status

Activa o desactiva un operador. No elimina fisicamente la cuenta; actualiza `staff_profiles.is_active`.

Body:

```json
{
  "isActive": true
}
```

## Cumplimiento De Requisitos

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| RF-01 Contenido publico institucional | Cumple | `site_sections`, `GET /public/site-sections`, admin CRUD de secciones |
| RF-02 Gestionar animales y contenido publico | Cumple | `POST/PATCH/DELETE /admin/animals`, `GET/POST/PATCH/DELETE /admin/site-sections` |
| RF-03 Enviar solicitud de adopcion | Cumple | `POST /public/adoptions/applications` |
| RF-04 Confirmar envio de adopcion | Frontend | El API devuelve el registro creado; el mensaje visual lo muestra el frontend |
| RF-05 Enviar ofrecimiento de donacion | Cumple | `POST /public/donations/offers` |
| RF-06 Restringir donaciones a articulos en especie | Cumple | `donation_offers.selected_items`, constraints de BDD y DTO |
| RF-07 Registrar y conservar formularios | Cumple | `adoption_applications`, `donation_offers`, triggers de no eliminacion fisica |
| RF-08 Notificar a administradores | Cumple parcial | Notificaciones internas implementadas. Correo real queda fuera si el equipo decide no usarlo |
| RF-09 Gestionar solicitudes de adopcion | Cumple | `GET /admin/adoptions/applications`, `PATCH /admin/adoptions/applications/:id/status` |
| RF-10 Gestionar ofrecimientos de donacion | Cumple | `GET /admin/donations/offers`, `PATCH /admin/donations/offers/:id/status` |
| RF-11 Autenticar usuarios y controlar permisos | Cumple | `POST /auth/login`, `GET /auth/me`, roles, guards y `GET/POST/PATCH /admin/users/operators` |
| RF-12 Recuperar la contrasena | Cumple | `POST /auth/forgot-password` con Supabase Auth y cambio final desde frontend |
| Limpieza de alcance anterior | Cumple | Se eliminaron modulos antiguos no alineados con la BDD simplificada |

## Postman

La coleccion esta en:

```txt
PATITAS-CAMINANDO.postman_collection.json
```

Variables principales:

```txt
baseUrl
accessToken
siteSectionId
animalId
animalImagePath
adoptionApplicationId
donationOfferId
notificationId
```

El login guarda automaticamente `accessToken`. Los listados y creaciones guardan automaticamente IDs frecuentes para encadenar pruebas.

Orden sugerido de prueba:

1. `Auth > Login Staff`
2. `Auth > Current Staff User`
3. `Admin - Animals > Create Animal`
4. `Public > Create Adoption Application`
5. `Admin - Notifications > List My Notifications`
6. `Admin - Notifications > Mark Notification As Read`
7. `Public > Create Donation Offer`
8. `Admin - Donations > List Donation Offers`

## Notas De Alcance

No estan incluidos:

```txt
donaciones monetarias
pagos en linea
chat
WhatsApp automatico
citas automaticas
geolocalizacion
expedientes veterinarios
estadisticas avanzadas
auditoria completa
```

Estas funcionalidades no forman parte del esquema simplificado actual.
