import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUltimaLectura } from './useUltimaLectura'

const h = vi.hoisted(() => {
  let insertCb: ((payload: { new: unknown }) => void) | undefined
  return {
    get insertCb() {
      return insertCb
    },
    set insertCb(cb) {
      insertCb = cb
    },
    usuarioRow: { id: 7 } as { id: number } | null,
    lecturasRows: [] as Array<{ temperatura: number; humedad: number; timestamp: string }>,
  }
})

vi.mock('../../lib/supabase', () => {
  // Builder encadenable y "thenable" para await.
  function builder(result: { data: unknown }) {
    const b: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'order', 'limit']) {
      b[m] = () => b
    }
    b.maybeSingle = () => Promise.resolve(result)
    b.then = (onF: (v: { data: unknown }) => unknown) => Promise.resolve(result).then(onF)
    return b
  }

  return {
    supabase: {
      from: (table: string) =>
        table === 'usuarios'
          ? builder({ data: h.usuarioRow })
          : builder({ data: h.lecturasRows }),
      channel: () => {
        const ch: Record<string, unknown> = {}
        ch.on = (_e: string, _f: unknown, cb: (p: { new: unknown }) => void) => {
          h.insertCb = cb
          return ch
        }
        ch.subscribe = () => ch
        return ch
      },
      removeChannel: vi.fn(),
    },
  }
})

describe('useUltimaLectura', () => {
  beforeEach(() => {
    h.insertCb = undefined
    h.usuarioRow = { id: 7 }
    h.lecturasRows = []
  })

  it('reports sin-datos when there are no readings', async () => {
    const { result } = renderHook(() => useUltimaLectura('auth-1'))
    await waitFor(() => expect(result.current.status).toBe('sin-datos'))
  })

  it('loads the latest reading and derives estado', async () => {
    h.lecturasRows = [{ temperatura: 22.5, humedad: 75, timestamp: '2026-06-15T12:00:00Z' }]
    const { result } = renderHook(() => useUltimaLectura('auth-1'))
    await waitFor(() => expect(result.current.status).toBe('ok'))
    expect(result.current.lectura?.humedad).toBe(75)
    expect(result.current.lectura?.estado).toBe('Alto')
    expect(result.current.lectura?.color).toBe('warning')
  })

  it('updates when a realtime INSERT arrives', async () => {
    h.lecturasRows = [{ temperatura: 20, humedad: 50, timestamp: '2026-06-15T12:00:00Z' }]
    const { result } = renderHook(() => useUltimaLectura('auth-1'))
    await waitFor(() => expect(result.current.lectura?.estado).toBe('Óptimo'))

    act(() => {
      h.insertCb?.({ new: { temperatura: 30, humedad: 30, timestamp: '2026-06-15T12:05:00Z' } })
    })

    await waitFor(() => expect(result.current.lectura?.estado).toBe('Bajo'))
    expect(result.current.lectura?.humedad).toBe(30)
  })
})
