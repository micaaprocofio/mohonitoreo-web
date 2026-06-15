# Mohonitoreo — Migration to React + Vite + Supabase

**Date:** 2026-06-15
**Status:** Approved (pending spec review)

## Summary

Migrate the Mohonitoreo IoT dashboard from a server-rendered **Flask + Jinja + Supabase
(Python SDK)** application to a **React + Vite single-page application** that talks to
**Supabase directly** from the browser. There is no Python web server at runtime. Privileged
operations that cannot run safely in the browser are handled by a single **Supabase Edge
Function**.

The app keeps its Spanish-language UI and the same set of pages, but the visual design is
**modernized** with shadcn/ui + Tailwind CSS.

## Decisions (locked during brainstorming)

| Topic | Decision |
|---|---|
| Backend | Drop Flask. React talks to Supabase directly. |
| Auth identity | Supabase Auth. Users still type only a **cédula**, mapped internally to a synthetic email `<cedula>@mohonitoreo.app`. |
| Privileged ops | Self-signup (users pick their own password) replaces "recibir contraseña". A single Edge Function handles **admin-creates-user**. |
| Language | TypeScript |
| Styling | Modernized design using **shadcn/ui + Tailwind CSS** |
| Live data | **Supabase Realtime** (websocket subscription) replaces 5s polling |
| Existing data | **Fresh start** — current data is test data; no migration of users/readings. |

## Architecture

A single-page React app built with Vite. No runtime Python. The Flask app, `venv`,
`requirements.txt`, and `test_db.py` are retired from the working tree (preserved in git
history). `database.sql` is kept as schema reference.

```
mohonitoreo-web/
├─ src/
│  ├─ lib/supabase.ts        # supabase-js client (anon key from VITE_ env)
│  ├─ auth/                  # AuthProvider, useAuth, cédula↔email mapping
│  ├─ routes/                # ProtectedRoute, AdminRoute (React Router)
│  ├─ pages/                 # Menu, Login, Signup, Dashboard, Historial,
│  │                         #   AdminUsuarios, AdminDispositivos
│  ├─ components/            # shadcn/ui-based MetricCard, StatusBadge, NavBar…
│  ├─ features/lecturas/     # estado.ts (pure logic) + data hooks
│  └─ types/db.ts            # generated Supabase types
├─ supabase/
│  ├─ functions/admin-create-user/   # Edge Function (service_role)
│  └─ migrations/                     # auth_id column, trigger, is_admin(), RLS
├─ index.html
├─ vite.config.ts
└─ package.json
```

### Routing

Mirrors the current Flask routes. `ProtectedRoute` / `AdminRoute` replace the
`@login_requerido` / `@admin_requerido` decorators.

| Path | Page | Access |
|---|---|---|
| `/` | MenuPage | public |
| `/login` | LoginPage | public |
| `/signup` | SignupPage | public |
| `/dashboard` | DashboardPage | authenticated |
| `/historial` | HistorialPage | authenticated |
| `/admin/usuarios` | AdminUsuariosPage | admin |
| `/admin/dispositivos` | AdminDispositivosPage | admin |

## Data model & RLS

The existing schema uses an **integer `usuario_id`**, and the Arduino serial writer inserts
`lecturas` keyed by that integer. Supabase Auth identifies users by **UUID** (`auth.uid()`).
We bridge these **without breaking the IoT data pipeline**:

- **Add `auth_id uuid` to `usuarios`** (FK → `auth.users.id`, unique, nullable). Keep
  `usuarios.id` (int) and all existing FKs intact, so `lecturas` / `dispositivos` and the
  serial writer are untouched.
- Keep `rol` on `usuarios`.
- Add a SQL helper `is_admin()` (SECURITY DEFINER) that returns whether the current
  `auth.uid()` maps to a `usuarios` row with `rol = 'admin'`.
- `contrasena_hash` is no longer used by the app (Supabase Auth owns passwords). Column may
  remain in the table but is ignored.

### Signup trigger

A `handle_new_user` trigger on `auth.users` (AFTER INSERT) creates the matching `usuarios`
row, reading `cedula` and `nombre` from the signup metadata
(`raw_user_meta_data`), setting `rol = 'usuario'` and `auth_id = NEW.id`.

### RLS policies

RLS enabled on `usuarios`, `lecturas`, `dispositivos`.

- **`usuarios`**: a user can `SELECT` their own row (`auth_id = auth.uid()`); admins can
  `SELECT`/`INSERT`/`UPDATE` all rows.
- **`lecturas`**: a user can `SELECT` rows whose `usuario_id` belongs to their own
  `usuarios` row; admins can `SELECT` all. (Writes come from the serial pipeline using a
  separate key, not from the browser.)
- **`dispositivos`**: admins only (`SELECT`/`INSERT`/`UPDATE`/`DELETE`).

## Auth flows

- **Login** (`/login`): cédula + password → build `<cedula>@mohonitoreo.app` →
  `supabase.auth.signInWithPassword`. UX feels identical to today (cédula only).
- **Signup** (`/signup`, replaces "recibir contraseña"): cédula + nombre + password →
  `supabase.auth.signUp({ email, password, options: { data: { cedula, nombre } } })`. Email
  confirmation is **disabled** in Supabase project settings (synthetic emails can't receive
  mail). The DB trigger creates the `usuarios` row with `rol = 'usuario'`.
- **Admin creates user** (`/admin/usuarios`): calls the **`admin-create-user` Edge
  Function** (holds the service_role key server-side), which creates the auth account and the
  `usuarios` row with the chosen `rol`. This is the only privileged client-triggered path.
- **Session**: `AuthProvider` wraps the app, exposes `user` and `rol` (fetched from
  `usuarios` after auth), subscribes to `onAuthStateChange`. `logout` →
  `supabase.auth.signOut()`.

## Pages → components mapping

| Current (Flask/Jinja) | New (React) |
|---|---|
| `menu.html` | `MenuPage` |
| `login.html` | `LoginPage` |
| `recibir_contrasena.html` | `SignupPage` |
| `dashboard.html` + `/api/ultima_lectura` | `DashboardPage` + `useUltimaLectura` (realtime) |
| `historial.html` | `HistorialPage` + `useHistorial` |
| `admin_usuarios.html` | `AdminUsuariosPage` |
| `admin_dispositivos.html` | `AdminDispositivosPage` |

The humidity logic ports to a pure module `src/features/lecturas/estado.ts`:

- `clasificarHumedad(humedad)` → `"ALTA" | "NORMAL" | "BAJA"`
  - `>= 70` → ALTA; `40–69` → NORMAL; `< 40` → BAJA
- `mensajeEstado(estado)` → user-facing message string
- `colorEstado(estado)` → `"danger" | "success" | "warning" | "secondary"`
- stale check: a reading older than **60 seconds** is flagged "desactualizado"

This preserves the exact dashboard semantics of the current app.

## Realtime dashboard

`useUltimaLectura(usuarioId)`:

1. Initial fetch of the latest `lecturas` row for the user (`order by timestamp desc limit 1`).
2. Subscribe via `supabase.channel(...)` to `postgres_changes` `INSERT` on `lecturas`
   filtered to the user's `usuario_id`.
3. On each new row, recompute estado/color/stale client-side.

No polling. The "última actualización" timestamp and stale warning are derived from the
latest row's `timestamp` compared to `now()`.

## Dev, build, testing

- **Dev**: `npm run dev` (Vite). Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in `.env`
  (and `.env.example` updated). The service_role key lives only in the Edge Function's
  environment, never in client env.
- **Tests**: Vitest + React Testing Library, following TDD. Cover:
  - pure logic: `estado.ts` (classification, messages, colors, stale boundary), cédula↔email
    mapping.
  - components/pages with a mocked Supabase client (login success/failure, protected-route
    redirects, admin gating, dashboard render from a mocked reading).
- **DB changes**: `supabase/migrations/*.sql` for the `auth_id` column, `handle_new_user`
  trigger, `is_admin()`, and RLS policies.
- **Edge Function**: `supabase/functions/admin-create-user` (Deno/TypeScript), deployed via
  Supabase CLI; verifies the caller is an admin before creating the account.

## Retired artifacts

Removed from the working tree (kept in git history):

- `web/` (Flask app + Jinja templates)
- `venv/`
- `requirements.txt`
- `test_db.py`

Kept: `database.sql` (schema reference), `.env` / `.env.example` (updated for Vite).

## Out of scope

- The Arduino firmware and `lector_serial.py` serial-ingestion pipeline (unchanged; continues
  to write `lecturas` by integer `usuario_id`).
- Migrating existing users/readings (fresh-start decision).
- Password-reset email flows (synthetic emails can't receive mail; not needed for fresh start).
```