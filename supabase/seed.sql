-- Mohonitoreo: datos de ejemplo para visualización
-- Ejecutar en el SQL Editor de Supabase (corre como postgres, bypassa RLS).
--
-- Inserta ~48 lecturas de las últimas 24 horas para el primer usuario
-- que exista en public.usuarios. Si no hay ninguno, avisa y no hace nada.

do $$
declare
  v_uid      integer;
  v_ts       timestamptz;
  v_temp     numeric(5,2);
  v_hum      numeric(5,2);
  v_estado   varchar(20);
  -- Valores base: temperatura y humedad varían durante el día
  temps      numeric[] := array[
    22.80, 22.40, 22.10, 21.80, 21.50, 21.30,  -- 00:00 - 02:30 (noche, enfría)
    21.20, 21.40, 21.90, 22.60, 23.40, 24.20,  -- 03:00 - 05:30 (sube de mañana)
    25.10, 26.00, 26.80, 27.40, 27.80, 28.10,  -- 06:00 - 08:30 (pico mañana)
    27.90, 27.50, 27.00, 26.40, 25.80, 25.20,  -- 09:00 - 11:30 (baja mediodía)
    24.70, 24.30, 24.00, 23.80, 23.60, 23.40,  -- 12:00 - 14:30 (tarde fresca)
    23.20, 23.00, 22.80, 22.60, 22.40, 22.30,  -- 15:00 - 17:30
    22.50, 22.90, 23.30, 23.60, 23.80, 23.90,  -- 18:00 - 20:30
    24.00, 24.10, 24.20, 24.10, 23.80, 23.50   -- 21:00 - 23:30
  ];
  hums       numeric[] := array[
    -- Humedad: alta al inicio (noche húmeda), baja al mediodía, sube de tarde
    72.50, 74.10, 75.30, 76.00, 75.80, 74.90,  -- Alto (noche)
    73.20, 71.50, 68.40, 65.10, 61.80, 58.20,  -- baja gradual (madrugada→mañana)
    54.70, 51.30, 48.60, 45.80, 43.20, 41.50,  -- Óptimo medio
    43.80, 46.20, 48.90, 51.40, 53.70, 55.90,  -- sube de vuelta
    57.20, 58.80, 59.10, 58.60, 57.40, 55.80,  -- estable tarde
    53.90, 51.70, 49.40, 47.20, 44.80, 42.30,  -- baja de noche
    39.60, 37.10, 35.40, 33.80, 32.50, 31.20,  -- Bajo (noche seca)
    35.60, 41.20, 47.80, 54.30, 60.10, 65.40   -- remonta hacia la mañana siguiente
  ];
  i          integer;
begin
  -- Buscar primer usuario existente
  select id into v_uid from public.usuarios order by id limit 1;

  if v_uid is null then
    raise notice 'No hay usuarios en public.usuarios. Registrate primero en la app y volvé a correr este script.';
    return;
  end if;

  raise notice 'Insertando lecturas para usuario_id = %', v_uid;

  -- Borrar lecturas previas de ese usuario para empezar limpio (opcional; comentar si no querés)
  delete from public.lecturas where usuario_id = v_uid;

  -- Insertar 48 lecturas, una cada 30 minutos, empezando hace 24 horas
  for i in 1..48 loop
    v_ts    := now() - interval '24 hours' + ((i - 1) * interval '30 minutes');
    v_temp  := temps[i];
    v_hum   := hums[i];

    -- Calcular estado_humedad igual que el frontend (estado.ts)
    if v_hum >= 85 then
      v_estado := 'Crítico';
    elsif v_hum >= 70 then
      v_estado := 'Alto';
    elsif v_hum >= 40 then
      v_estado := 'Óptimo';
    else
      v_estado := 'Bajo';
    end if;

    insert into public.lecturas (usuario_id, temperatura, humedad, estado_humedad, "timestamp")
    values (v_uid, v_temp, v_hum, v_estado, v_ts);
  end loop;

  raise notice 'Listo: 48 lecturas insertadas para usuario_id = %.', v_uid;
end $$;
