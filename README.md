# Patitas Caminando API

Este proyecto contiene el backend de la plataforma de la Fundacion Patitas Caminando. Esta hecho con NestJS y trabaja con Supabase para autenticacion, base de datos y almacenamiento de imagenes.

El backend esta pensado para dos partes del sistema:

- La parte publica, que ve el visitante desde la landing.
- El backoffice, que usan administradores y operadores para gestionar la informacion.

La base de datos principal esta en:

```txt
src/config/db/BDD_Schema_simplificado_RF.sql
```

La coleccion de pruebas esta en:

```txt
PATITAS-CAMINANDO.postman_collection.json
```

## Tecnologias

```txt
NestJS
TypeScript
Supabase Auth
Supabase PostgreSQL
Supabase Storage
Postman
```

## Que incluye el backend

El backend cubre el alcance definido en la BDD simplificada:

```txt
Usuarios internos y roles
Contenido publico del sitio
Animales y fotografias
Solicitudes de adopcion
Ofrecimientos de donacion en especie
Notificaciones internas
Recuperacion de contrasena
Gestion de operadores
Paginado en listados principales
Subida de imagenes a Supabase Storage desde el backend
```

No incluye modulos antiguos como `landing`, `media`, `publications`, `settings`, `volunteers` o `identity-management`.

## Variables de entorno

Crear un archivo `.env` en la raiz del proyecto:

```txt
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PASSWORD_RESET_REDIRECT_URL=http://localhost:5173/reset-password
SUPABASE_ANIMAL_IMAGES_BUCKET=animals
MAX_ANIMAL_IMAGE_SIZE_MB=5
```

La clave `SUPABASE_SERVICE_ROLE_KEY` es privada. No debe subirse al repositorio ni usarse desde el frontend.

## Instalacion y ejecucion

Instalar dependencias:

```bash
npm install
```

Levantar el servidor en desarrollo:

```bash
npm run start:dev
```

La API queda disponible en:

```txt
http://localhost:3000
```

Para validar el proyecto:

```bash
npm run lint
npm run build
```

## Base de datos

Primero se debe ejecutar el archivo SQL en Supabase:

```txt
src/config/db/BDD_Schema_simplificado_RF.sql
```

Ese archivo crea las tablas, validaciones, indices, politicas RLS, triggers y datos iniciales.

Las credenciales, sesiones y recuperacion de contrasena se manejan con `auth.users` de Supabase. Las tablas propias no guardan contrasenas.

## Administrador inicial

El primer administrador se crea manualmente en Supabase Auth. Luego se vincula con `staff_profiles`.

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

Despues de eso, el administrador ya puede iniciar sesion y crear operadores desde el backoffice.

## Autenticacion y roles

El login es para personal interno:

```http
POST /auth/login
```

Sirve para administradores y operadores. La diferencia entre ellos esta en `staff_profiles.role`.

Roles:

```txt
admin
operator
```

El operador puede gestionar animales, adopciones, donaciones y notificaciones. El administrador tambien puede gestionar contenido web y operadores.

## Recuperacion de contrasena

La recuperacion se inicia desde el backend y se completa con Supabase Auth desde el frontend.

Flujo:

1. El usuario selecciona "Olvide mi contrasena".
2. El frontend llama a:

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

3. Supabase envia el enlace temporal.
4. El frontend muestra la pantalla para nueva contrasena.
5. El frontend actualiza la contrasena con Supabase:

```ts
await supabase.auth.updateUser({
  password: newPassword,
});
```

En Supabase deben estar configuradas las Redirect URLs:

```txt
http://localhost:5173/**
https://tu-dominio.com/**
```

## Imagenes de animales

La BDD guarda rutas de imagen en:

```txt
animals.photo_paths
```

La imagen real se guarda en Supabase Storage. La base solo guarda rutas como:

```txt
animals/pending/foto.jpg
animals/<animalId>/foto.jpg
```

Hay dos formas de usar imagenes:

1. Subir la imagen antes de crear el animal:

```http
POST /admin/animals/images/upload
```

Ese endpoint devuelve `mediaId`, y esa ruta se manda luego en `photoPaths`.

2. Subir la imagen a un animal ya creado:

```http
POST /admin/animals/:id/images/upload
```

Ambos endpoints reciben `multipart/form-data` con el campo:

```txt
file
```

Formatos permitidos:

```txt
JPG
PNG
WEBP
```

El tamano maximo se controla con:

```txt
MAX_ANIMAL_IMAGE_SIZE_MB
```

## Notificaciones

Cuando se crea una solicitud de adopcion o un ofrecimiento de donacion, la BDD genera notificaciones internas para:

```txt
Administradores activos
Operadores activos con receive_form_notifications = TRUE
```

El backoffice puede listar, ver y marcar como leidas esas notificaciones.

El envio real de correo no se usa en el alcance actual por decision del equipo. La BDD conserva campos como `email_subject`, `email_body` y `email_status` para una posible mejora futura.

## Paginado

Los listados principales usan paginado:

```http
?page=1&limit=10
```

Aplica para:

```http
GET /public/animals?page=1&limit=10
GET /admin/animals?page=1&limit=10
GET /admin/adoptions/applications?page=1&limit=10
GET /admin/donations/offers?page=1&limit=10
```

La respuesta tiene esta forma:

```json
{
  "items": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 0
}
```

En el frontend se debe leer `response.items`.

## Endpoints publicos

Estos endpoints no requieren autenticacion:

```http
GET /public/site-sections
GET /public/animals?page=1&limit=10
GET /public/animals/:slug
POST /public/adoptions/applications
POST /public/donations/offers
```

La landing usa estos endpoints para mostrar contenido, listar animales y enviar formularios.

## Endpoints privados

Los endpoints del backoffice requieren:

```http
Authorization: Bearer <accessToken>
```

El token se obtiene con:

```http
POST /auth/login
```

## Backoffice: animales

```http
GET /admin/animals?page=1&limit=10
POST /admin/animals
PATCH /admin/animals/:id
DELETE /admin/animals/:id
DELETE /admin/animals/:id/permanent
POST /admin/animals/images/upload
POST /admin/animals/:id/images
POST /admin/animals/:id/images/upload
DELETE /admin/animals/:id/images/:imageId
```

El `DELETE /admin/animals/:id` no borra fisicamente. Archiva el animal y lo oculta de la parte publica. El registro permanece en Supabase como historial y sigue disponible para consulta desde el backoffice.

El `DELETE /admin/animals/:id/permanent` borra fisicamente el registro de Supabase y solo debe usarse desde la vista de archivados. Si el animal no esta archivado, la API responde error.

Los animales incluyen tres campos medicos opcionales en requests y responses:

```txt
isSterilized
isVaccinated
isDewormed
```

Estos campos aceptan:

```txt
true  = si esta confirmado
false = no aplica o no esta realizado
null  = no especificado todavia
```

Ejemplo para crear o actualizar un animal:

```json
{
  "name": "Luna",
  "species": "perro",
  "sex": "hembra",
  "size": "mediano",
  "approximateAge": "2 anios",
  "status": "disponible",
  "description": "Perrita tranquila.",
  "generalCondition": "Buen estado general.",
  "photoPaths": ["animals/pending/luna.jpg"],
  "isSterilized": true,
  "isVaccinated": true,
  "isDewormed": true,
  "isActive": true,
  "isPubliclyVisible": true
}
```

Para evitar duplicados, `POST /admin/animals` responde `409 Conflict` si ya existe un animal no archivado con los mismos datos principales: `name`, `species`, `sex`, `approximateAge` y `size`.

## Backoffice: adopciones

```http
GET /admin/adoptions/applications?page=1&limit=10
PATCH /admin/adoptions/applications/:id/status
```

Las adopciones no se eliminan. Se gestionan con estados:

```txt
recibida
contactada
cita_programada
aprobada
rechazada
cancelada
```

## Backoffice: donaciones

```http
GET /admin/donations/offers?page=1&limit=10
PATCH /admin/donations/offers/:id/status
```

Las donaciones se gestionan con estados:

```txt
ofrecida
contactada
entrega_coordinada
recibida
no_aceptada
cancelada
```

## Backoffice: contenido web

```http
GET /admin/site-sections
POST /admin/site-sections
PATCH /admin/site-sections/:id
DELETE /admin/site-sections/:id
```

Solo el administrador debe usar esta parte.

## Backoffice: notificaciones

```http
GET /admin/notifications
GET /admin/notifications/:id
PATCH /admin/notifications/:id/read
```

Estas rutas sirven para la campana o listado de alertas internas.

## Backoffice: operadores

```http
GET /admin/users/operators
GET /admin/users/operators/:id
POST /admin/users/operators
PATCH /admin/users/operators/:id
PATCH /admin/users/operators/:id/status
```

Solo el administrador puede gestionar operadores.

No se eliminan fisicamente. Para bloquear acceso se usa:

```txt
isActive = false
```

## Postman

La coleccion esta en:

```txt
PATITAS-CAMINANDO.postman_collection.json
```

Variables principales:

```txt
baseUrl
accessToken
page
limit
siteSectionId
animalId
animalImagePath
adoptionApplicationId
donationOfferId
notificationId
operatorId
```

El login guarda automaticamente el `accessToken`. Algunas requests guardan ids para encadenar pruebas.

## Cumplimiento general

El backend cubre los RF principales:

```txt
RF-01 Informacion publica
RF-02 Gestion de animales y contenido publico
RF-03 Envio de solicitud de adopcion
RF-04 Confirmacion visual desde frontend
RF-05 Envio de donacion en especie
RF-06 Restriccion a donaciones en especie
RF-07 Registro y conservacion de formularios
RF-08 Notificaciones internas
RF-09 Gestion de adopciones
RF-10 Gestion de donaciones
RF-11 Autenticacion, roles y operadores
RF-12 Recuperacion de contrasena
```

## Fuera de alcance

No estan incluidos en esta version:

```txt
Donaciones monetarias
Pagos en linea
Cuentas bancarias
Chat
WhatsApp automatico
Citas automaticas
Geolocalizacion
Expedientes veterinarios
Estadisticas avanzadas
Aplicacion movil
Auditoria completa
Envio real de correos para notificaciones internas
```
