export const EMAIL_DOMAIN = 'mohonitoreo.app'

/**
 * Mapea una cédula a un email sintético que usa Supabase Auth internamente.
 * El usuario nunca ve ni escribe este email: solo escribe su cédula.
 */
export function cedulaToEmail(cedula: string): string {
  return `${cedula.trim().toLowerCase()}@${EMAIL_DOMAIN}`
}
