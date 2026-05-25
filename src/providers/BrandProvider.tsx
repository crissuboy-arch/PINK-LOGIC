import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { usePersistedState, STORAGE_KEYS } from '../memory/MemoryStore'

export interface BrandColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface BrandTypography {
  heading: string
  body: string
  headingWeight?: number
  bodyWeight?: number
}

export interface BrandSchema {
  id: string
  projectId: string
  name: string
  palette: BrandColorPalette
  typography: BrandTypography
  logo?: string
  visualStyle: string
  tone: string
  colors: string[]
}

interface BrandContextValue {
  brands: BrandSchema[]
  activeBrand: BrandSchema | null
  setActiveBrand: (brand: BrandSchema | null) => void
  createBrand: (data: Partial<BrandSchema> & { projectId: string }) => BrandSchema
  updateBrand: (id: string, data: Partial<BrandSchema>) => void
  removeBrand: (id: string) => void
  getBrandByProject: (projectId: string) => BrandSchema | undefined
  clearBrands: () => void
}

const BrandContext = createContext<BrandContextValue | null>(null)

const defaultPalette: BrandColorPalette = {
  primary: '#FF2D8D',
  secondary: '#7B2D8E',
  accent: '#FFD700',
  background: '#0D0D12',
  text: '#FFFFFF',
}

const defaultTypography: BrandTypography = {
  heading: 'Inter',
  body: 'Inter',
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands, clearBrands] = usePersistedState<BrandSchema[]>(STORAGE_KEYS.BRANDING, [])
  const [activeBrandId, setActiveBrandId] = usePersistedState<string | null>(STORAGE_KEYS.BRANDING + '.active', null)

  const activeBrand = activeBrandId ? brands.find(b => b.id === activeBrandId) ?? null : null

  const setActiveBrand = useCallback((brand: BrandSchema | null) => {
    setActiveBrandId(brand?.id ?? null)
  }, [setActiveBrandId])

  const createBrand = useCallback((data: Partial<BrandSchema> & { projectId: string }): BrandSchema => {
    const brand: BrandSchema = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      name: data.name || 'Identidade Visual',
      palette: data.palette ?? { ...defaultPalette },
      typography: data.typography ?? { ...defaultTypography },
      logo: data.logo,
      visualStyle: data.visualStyle || 'moderno e feminino',
      tone: data.tone || 'profissional e acolhedor',
      colors: data.colors ?? [defaultPalette.primary, defaultPalette.secondary, defaultPalette.accent],
    }
    setBrands(prev => [...prev, brand])
    setActiveBrandId(brand.id)
    return brand
  }, [setBrands, setActiveBrandId])

  const updateBrand = useCallback((id: string, data: Partial<BrandSchema>) => {
    setBrands(prev => prev.map(b => (b.id === id ? { ...b, ...data } : b)))
  }, [setBrands])

  const removeBrand = useCallback((id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id))
    if (activeBrandId === id) setActiveBrandId(null)
  }, [setBrands, activeBrandId, setActiveBrandId])

  const getBrandByProject = useCallback((projectId: string) => {
    return brands.find(b => b.projectId === projectId)
  }, [brands])

  return (
    <BrandContext.Provider value={{
      brands, activeBrand, setActiveBrand,
      createBrand, updateBrand, removeBrand,
      getBrandByProject, clearBrands,
    }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext)
  if (!ctx) throw new Error('useBrand must be used within <BrandProvider>')
  return ctx
}
