import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useHistorial } from './useHistorial'

const h = vi.hoisted(() => ({
  usuarioRow: { id: 7 } as { id: number } | null,
  lecturasRows: [] as Array<{ temperatura: number; humedad: number; timestamp: string }>,
}))

vi.mock('../../lib/supabase', () => {
  function builder(result: { data: unknown }) {
    const b: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'order', 'limit']) b[m] = () => b
    b.maybeSingle = () => Promise.resolve(result)
    b.then = (onF: (v: { data: unknown }) => unknown) => Promise.resolve(result).then(onF)
    return b
  }
  return {
    supabase: {
      from: (table: string) =>
        table === 'usuarios' ? builder({ data: h.usuarioRow }) : builder({ data: h.lecturasRows }),
    },
  }
})

describe('useHistorial', () => {
  beforeEach(() => {
    h.usuarioRow = { id: 7 }
    h.lecturasRows = []
  })

  it('maps rows to items with derived estado/color', async () => {
    h.lecturasRows = [
      { temperatura: 20, humedad: 80, timestamp: '2026-06-15T12:00:00Z' },
      { temperatura: 21, humedad: 30, timestamp: '2026-06-15T11:00:00Z' },
    ]
    const { result } = renderHook(() => useHistorial('auth-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0]).toMatchObject({ estado: 'ALTA', color: 'danger' })
    expect(result.current.items[1]).toMatchObject({ estado: 'BAJA', color: 'warning' })
  })
})
