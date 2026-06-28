# React + Vite + Supabase Migration — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. **No git commits** in this project (per user instruction) — each "Checkpoint" step means *run the verification and confirm green* before moving on.

**Goal:** Replace the Flask/Jinja server-rendered Mohonitoreo app with a React + Vite TypeScript SPA that talks to Supabase directly, with a modernized UI and realtime dashboard.

**Architecture:** Vite SPA (React + TS), supabase-js for data/auth, Supabase Auth (cédula→synthetic email), RLS for authorization, Supabase Realtime for the dashboard, one Edge Function for admin user-creation. Fresh-start data.

**Tech Stack:** React 18, Vite 5 (Node 18 compatible), TypeScript, React Router, Tailwind CSS, shadcn/ui-style components, supabase-js v2, Vitest + React Testing Library.

**Environment notes:** Node v18.20.8, npm 10.8.2. No Supabase CLI installed — SQL migration and Edge Function are delivered as files for the user to apply in the Supabase dashboard (project ref `thplktghdbywrnvqpzae`).

---

## Phase 0 — Scaffold

### Task 0.1: Create the Vite React+TS app in place

**Files:** `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1:** Scaffold into a temp dir and move files in (repo root already has files).

```bash
npm create vite@5 mohonitoreo-tmp -- --template react-ts
rsync -a --exclude node_modules mohonitoreo-tmp/ ./
rm -rf mohonitoreo-tmp
npm install
```

- [ ] **Step 2:** Verify dev server boots.

Run: `npm run dev -- --port 5173` then curl.
Expected: HTTP 200 at `http://localhost:5173`.

- [ ] **Checkpoint:** `npm run build` succeeds.

### Task 0.2: Tailwind + base styling

**Files:** `tailwind.config.js`, `postcss.config.js`, `src/index.css`

- [ ] **Step 1:** Install and init.

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2:** Set `content: ["./index.html","./src/**/*.{ts,tsx}"]` in `tailwind.config.js`. Add Tailwind directives + the brand palette (teal `#14b8a6`/`#0f766e`, slate `#0f172a`/`#1e293b`) as CSS variables in `src/index.css`.

- [ ] **Checkpoint:** `npm run build` succeeds; a Tailwind class renders.

### Task 0.3: Testing setup (Vitest + RTL)

**Files:** `vitest.config.ts`, `src/test/setup.ts`, `package.json` (scripts)

- [ ] **Step 1:** Install.

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2:** Configure vitest (jsdom env, setup file importing `@testing-library/jest-dom`). Add `"test": "vitest run"`, `"test:watch": "vitest"` scripts.

- [ ] **Step 3:** Write a trivial smoke test `src/test/smoke.test.ts` asserting `true`.

- [ ] **Checkpoint:** `npm test` passes.

### Task 0.4: Supabase client + env

**Files:** `src/lib/supabase.ts`, `.env`, `.env.example`, `src/vite-env.d.ts`

- [ ] **Step 1:** Install `npm install @supabase/supabase-js`.

- [ ] **Step 2:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` (from existing values) and `.env.example` (placeholders).

- [ ] **Step 3:** Create client:

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/db'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!url || !anonKey) throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')

export const supabase = createClient<Database>(url, anonKey)
```

- [ ] **Step 4:** Add a minimal `src/types/db.ts` (hand-written for now: `usuarios`, `lecturas`, `dispositivos`). Can be regenerated later with the Supabase CLI.

- [ ] **Checkpoint:** `npm run build` succeeds.

---

## Phase 1 — Supabase backend (delivered as files, applied by user)

### Task 1.1: DB migration SQL

**Files:** `supabase/migrations/0001_auth_bridge_and_rls.sql`

- [ ] **Step 1:** Write SQL containing:
  - `ALTER TABLE public.usuarios ADD COLUMN auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;`
  - `is_admin()` SECURITY DEFINER function:

```sql
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.usuarios u
    where u.auth_id = auth.uid() and u.rol = 'admin'
  );
$$;
```

  - `handle_new_user()` trigger creating a `usuarios` row from `raw_user_meta_data`:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.usuarios (cedula, nombre, rol, auth_id, contrasena_hash)
  values (
    new.raw_user_meta_data->>'cedula',
    new.raw_user_meta_data->>'nombre',
    'usuario',
    new.id,
    ''
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

  - Enable RLS + policies for `usuarios`, `lecturas`, `dispositivos` as described in the spec (own-row reads; admin full; lecturas joined via usuarios.auth_id; dispositivos admin-only).

- [ ] **Step 2:** Add `supabase/README.md` with apply instructions (dashboard SQL editor or `supabase db push`), and the note to **disable email confirmation** in Auth settings.

- [ ] **Checkpoint:** SQL reviewed for syntax; user applies it. (No CLI here.)

### Task 1.2: Edge Function `admin-create-user`

**Files:** `supabase/functions/admin-create-user/index.ts`

- [ ] **Step 1:** Write a Deno function that:
  - reads the caller's JWT, verifies via service_role client that the caller's `usuarios.rol = 'admin'`,
  - validates `cedula`, `nombre`, `password`, `rol`,
  - calls `auth.admin.createUser({ email: '<cedula>@mohonitoreo.app', password, email_confirm: true, user_metadata: { cedula, nombre } })`,
  - on success sets the created `usuarios` row's `rol` to the requested value,
  - returns JSON; CORS headers included.

- [ ] **Checkpoint:** TypeScript reviewed; user deploys via dashboard/CLI. Document required secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

---

## Phase 2 — Core logic (TDD)

### Task 2.1: cédula↔email mapping

**Files:** `src/auth/cedula.ts`, `src/auth/cedula.test.ts`

- [ ] **Step 1 (failing test):**

```ts
import { cedulaToEmail, EMAIL_DOMAIN } from './cedula'
test('maps cédula to synthetic email', () => {
  expect(cedulaToEmail('12345')).toBe(`12345@${EMAIL_DOMAIN}`)
})
test('trims and lowercases', () => {
  expect(cedulaToEmail('  12345 ')).toBe('12345@mohonitoreo.app')
})
```

- [ ] **Step 2:** Run `npm test` → fails (module missing).
- [ ] **Step 3:** Implement:

```ts
export const EMAIL_DOMAIN = 'mohonitoreo.app'
export const cedulaToEmail = (cedula: string) =>
  `${cedula.trim().toLowerCase()}@${EMAIL_DOMAIN}`
```

- [ ] **Step 4:** Run `npm test` → passes. **Checkpoint.**

### Task 2.2: estado (humidity) logic

**Files:** `src/features/lecturas/estado.ts`, `src/features/lecturas/estado.test.ts`

- [ ] **Step 1 (failing tests):** cover boundaries 70/69/40/39, message + color mapping, and `estaDesactualizado(ts, now)` true at >60s, false at ≤60s.

```ts
import { clasificarHumedad, mensajeEstado, colorEstado, estaDesactualizado } from './estado'
test('clasifica', () => {
  expect(clasificarHumedad(70)).toBe('ALTA')
  expect(clasificarHumedad(69)).toBe('NORMAL')
  expect(clasificarHumedad(40)).toBe('NORMAL')
  expect(clasificarHumedad(39)).toBe('BAJA')
})
test('color', () => {
  expect(colorEstado('ALTA')).toBe('danger')
  expect(colorEstado('NORMAL')).toBe('success')
  expect(colorEstado('BAJA')).toBe('warning')
})
test('stale at 61s', () => {
  const t = new Date('2026-01-01T00:00:00Z')
  const now = new Date('2026-01-01T00:01:01Z')
  expect(estaDesactualizado(t, now)).toBe(true)
})
```

- [ ] **Step 2:** Run → fails.
- [ ] **Step 3:** Port logic from `web/app.py:23-49` and the 60s rule from `app.py:204-205` into pure TS functions returning the same strings (`'danger'|'success'|'warning'|'secondary'`, messages with the same emoji/text).
- [ ] **Step 4:** Run → passes. **Checkpoint.**

---

## Phase 3 — Auth context & routing

### Task 3.1: AuthProvider + useAuth

**Files:** `src/auth/AuthProvider.tsx`, `src/auth/useAuth.ts`, `src/auth/AuthProvider.test.tsx`

- [ ] **Step 1 (failing test):** with a mocked `supabase`, render a consumer; assert it shows "loading" then resolves to logged-out (`user === null`).
- [ ] **Step 2:** Run → fails.
- [ ] **Step 3:** Implement context exposing `{ user, rol, loading, login(cedula,password), signup(cedula,nombre,password), logout() }`. `login` uses `cedulaToEmail` + `signInWithPassword`. On session, fetch `usuarios` row for `rol`. Subscribe to `onAuthStateChange`; clean up on unmount.
- [ ] **Step 4:** Run → passes. **Checkpoint.**

### Task 3.2: Route guards

**Files:** `src/routes/ProtectedRoute.tsx`, `src/routes/AdminRoute.tsx`, tests

- [ ] **Step 1 (failing tests):** ProtectedRoute redirects to `/login` when `user===null`; renders children when set. AdminRoute redirects to `/dashboard` when `rol!=='admin'`.
- [ ] **Step 2:** Run → fails.
- [ ] **Step 3:** Implement using `useAuth` + `<Navigate>`. Show nothing/spinner while `loading`.
- [ ] **Step 4:** Run → passes. **Checkpoint.**

### Task 3.3: App router skeleton

**Files:** `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1:** Install `npm install react-router-dom`.
- [ ] **Step 2:** Wrap `<AuthProvider>` + `<BrowserRouter>`; define the 7 routes (placeholders for pages). Guards applied to dashboard/historial (Protected) and admin/* (Admin).
- [ ] **Checkpoint:** `npm run build` + existing tests pass.

---

## Phase 4 — UI components & pages

### Task 4.1: Shared UI primitives + NavBar

**Files:** `src/components/ui/*` (Button, Card, Input, Alert, Badge), `src/components/NavBar.tsx`

- [ ] **Step 1:** Add shadcn/ui-style Tailwind primitives (Button, Card, Input, Alert, Badge) — small, typed, no external UI dep required.
- [ ] **Step 2:** `NavBar` shows brand, Historial + Cerrar sesión always, Admin/Dispositivos when `rol==='admin'` (mirrors `dashboard.html:158-182`).
- [ ] **Checkpoint:** `npm run build` succeeds.

### Task 4.2: MenuPage

**Files:** `src/pages/MenuPage.tsx`, test

- [ ] **Step 1 (test):** renders links to `/login` and `/signup`.
- [ ] **Step 2–4:** Implement modernized card (teal gradient header) matching `menu.html` content; verify test passes. **Checkpoint.**

### Task 4.3: LoginPage

**Files:** `src/pages/LoginPage.tsx`, test

- [ ] **Step 1 (tests):** submitting calls `login(cedula,password)`; on failure shows "Cédula o contraseña incorrecta."; on success navigates to `/dashboard`.
- [ ] **Step 2–4:** Implement form (cédula + password). **Checkpoint.**

### Task 4.4: SignupPage (replaces recibir_contrasena)

**Files:** `src/pages/SignupPage.tsx`, test

- [ ] **Step 1 (tests):** validates required cédula + nombre + password; calls `signup`; shows success/error; on success routes to `/login` (or `/dashboard` if auto-session).
- [ ] **Step 2–4:** Implement. **Checkpoint.**

### Task 4.5: DashboardPage + useUltimaLectura (realtime)

**Files:** `src/features/lecturas/useUltimaLectura.ts`, `src/pages/DashboardPage.tsx`, tests

- [ ] **Step 1 (hook test):** with a mocked supabase channel, initial fetch sets the latest reading; an INSERT event updates state; uses `estado.ts` for derived fields.
- [ ] **Step 2:** Run → fails.
- [ ] **Step 3:** Implement hook: resolve current user's `usuario_id` (from `usuarios` by `auth_id`), fetch latest `lecturas` row, subscribe to `postgres_changes` INSERT filtered by `usuario_id`. Recompute estado/color/stale. Cleanup channel on unmount.
- [ ] **Step 4 (page test):** renders temp/humedad/estado cards, stale alert when desactualizado, "sin datos" message when none. Implement page (modernized metric cards from `dashboard.html`). **Checkpoint.**

### Task 4.6: HistorialPage + useHistorial

**Files:** `src/features/lecturas/useHistorial.ts`, `src/pages/HistorialPage.tsx`, tests

- [ ] **Step 1 (test):** hook fetches last 100 readings ordered desc; page renders a table with colored estado badge.
- [ ] **Step 2–4:** Implement (mirrors `historial.html` + `app.py:225-239`). **Checkpoint.**

### Task 4.7: AdminUsuariosPage

**Files:** `src/pages/AdminUsuariosPage.tsx`, `src/features/admin/createUser.ts`, tests

- [ ] **Step 1 (tests):** lists usuarios (mocked); the create form validates cédula+nombre and calls the `admin-create-user` Edge Function via `supabase.functions.invoke`; shows success/error.
- [ ] **Step 2–4:** Implement. **Checkpoint.**

### Task 4.8: AdminDispositivosPage

**Files:** `src/pages/AdminDispositivosPage.tsx`, `src/features/admin/useDispositivos.ts`, tests

- [ ] **Step 1 (test):** fetches dispositivos with joined `usuarios(cedula,nombre)`, renders table (mirrors `app.py:292-312`).
- [ ] **Step 2–4:** Implement. **Checkpoint.**

---

## Phase 5 — Cleanup & verification

### Task 5.1: Remove Flask artifacts

**Files:** delete `web/`, `venv/`, `requirements.txt`, `test_db.py`

- [ ] **Step 1:** Delete the above from the working tree (kept in git history). Keep `database.sql`.
- [ ] **Step 2:** Update `README.md` for the new stack (install, `.env`, `npm run dev`, Supabase setup, Edge Function deploy).
- [ ] **Checkpoint:** repo has no Python runtime references in app paths.

### Task 5.2: Full verification

- [ ] **Step 1:** `npm test` — all pass.
- [ ] **Step 2:** `npm run build` — succeeds.
- [ ] **Step 3:** `npm run dev` — manually load menu/login; confirm app boots and Supabase client initializes (full auth path requires the DB migration applied + email confirmation disabled).
- [ ] **Checkpoint:** Report status honestly, noting which steps require the user's Supabase changes to fully exercise.

---

## Self-review notes

- **Spec coverage:** architecture (Phase 0/3/4), data model + RLS + trigger (1.1), Edge Function (1.2), auth flows (3.1, 4.3, 4.4, 4.7), all 7 pages (4.2–4.8), realtime (4.5), estado logic (2.2), cédula mapping (2.1), retire Flask (5.1), tests throughout. ✔
- **No placeholders:** core logic tasks contain real code; UI tasks reference exact source lines to port. ✔
- **Type consistency:** `cedulaToEmail`, `clasificarHumedad/mensajeEstado/colorEstado/estaDesactualizado`, `useUltimaLectura`, `useAuth` names used consistently across tasks. ✔
- **Manual/user steps:** Supabase SQL apply, Auth email-confirmation toggle, and Edge Function deploy are delivered as files (no CLI in this environment).
