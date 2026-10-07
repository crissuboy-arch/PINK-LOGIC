export interface BrandingKit {
  projectId: string
  palette: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  tone: string
  visualStyle: string
}

export function brandingAgent(projectId: string, brand: Partial<BrandingKit>): Promise<BrandingKit> {
  return Promise.resolve({
    projectId,
    palette: brand.palette ?? { primary: '#FF2D8D', secondary: '#7B2D8E', accent: '#FFD700', background: '#0D0D12', text: '#FFFFFF' },
    fonts: brand.fonts ?? { heading: 'Inter', body: 'Inter' },
    tone: brand.tone ?? 'profissional e acolhedor',
    visualStyle: brand.visualStyle ?? 'moderno e feminino',
  })
}
