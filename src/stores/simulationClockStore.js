import { create } from 'zustand'

export const useSimulationClockStore = create((set, get) => ({
  enabled: false,
  paused: false,
  speed: 1,
  baseSimMs: null,
  baseRealMs: null,
  pausedSimMs: null,
  lastIso: null,

  syncFromHeaders: (headers) => {
    if (!headers) return
    const raw =
      typeof headers.get === 'function'
        ? headers.get('x-simulation-clock')
        : headers['x-simulation-clock'] || headers['X-Simulation-Clock']

    if (!raw) return

    if (raw === 'off') {
      if (get().enabled) {
        set({
          enabled: false,
          paused: false,
          speed: 1,
          baseSimMs: null,
          baseRealMs: null,
          pausedSimMs: null,
          lastIso: null,
        })
      }
      return
    }

    const parsedMs = Date.parse(raw)
    if (Number.isNaN(parsedMs)) return

    const rawSpeed =
      typeof headers.get === 'function'
        ? headers.get('x-simulation-clock-speed')
        : headers['x-simulation-clock-speed'] || headers['X-Simulation-Clock-Speed']
    const rawPaused =
      typeof headers.get === 'function'
        ? headers.get('x-simulation-clock-paused')
        : headers['x-simulation-clock-paused'] || headers['X-Simulation-Clock-Paused']

    const speed = Math.max(0.1, Number(rawSpeed) || 1)
    const paused = rawPaused === '1' || rawPaused === 'true'

    set({
      enabled: true,
      paused,
      speed,
      baseSimMs: parsedMs,
      baseRealMs: Date.now(),
      pausedSimMs: paused ? parsedMs : null,
      lastIso: raw,
    })
  },

  reset: () =>
    set({
      enabled: false,
      paused: false,
      speed: 1,
      baseSimMs: null,
      baseRealMs: null,
      pausedSimMs: null,
      lastIso: null,
    }),
}))

export function getSimNow() {
  const { enabled, paused, speed, baseSimMs, baseRealMs, pausedSimMs } =
    useSimulationClockStore.getState()
  if (!enabled || baseSimMs === null) {
    return new Date()
  }
  if (paused && pausedSimMs !== null) {
    return new Date(pausedSimMs)
  }
  const elapsedMs = Math.max(0, Date.now() - (baseRealMs ?? Date.now()))
  return new Date(baseSimMs + elapsedMs * speed)
}

