// Tipos de la base de datos (escritos a mano).
// Se pueden regenerar con: supabase gen types typescript --project-id <ref>

export type Rol = 'usuario' | 'admin'

export interface Usuario {
  id: number
  cedula: string
  nombre: string
  rol: Rol
  auth_id: string | null
  fecha_creacion: string | null
}

export interface Lectura {
  id: number
  temperatura: number
  humedad: number
  estado_humedad: string
  timestamp: string | null
  usuario_id: number
}

export interface Dispositivo {
  id: number
  usuario_id: number
  nombre: string
  device_token: string
  fecha_creacion: string | null
}

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario
        Insert: Partial<Usuario> & { cedula: string; nombre: string }
        Update: Partial<Usuario>
        Relationships: []
      }
      lecturas: {
        Row: Lectura
        Insert: Partial<Lectura>
        Update: Partial<Lectura>
        Relationships: []
      }
      dispositivos: {
        Row: Dispositivo
        Insert: Partial<Dispositivo>
        Update: Partial<Dispositivo>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
