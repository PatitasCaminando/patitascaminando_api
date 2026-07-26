# Patitas Caminando Backoffice API

Backend NestJS para la plataforma de la Fundacion Patitas Caminando, alineado con la primera version descrita en `ESPECIFICACION DE REQUERIMIENTOS FUNCIONALES` y el esquema `BDD_Schema_simplificado_RF.sql`.

## Stack

```txt
NestJS
Supabase Auth
Supabase PostgreSQL
Supabase Storage
```

## Alcance Funcional

La primera version cubre:

```txt
Landing publica
Informacion de rescatistas y bienestar animal
Visualizacion publica de animales
Gestion de animales y fotografias
Formulario publico de adopcion
Formulario publico de donacion en especie
Registro y conservacion de formularios
Notificaciones internas y correo a administradores
Gestion administrativa de adopciones y donaciones
Inicio, cierre de sesion y recuperacion de contrasena
Roles de administrador y operador
Datos de contacto y redes sociales
```

Quedan fuera del alcance inicial las donaciones monetarias, pagos en linea, cuentas bancarias, chat, WhatsApp automatico, citas automaticas, geolocalizacion, expedientes veterinarios, estadisticas avanzadas y auditoria completa.

## Base De Datos

El esquema simplificado define estas tablas propias:

```txt
staff_profiles
site_sections
animals
adoption_applications
donation_offers
notifications
```

Las credenciales y recuperacion de contrasena se delegan a `auth.users` de Supabase Auth.

## Variables De Entorno

El archivo `.env` debe contener:

```txt
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

La clave `SUPABASE_SERVICE_ROLE_KEY` es privada y no debe subirse al repositorio.

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run start:dev
```

La API queda disponible en:

```txt
http://localhost:3000
```

## Scripts

```bash
npm run build
npm run test
npm run lint
```

## Usuario Administrador Inicial

Segun la especificacion funcional:

```txt
Correo: admin@rescatistas.local
Contrasena temporal: Cambiar123!
```
