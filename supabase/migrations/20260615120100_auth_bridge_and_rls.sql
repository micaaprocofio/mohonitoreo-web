-- Mohonitoreo: puente entre Supabase Auth y el esquema base + RLS + Realtime.
-- Aplicar DESPUÉS de 20260615120000_initial_schema.sql.
--
-- Contexto: el esquema usa usuario_id entero (lo escribe el lector serial del
-- Arduino). Supabase Auth identifica por UUID (auth.uid()). Este script agrega
-- un puente auth_id sin romper las FKs ni el pipeline de ingestión de lecturas.

-- 1) Columna puente hacia auth.users -------------------------------------------
alter table public.usuarios
  add column if not exists auth_id uuid unique
  references auth.users(id) on delete set null;

-- 2) Helper de rol (SECURITY DEFINER para poder leer usuarios bajo RLS) ---------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.auth_id = auth.uid()
      and u.rol = 'admin'
  );
$$;

-- 3) Trigger: al crear un usuario de Auth, crear su fila en public.usuarios -----
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (cedula, nombre, rol, auth_id, contrasena_hash)
  values (
    new.raw_user_meta_data->>'cedula',
    new.raw_user_meta_data->>'nombre',
    coalesce(new.raw_user_meta_data->>'rol', 'usuario'),
    new.id,
    ''
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Row Level Security --------------------------------------------------------
alter table public.usuarios     enable row level security;
alter table public.lecturas     enable row level security;
alter table public.dispositivos enable row level security;

-- usuarios: cada quien ve su propia fila; admin ve/gestiona todo
drop policy if exists usuarios_select_own on public.usuarios;
create policy usuarios_select_own on public.usuarios
  for select using (auth_id = auth.uid() or public.is_admin());

drop policy if exists usuarios_admin_write on public.usuarios;
create policy usuarios_admin_write on public.usuarios
  for all using (public.is_admin()) with check (public.is_admin());

-- lecturas: cada quien ve sus propias lecturas; admin ve todas
drop policy if exists lecturas_select_own on public.lecturas;
create policy lecturas_select_own on public.lecturas
  for select using (
    public.is_admin()
    or usuario_id in (
      select u.id from public.usuarios u where u.auth_id = auth.uid()
    )
  );

-- dispositivos: solo admin
drop policy if exists dispositivos_admin_all on public.dispositivos;
create policy dispositivos_admin_all on public.dispositivos
  for all using (public.is_admin()) with check (public.is_admin());

-- 5) Realtime: el dashboard se suscribe a los INSERT de lecturas ---------------
-- Sin esto, useUltimaLectura nunca recibe eventos en tiempo real.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'lecturas'
  ) then
    alter publication supabase_realtime add table public.lecturas;
  end if;
end $$;

-- NOTA: la ingestión de lecturas (lector_serial.py) debe usar la service_role
-- key, que bypassa RLS. La anon key del navegador solo puede leer (no insertar).
