import { useState, useEffect, useRef, useCallback } from 'react'

export const STORAGE_KEYS = {
  PROJECTS: 'pinklogic.projects',
  BRANDING: 'pinklogic.branding',
  CONTENT: 'pinklogic.content',
  WORKFLOWS: 'pinklogic.workflows',
} as const

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
    return new Date(value)
  }
  return value
}

export class LocalStorage<T> {
  private key: string

  constructor(key: string) {
    this.key = key
  }

  load(): T | null {
    try {
      const raw = localStorage.getItem(this.key)
      if (!raw) return null
      return JSON.parse(raw, dateReviver) as T
    } catch (e) {
      console.warn(`[MemoryStore] Failed to load "${this.key}":`, e)
      return null
    }
  }

  save(data: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(data))
    } catch (e) {
      console.error(`[MemoryStore] Failed to save "${this.key}":`, e)
    }
  }

  remove(): void {
    try {
      localStorage.removeItem(this.key)
    } catch (e) {
      console.error(`[MemoryStore] Failed to remove "${this.key}":`, e)
    }
  }

  exists(): boolean {
    try {
      return localStorage.getItem(this.key) !== null
    } catch {
      return false
    }
  }
}

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  hydrate?: (raw: unknown) => T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const storage = new LocalStorage<T>(key)
  const [state, setState] = useState<T>(() => {
    const saved = storage.load()
    if (saved === null) return defaultValue
    return hydrate ? hydrate(saved as unknown) : saved
  })
  const isMounted = useRef(false)

  useEffect(() => {
    if (isMounted.current) {
      storage.save(state)
    }
    isMounted.current = true
  }, [state])

  const clear = useCallback(() => {
    storage.remove()
    setState(defaultValue)
  }, [])

  return [state, setState, clear]
}
