export interface Project {
  id: string;
  name: string;
  description: string;
  brandId: string;
  socialAccounts: string[];
  email: string;
  password?: string;
  timezone: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

export interface BrandColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  glow: string;
  surface?: string;
}

export interface BrandDNA {
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  glowStyle: string;
  aesthetic: string;
  tone: string;
}

export interface Brand {
  id: string;
  projectId: string;
  name: string;
  logo?: string;
  colors: BrandColorPalette;
  fonts: {
    heading: string;
    body: string;
  };
  glow: string;
  hashtags: string[];
  cta: string;
  tone: string;
  style: string;
  avatar?: string;
  overlays: string[];
  secondaryColors?: string[];
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    facebook?: string;
  };
  brandDNA?: BrandDNA;
}

export interface Campaign {
  id: string;
  projectId: string;
  name: string;
  mainProduct: string;
  secondaryProduct: string;
  message: string;
  status: 'active' | 'draft' | 'completed';
  goal: string;
  cta: string;
  startDate: string;
  endDate?: string;
  linkedPostIds: string[];
}

export interface Post {
  id: string;
  projectId: string;
  campaignId: string | null;
  title: string;
  caption: string;
  hashtags: string;
  cta: string | null;
  mediaUrl: string;
  scheduled_at: string;
  platforms: string[];
  status: 'rascunho' | 'editando' | 'agendado' | 'publicado' | 'falhou';
  type: 'Post' | 'Reels' | 'Stories' | 'Video' | 'Copy';
  productId: string | null;
  reach: string;
  engagement: string;
  error_message?: string | null;
}

export interface ChecklistItem {
  id: string;
  projectId: string;
  text: string;
  completed: boolean;
  dueDate?: string | null;
  responsible?: string | null;
}

export interface Product {
  id: string;
  projectId: string;
  name: string;
  category: string;
  link: string;
  platform: string;
  price: string;
  type: string;
  model: string;
}
