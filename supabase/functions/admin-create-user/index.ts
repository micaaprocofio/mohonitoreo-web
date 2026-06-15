// Edge Function: admin-create-user
//
// Crea una cuenta de Supabase Auth + su fila en public.usuarios con el rol
// elegido. Es la única operación privilegiada del sistema: usa la service_role
// key, que NUNCA debe estar en el frontend.
//
// Deploy:
//   supabase functions deploy admin-create-user
// Secrets requeridos (ya disponibles por defecto en el runtime de Supabase):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Llamada desde el frontend:
//   supabase.functions.invoke('admin-create-user', { body: { cedula, nombre, password, rol } })

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EMAIL_DOMAIN = 'mohonitoreo.app'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Método no permitido' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Cliente con el JWT del que llama, para verificar que es admin.
  const authHeader = req.headers.get('Authorization') ?? ''
  const caller = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
  } = await caller.auth.getUser()
  if (!user) return json({ error: 'No autenticado' }, 401)

  const admin = createClient(supabaseUrl, serviceKey)

  const { data: perfil } = await admin
    .from('usuarios')
    .select('rol')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (!perfil || perfil.rol !== 'admin') {
    return json({ error: 'Requiere rol admin' }, 403)
  }

  // Validar payload
  let payload: { cedula?: string; nombre?: string; password?: string; rol?: string }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const cedula = (payload.cedula ?? '').trim()
  const nombre = (payload.nombre ?? '').trim()
  const password = payload.password ?? ''
  const rol = payload.rol === 'admin' ? 'admin' : 'usuario'

  if (!cedula || !nombre) return json({ error: 'Cédula y nombre son obligatorios' }, 400)
  if (password.length < 6) return json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400)

  const email = `${cedula.toLowerCase()}@${EMAIL_DOMAIN}`

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { cedula, nombre, rol },
  })

  if (createErr || !created.user) {
    return json({ error: createErr?.message ?? 'No se pudo crear el usuario' }, 400)
  }

  // El trigger handle_new_user ya creó la fila con el rol del metadata.
  // Garantizamos el rol por si el trigger usara un default.
  await admin.from('usuarios').update({ rol }).eq('auth_id', created.user.id)

  return json({ ok: true, cedula, nombre, rol })
})
