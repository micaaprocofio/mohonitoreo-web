# Mohonitoreo — Dashboard de Temperatura y Humedad

Plataforma web que visualiza las lecturas de los sensores en tiempo real y permite
administrar usuarios y dispositivos. Construida como **SPA en React + Vite (TypeScript)**
que habla directamente con **Supabase** (Auth, Postgres con RLS y Realtime). No hay
servidor propio en runtime.

## 🧱 Stack

- **React 18 + Vite + TypeScript**
- **Tailwind CSS** (UI modernizada)
- **supabase-js** — datos, autenticación y realtime
- **React Router** — ruteo y guards de sesión/rol
- **Vitest + React Testing Library** — tests

## 📁 Estructura

```
src/
  lib/            cliente de Supabase + helpers
  auth/           AuthProvider, useAuth, mapeo cédula↔email
  routes/         ProtectedRoute, AdminRoute
  pages/          Menu, Login, Signup, Dashboard, Historial, Admin*
  components/     UI (Button, Card, Input, Alert, Badge…) y NavBar
  features/
    lecturas/     estado.ts (lógica) + hooks (realtime / historial)
    admin/        crear/listar usuarios y dispositivos
  types/db.ts     tipos de la base de datos
supabase/
  migrations/     SQL ordenado: esquema base → puente auth + RLS + realtime
  functions/      Edge Function admin-create-user
database.sql      dump original de PostgreSQL (referencia histórica)
```

## 🔐 Modelo de autenticación

Los usuarios escriben solo su **cédula**; internamente se mapea a un email sintético
`<cedula>@mohonitoreo.app` y se usa Supabase Auth. El rol (`usuario`/`admin`) vive en la
tabla `usuarios`, enlazada a `auth.users` por la columna `auth_id`. La autorización se
aplica con **Row Level Security**.

## 🚀 Cómo correr la Web

1. Instalá dependencias:
   ```bash
   npm install
   ```
2. Creá tu `.env` a partir de `.env.example` y completá:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Configurá el backend de Supabase **una sola vez** (ver
   [Base de datos y backend](#backend)): correr las
   migraciones, desactivar la confirmación por email y desplegar la Edge Function
   `admin-create-user`.
4. Levantá el entorno de desarrollo:
   ```bash
   npm run dev
   ```
5. Abrí [http://localhost:5173](http://localhost:5173).

<a id="backend"></a>

## 🗄️ Base de datos y backend (Supabase)

Toda la configuración del backend vive en `supabase/`. Las migraciones están **ordenadas
por nombre** y se aplican de la más vieja a la más nueva:

| Orden | Archivo | Qué hace |
|------|---------|----------|
| 1 | `migrations/20260615120000_initial_schema.sql` | Crea las tablas base `usuarios`, `lecturas`, `dispositivos` e índices. |
| 2 | `migrations/20260615120100_auth_bridge_and_rls.sql` | Agrega `usuarios.auth_id`, el helper `is_admin()`, el trigger de alta `handle_new_user`, las políticas RLS y habilita Realtime en `lecturas`. |

### Crear una base de datos nueva desde cero

Sirve para levantar un proyecto limpio (otra instancia, staging, etc.).

**1. Crear el proyecto en Supabase**

- Entrá a <https://supabase.com/dashboard> → **New project**.
- Elegí nombre, contraseña de la base (guardala) y región.
- Cuando termine de aprovisionar, anotá de **Settings → API**:
  - **Project URL** → `VITE_SUPABASE_URL`
  - **anon public** key → `VITE_SUPABASE_ANON_KEY`
  - **service_role** key → solo para el backend (Edge Function / ingestión). **Nunca en el frontend.**
- El **project-ref** es el subdominio de la URL (`https://<project-ref>.supabase.co`).

**2. Apuntar el frontend al nuevo proyecto**

Actualizá tu `.env` con el `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` del proyecto nuevo.

**3. Correr las migraciones** — elegí UNA de estas tres vías:

<details>
<summary><b>Opción A — SQL Editor del dashboard (sin instalar nada)</b></summary>

1. Dashboard → **SQL Editor** → **New query**.
2. Pegá el contenido de `migrations/20260615120000_initial_schema.sql` → **Run**.
3. Repetí con `migrations/20260615120100_auth_bridge_and_rls.sql` → **Run**.

Respetá el orden: primero el esquema base, después el puente de auth.
</details>

<details>
<summary><b>Opción B — Supabase CLI (workflow recomendado)</b></summary>

```bash
# Instalar el CLI (macOS). NO uses npm install -g supabase: no está soportado.
brew install supabase/tap/supabase

supabase login                                   # interactivo (abre el navegador)
supabase link --project-ref <project-ref>        # pide la contraseña de la base
supabase db push                                 # aplica TODAS las migraciones pendientes
```

`db push` lee `supabase/migrations/` y aplica en orden las que falten, registrándolas
en la tabla `supabase_migrations.schema_migrations`.
</details>

<details>
<summary><b>Opción C — psql (si preferís la terminal)</b></summary>

```bash
# La cadena de conexión está en Settings → Database → Connection string (URI).
psql "postgresql://postgres:[PASSWORD]@db.<project-ref>.supabase.co:5432/postgres" \
  -f supabase/migrations/20260615120000_initial_schema.sql

psql "postgresql://postgres:[PASSWORD]@db.<project-ref>.supabase.co:5432/postgres" \
  -f supabase/migrations/20260615120100_auth_bridge_and_rls.sql
```
</details>

**4. Configurar Auth — desactivar la confirmación por email**

Los usuarios se autentican con un email sintético (`<cedula>@mohonitoreo.app`) que no puede
recibir correos. Dashboard → **Authentication → Sign In / Providers → Email** → desactivá
**Confirm email** → **Save**.

**5. Desplegar la Edge Function (crear usuarios como admin)**

```bash
supabase functions deploy admin-create-user
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya existen en el runtime de las Edge Functions;
no hay que configurarlas. (También se puede crear/pegar desde Dashboard → **Edge Functions**.)

**6. Crear el primer admin**

El registro público crea usuarios con `rol = 'usuario'`. Para el primer admin, registrate
normalmente desde la app y luego, en el **SQL Editor**:

```sql
update public.usuarios set rol = 'admin' where cedula = '<tu-cedula>';
```

A partir de ahí ese admin puede crear más usuarios (de cualquier rol) desde
`/admin/usuarios`, que usa la Edge Function.

### Agregar una nueva migración

Cuando cambies el esquema, **no edites** las migraciones ya aplicadas: agregá una nueva.

```bash
supabase migration new <nombre_descriptivo>   # crea supabase/migrations/<timestamp>_<nombre>.sql
# escribí tu SQL en ese archivo, luego:
supabase db push                              # la aplica al proyecto enlazado
```

Sin el CLI: creá a mano un archivo `supabase/migrations/<YYYYMMDDHHMMSS>_<nombre>.sql`
(timestamp mayor que las existentes para que quede al final) y aplicá su contenido en el
SQL Editor. Mantené las migraciones **idempotentes** cuando puedas (`if not exists`,
`create or replace`, `drop policy if exists`) para poder re-correrlas sin romper nada.

### Realtime

El dashboard se suscribe a los `INSERT` de `lecturas`. La migración de auth ya agrega esa
tabla a la publicación `supabase_realtime`, así que no hay que tocar nada en el dashboard.
Si en algún momento Realtime deja de llegar, verificá en **Database → Replication** que
`lecturas` esté en la publicación `supabase_realtime`.

## 🧪 Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # type-check + build de producción
npm run lint     # ESLint
npm test         # tests (Vitest)
```

## 📡 Ingestión de datos (Arduino)

El pipeline serial (`lector_serial.py`, fuera de este repo) sigue insertando en la tabla
`lecturas` por `usuario_id` entero, usando la **service_role key** (que bypassa RLS). El
navegador, con la anon key, solo puede **leer** lecturas según las políticas de RLS.
