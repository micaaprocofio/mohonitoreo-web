-- Mohonitoreo: esquema base (usuarios, lecturas, dispositivos).
-- Versión limpia de database.sql, apta para el SQL Editor de Supabase o
-- `supabase db push` (sin metacomandos de psql ni sentencias OWNER TO).

-- usuarios -------------------------------------------------------------------
create table if not exists public.usuarios (
  id              serial primary key,
  cedula          varchar(20)  not null unique,
  contrasena_hash text         not null default '',
  nombre          varchar(100) not null,
  rol             varchar(20)  not null default 'usuario',
  fecha_creacion  timestamptz  not null default now()
);

-- lecturas -------------------------------------------------------------------
create table if not exists public.lecturas (
  id             serial primary key,
  usuario_id     integer      not null references public.usuarios(id) on delete cascade,
  temperatura    numeric(5,2) not null,
  humedad        numeric(5,2) not null,
  estado_humedad varchar(20)  not null,
  "timestamp"    timestamptz  not null default now()
);

create index if not exists idx_lecturas_timestamp
  on public.lecturas using btree ("timestamp" desc);

create index if not exists idx_lecturas_usuario_id
  on public.lecturas using btree (usuario_id);

-- dispositivos ---------------------------------------------------------------
create table if not exists public.dispositivos (
  id             serial primary key,
  usuario_id     integer      not null references public.usuarios(id) on delete cascade,
  nombre         varchar(100) not null,
  device_token   varchar(100) not null unique,
  fecha_creacion timestamptz  not null default now()
);
