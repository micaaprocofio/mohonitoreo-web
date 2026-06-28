# Supabase — backend

Este frontend habla directamente con Supabase. La guía completa (incluido **cómo crear
una base de datos nueva desde cero**) está en el README principal, sección
[Base de datos y backend](../README.md#backend).

## Contenido de esta carpeta

```
migrations/
  20260615120000_initial_schema.sql      # tablas usuarios / lecturas / dispositivos
  20260615120100_auth_bridge_and_rls.sql # auth_id, is_admin(), trigger, RLS, realtime
functions/
  admin-create-user/index.ts             # Edge Function privilegiada (service_role)
```

## Resumen de configuración (una sola vez por proyecto)

1. **Correr las migraciones** en orden (SQL Editor del dashboard o `supabase db push`).
2. **Auth:** Authentication → Sign In / Providers → Email → desactivar **Confirm email**
   (los emails sintéticos `<cedula>@mohonitoreo.app` no reciben correos).
3. **Edge Function:** `supabase functions deploy admin-create-user`
   (`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya están en el runtime).
4. **Primer admin:** registrate desde la app y luego en el SQL Editor:
   ```sql
   update public.usuarios set rol = 'admin' where cedula = '<tu-cedula>';
   ```

## Pipeline de ingestión (Arduino)

`lector_serial.py` debe insertar en `lecturas` usando la **service_role key** (bypassa
RLS). La anon key del navegador solo puede **leer** lecturas según las políticas RLS.
