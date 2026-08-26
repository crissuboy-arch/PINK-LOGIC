import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useCentralStore } from '../store/CentralStore'
import type { Brand, BrandDNA } from '../store/types'

export interface BrandColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  surface?: string
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
  colors: string[] // hashtags mapped
  secondaryColors?: string[]
  socialLinks?: {
    instagram?: string
    tiktok?: string
    youtube?: string
    facebook?: string
  }
  brandDNA?: BrandDNA
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

export function mapToBrandSchema(b: Brand): BrandSchema {
  return {
    id: b.id,
    projectId: b.projectId,
    name: b.name,
    palette: {
      primary: b.colors.primary,
      secondary: b.colors.secondary,
      accent: b.colors.accent,
      background: b.colors.background,
      text: b.colors.text,
      surface: b.colors.surface || (b.colors.background === '#0D0D12' || b.colors.background === '#0D0D0D' || b.colors.background.startsWith('#0') || b.colors.background.startsWith('#1') ? '#151515' : '#FFFFFF'),
    },
    typography: {
      heading: b.fonts.heading,
      body: b.fonts.body,
    },
    logo: b.logo,
    visualStyle: b.style,
    tone: b.tone,
    colors: b.hashtags || [],
    secondaryColors: b.secondaryColors || [],
    socialLinks: b.socialLinks || { instagram: '', tiktok: '', youtube: '', facebook: '' },
    brandDNA: b.brandDNA,
  };
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const {
    brands: centralBrands,
    activeBrand: centralActiveBrand,
    createBrand: centralCreateBrand,
    updateBrand: centralUpdateBrand,
    setActiveProjectId,
  } = useCentralStore();

  const mappedBrands = centralBrands.map(mapToBrandSchema);
  const activeBrand = centralActiveBrand ? mapToBrandSchema(centralActiveBrand) : null;

  const setActiveBrand = useCallback((brand: BrandSchema | null) => {
    if (brand) {
      setActiveProjectId(brand.projectId);
    }
  }, [setActiveProjectId]);

  const createBrand = useCallback((data: Partial<BrandSchema> & { projectId: string }): BrandSchema => {
    centralCreateBrand({
      projectId: data.projectId,
      name: data.name || 'Identidade Visual',
      logo: data.logo,
      colors: {
        primary: data.palette?.primary || '#FF2D8D',
        secondary: data.palette?.secondary || '#7B2D8E',
        accent: data.palette?.accent || '#FFD700',
        background: data.palette?.background || '#0D0D12',
        text: data.palette?.text || '#FFFFFF',
        glow: data.palette?.primary || '#FF2D8D',
        surface: data.palette?.surface || '#151515',
      },
      fonts: {
        heading: data.typography?.heading || 'Outfit',
        body: data.typography?.body || 'Inter',
      },
      glow: data.palette?.primary || '#FF2D8D',
      hashtags: data.colors || [],
      cta: '',
      tone: data.tone || '',
      style: data.visualStyle || '',
      overlays: [],
      secondaryColors: data.secondaryColors || [],
      socialLinks: data.socialLinks || { instagram: '', tiktok: '', youtube: '', facebook: '' },
      brandDNA: data.brandDNA,
    });

    const tempId = crypto.randomUUID();
    return {
      id: tempId,
      projectId: data.projectId,
      name: data.name || 'Identidade Visual',
      palette: data.palette ?? { primary: '#FF2D8D', secondary: '#7B2D8E', accent: '#FFD700', background: '#0D0D12', text: '#FFFFFF', surface: '#151515' },
      typography: data.typography ?? { heading: 'Outfit', body: 'Inter' },
      logo: data.logo,
      visualStyle: data.visualStyle || '',
      tone: data.tone || '',
      colors: data.colors || [],
      secondaryColors: data.secondaryColors || [],
      socialLinks: data.socialLinks || { instagram: '', tiktok: '', youtube: '', facebook: '' },
      brandDNA: data.brandDNA,
    };
  }, [centralCreateBrand]);

  const updateBrand = useCallback((id: string, data: Partial<BrandSchema>) => {
    const updates: Partial<Brand> = {};
    if (data.name) updates.name = data.name;
    if (data.logo !== undefined) updates.logo = data.logo;
    if (data.visualStyle) updates.style = data.visualStyle;
    if (data.tone) updates.tone = data.tone;
    if (data.colors) updates.hashtags = data.colors;
    if (data.secondaryColors) updates.secondaryColors = data.secondaryColors;
    if (data.socialLinks) updates.socialLinks = data.socialLinks;
    if (data.brandDNA) updates.brandDNA = data.brandDNA;
    
    if (data.palette) {
      updates.colors = {
        primary: data.palette.primary || '#FF2D8D',
        secondary: data.palette.secondary || '#7000FF',
        accent: data.palette.accent || '#00E0FF',
        background: data.palette.background || '#0D0D12',
        text: data.palette.text || '#FFFFFF',
        glow: data.palette.primary || '#FF2D8D',
        surface: data.palette.surface || '#151515',
      };
      updates.glow = data.palette.primary || '#FF2D8D';
    }

    if (data.typography) {
      updates.fonts = {
        heading: data.typography.heading || 'Outfit',
        body: data.typography.body || 'Inter',
      };
    }

    centralUpdateBrand(id, updates);
  }, [centralUpdateBrand]);

  const removeBrand = useCallback((_id: string) => {
    // Cascaded project deletion or ignore for safety
  }, []);

  const getBrandByProject = useCallback((projectId: string) => {
    const found = centralBrands.find(b => b.projectId === projectId);
    return found ? mapToBrandSchema(found) : undefined;
  }, [centralBrands]);

  const clearBrands = useCallback(() => {}, []);

  return (
    <BrandContext.Provider value={{
      brands: mappedBrands,
      activeBrand,
      setActiveBrand,
      createBrand,
      updateBrand,
      removeBrand,
      getBrandByProject,
      clearBrands,
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
