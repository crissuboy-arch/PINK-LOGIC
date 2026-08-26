import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Palette,
  Layout,
  Heart,
  Eye,
  Search,
  Filter,
  Download,
  Share2,
  FolderOpen,
  History,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Upload,
  Laptop
} from 'lucide-react';
import { useBrand } from '../../providers/BrandProvider';
import type { BrandSchema } from '../../providers/BrandProvider';
import { useCentralStore } from '../../store/CentralStore';
import { useLanguage } from '../../contexts/LanguageContext';

type TemplateFormat = 'feed' | 'story' | 'pinterest';

interface LocalizedString {
  pt: string;
  en: string;
  es: string;
}

interface TemplateStructure {
  id: string;
  title: string | LocalizedString;
  subtitle: string | LocalizedString;
  cta: string | LocalizedString;
  category: string;
  categoryLabel: string;
  format: TemplateFormat;
  bgImage: string;
  bgColor: string;
  textColor: string;
  primaryColor: string; // Button background
  secondaryColor: string; // Button text or small accent
  fontHeading: string;
  fontBody: string;
  overlayStyle: 'neon' | 'glass' | 'luxury' | 'clean' | 'none';
  overlayGradient?: string;
  hasGlow?: boolean;
  glowColor?: string;
  isDraft?: boolean;
  favorite?: boolean;
}

const getTplString = (field: any, lang: string): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field['pt'] || '';
};

const CATEGORIES = [
  { id: 'all', label: 'Todos os Templates' },
  { id: 'luxo-feminino', label: 'Luxo Feminino' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'minimalista-clean', label: 'Minimalista Clean' },
  { id: 'neon-tech', label: 'Neon Tech' },
  { id: 'black-friday', label: 'Black Friday' },
  { id: 'nutricao', label: 'Nutrição' },
  { id: 'advogado', label: 'Advogado' },
  { id: 'clinica', label: 'Clínica' },
  { id: 'barbearia', label: 'Barbearia' },
  { id: 'igreja', label: 'Igreja' },
  { id: 'dropshipping', label: 'Dropshipping' },
  { id: 'psicologia', label: 'Psicologia' },
  { id: 'soldagem', label: 'Soldagem' },
  { id: 'moda', label: 'Moda' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'motivacional', label: 'Motivacional' },
  { id: 'frases-debochadas', label: 'Frases Debochadas' },
  { id: 'reels-virais', label: 'Reels Virais' }
];

const PRESETS_BANK: TemplateStructure[] = [
  {
    id: 'tpl-luxo-feminino',
    title: {
      pt: 'Coleção Ouro Real',
      en: 'Royal Gold Collection',
      es: 'Colección Oro Real'
    },
    subtitle: {
      pt: 'Sinfonia de Brilho e Joias',
      en: 'Symphony of Shine and Gems',
      es: 'Sinfonía de Brillo y Joyas'
    },
    cta: {
      pt: 'VER CATÁLOGO',
      en: 'VIEW CATALOG',
      es: 'VER CATÁLOGO'
    },
    category: 'luxo-feminino',
    categoryLabel: 'Luxo Feminino',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    bgColor: '#0D0D0D',
    textColor: '#FFFFFF',
    primaryColor: '#FF2D9B',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    overlayStyle: 'luxury',
    overlayGradient: 'linear-gradient(180deg, rgba(13,13,13,0.2) 0%, rgba(13,13,13,0.85) 100%)'
  },
  {
    id: 'tpl-industrial',
    title: {
      pt: 'Engenharia de Estruturas',
      en: 'Structural Engineering',
      es: 'Ingeniería de Estructuras'
    },
    subtitle: {
      pt: 'Resistência e Precisão de Aço',
      en: 'Strength and Steel Precision',
      es: 'Resistencia y Precisión de Acero'
    },
    cta: {
      pt: 'FALAR COM ENGENHEIRO',
      en: 'TALK TO AN ENGINEER',
      es: 'HABLAR CON INGENIERO'
    },
    category: 'industrial',
    categoryLabel: 'Industrial',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=600&auto=format&fit=crop',
    bgColor: '#151515',
    textColor: '#FFFFFF',
    primaryColor: '#FF2D9B',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'clean',
    overlayGradient: 'linear-gradient(180deg, rgba(21,21,21,0.3) 0%, rgba(21,21,21,0.9) 100%)'
  },
  {
    id: 'tpl-minimalista-clean',
    title: {
      pt: 'Design de Interiores Clínicos',
      en: 'Clinical Interior Design',
      es: 'Diseño de Interiores Clínicos'
    },
    subtitle: {
      pt: 'Equilíbrio e Espaços Orgânicos',
      en: 'Balance and Organic Spaces',
      es: 'Equilibrio y Espacios Orgánicos'
    },
    cta: {
      pt: 'SOLICITAR CONSULTORIA',
      en: 'REQUEST CONSULTATION',
      es: 'SOLICITAR CONSULTORÍA'
    },
    category: 'minimalista-clean',
    categoryLabel: 'Minimalista Clean',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    bgColor: '#FFFFFF',
    textColor: '#151515',
    primaryColor: '#151515',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'clean',
    overlayGradient: 'rgba(255,255,255,0.03)'
  },
  {
    id: 'tpl-neon-tech',
    title: {
      pt: 'Ecossistema IA Avançado',
      en: 'Advanced AI Ecosystem',
      es: 'Ecosistema de IA Avanzado'
    },
    subtitle: {
      pt: 'Modelagem de Dados em Tempo Real',
      en: 'Real-time Data Modeling',
      es: 'Modelado de Datos en Tiempo Real'
    },
    cta: {
      pt: 'INICIAR TESTE IA',
      en: 'START AI TRIAL',
      es: 'INICIAR PRUEBA IA'
    },
    category: 'neon-tech',
    categoryLabel: 'Neon Tech',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    bgColor: '#0D0D0D',
    textColor: '#FFFFFF',
    primaryColor: '#FF2D9B',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'neon',
    overlayGradient: 'linear-gradient(180deg, rgba(255,45,155,0.08) 0%, rgba(13,13,13,0.95) 100%)',
    hasGlow: true,
    glowColor: '#FF2D9B'
  },
  {
    id: 'tpl-black-friday',
    title: {
      pt: 'Oferta Especial Black Friday',
      en: 'Black Friday Super Offer',
      es: 'Súper Oferta Black Friday'
    },
    subtitle: {
      pt: 'Descontos de Até 70% com Tempo Limitado',
      en: 'Discounts Up To 70% for Limited Time',
      es: 'Descuentos de Hasta 70% por Tiempo Limitado'
    },
    cta: {
      pt: 'COMPRAR COM DESCONTO',
      en: 'SHOP WITH DISCOUNT',
      es: 'COMPRAR CON DESCUENTO'
    },
    category: 'black-friday',
    categoryLabel: 'Black Friday',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600&auto=format&fit=crop',
    bgColor: '#0D0D0D',
    textColor: '#FFFFFF',
    primaryColor: '#FF2D9B',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Anton',
    fontBody: 'Inter',
    overlayStyle: 'neon',
    overlayGradient: 'linear-gradient(180deg, rgba(255,45,155,0.12) 0%, rgba(0,0,0,1) 100%)',
    hasGlow: true,
    glowColor: '#FF2D9B'
  },
  {
    id: 'tpl-nutricao',
    title: {
      pt: 'Vida Saudável & Nutrição',
      en: 'Healthy Life & Nutrition',
      es: 'Vida Saludable y Nutrición'
    },
    subtitle: {
      pt: 'Planos Alimentares Personalizados',
      en: 'Personalized Meal Plans',
      es: 'Planes Alimenticios Personalizados'
    },
    cta: {
      pt: 'MARCAR CONSULTA',
      en: 'BOOK CONSULTATION',
      es: 'AGENDAR CONSULTA'
    },
    category: 'nutricao',
    categoryLabel: 'Nutrição',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop',
    bgColor: '#FFFFFF',
    textColor: '#151515',
    primaryColor: '#FF2D9B',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'clean',
    overlayGradient: 'rgba(255,255,255,0.05)'
  },
  {
    id: 'tpl-advogado',
    title: {
      pt: 'Defesa e Blindagem Jurídica',
      en: 'Legal Defense & Compliance',
      es: 'Defensa Jurídica y Cumplimiento'
    },
    subtitle: {
      pt: 'Proteção Patrimonial e Suporte Corporativo',
      en: 'Asset Protection and Corporate Support',
      es: 'Protección Patrimonial y Soporte Corporativo'
    },
    cta: {
      pt: 'FALAR COM ADVOGADO',
      en: 'TALK TO A LAWYER',
      es: 'HABLAR CON ABOGADO'
    },
    category: 'advogado',
    categoryLabel: 'Advogado',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop',
    bgColor: '#0D0D0D',
    textColor: '#FFFFFF',
    primaryColor: '#FF2D9B',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    overlayStyle: 'luxury',
    overlayGradient: 'linear-gradient(180deg, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.9) 100%)'
  },
  {
    id: 'tpl-clinica',
    title: {
      pt: 'Clínica de Estética Integrada',
      en: 'Integrated Aesthetic Clinic',
      es: 'Clínica de Estética Integrada'
    },
    subtitle: {
      pt: 'Harmonização e Tratamentos Exclusivos',
      en: 'Harmonization and Premium Care',
      es: 'Armonización y Tratamientos Exclusivos'
    },
    cta: {
      pt: 'AGENDAR AVALIAÇÃO',
      en: 'SCHEDULE EVALUATION',
      es: 'AGENDAR EVALUACIÓN'
    },
    category: 'clinica',
    categoryLabel: 'Clínica',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop',
    bgColor: '#FFFFFF',
    textColor: '#151515',
    primaryColor: '#FF4DB2',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'clean',
    overlayGradient: 'rgba(255,255,255,0.03)'
  },
  {
    id: 'tpl-barbearia',
    title: {
      pt: 'Corte Clássico & Toalha Quente',
      en: 'Classic Cut & Hot Towel',
      es: 'Corte Clásico y Toalla Caliente'
    },
    subtitle: {
      pt: 'Tradição e Estilo para o Homem Moderno',
      en: 'Tradition and Style for the Modern Man',
      es: 'Tradición y Estilo para el Hombre Moderno'
    },
    cta: {
      pt: 'RESERVAR HORÁRIO',
      en: 'BOOK APPOINTMENT',
      es: 'RESERVAR HORARIO'
    },
    category: 'barbearia',
    categoryLabel: 'Barbearia',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop',
    bgColor: '#151515',
    textColor: '#FFFFFF',
    primaryColor: '#FF2D9B',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Anton',
    fontBody: 'Inter',
    overlayStyle: 'luxury',
    overlayGradient: 'linear-gradient(180deg, rgba(21,21,21,0.2) 0%, rgba(21,21,21,0.9) 100%)'
  },
  {
    id: 'tpl-igreja',
    title: {
      pt: 'Culto de Fé & Esperança',
      en: 'Hope & Faith Service',
      es: 'Culto de Fe y Esperanza'
    },
    subtitle: {
      pt: 'Venha Adorar e Celebrar Conosco',
      en: 'Come Worship and Celebrate With Us',
      es: 'Ven a Adorar y Celebrar con Nosotros'
    },
    cta: {
      pt: 'VER HORÁRIOS',
      en: 'VIEW HOURS',
      es: 'VER HORARIOS'
    },
    category: 'igreja',
    categoryLabel: 'Igreja',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    primaryColor: '#EF4444',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'neon',
    overlayGradient: 'linear-gradient(180deg, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0.95) 100%)',
    hasGlow: true,
    glowColor: '#EF4444'
  },
  {
    id: 'tpl-curso',
    title: 'Método Escala Digital',
    subtitle: 'Do Zero aos Primeiros Milhões com Vendas no Automático',
    cta: 'COMEÇAR MENTORIA',
    category: 'curso-online',
    categoryLabel: 'Curso Online',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
    bgColor: '#160F30',
    textColor: '#FFFFFF',
    primaryColor: '#7B4DFF',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'glass',
    overlayGradient: 'linear-gradient(180deg, rgba(123,77,255,0.1) 0%, rgba(22,15,48,0.9) 100%)'
  },
  {
    id: 'tpl-ebook',
    title: 'Manual de Branding Pro',
    subtitle: 'Construa uma Marca Altamente Desejável e Valiosa',
    cta: 'BAIXAR E-BOOK GRATUITO',
    category: 'ebook',
    categoryLabel: 'E-book',
    format: 'pinterest',
    bgImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
    bgColor: '#0D0D12',
    textColor: '#FFFFFF',
    primaryColor: '#FF2D8D',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    overlayStyle: 'luxury',
    overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(13,13,18,0.9) 100%)'
  },
  {
    id: 'tpl-dropshipping',
    title: 'Super Smartwatch Pro',
    subtitle: 'Conectividade Avançada com Bateria de 14 Dias',
    cta: 'COMPRAR COM FRETE GRÁTIS',
    category: 'dropshipping',
    categoryLabel: 'Dropshipping',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=600&auto=format&fit=crop',
    bgColor: '#0F172A',
    textColor: '#F8FAFC',
    primaryColor: '#00E0FF',
    secondaryColor: '#0F172A',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'glass'
  },
  {
    id: 'tpl-restaurante',
    title: 'Burger Gourmet Supremo',
    subtitle: 'Pão de Brioche Selado e Blend Especial de 180g',
    cta: 'PEDIR NO DELIVERY',
    category: 'restaurante',
    categoryLabel: 'Restaurante',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
    bgColor: '#2E0F0F',
    textColor: '#FFEBEB',
    primaryColor: '#F59E0B',
    secondaryColor: '#2E0F0F',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'clean',
    overlayGradient: 'linear-gradient(180deg, rgba(46,15,15,0.2) 0%, rgba(46,15,15,0.85) 100%)'
  },
  {
    id: 'tpl-imobiliaria',
    title: 'Mansão Alphaville Luxo',
    subtitle: '5 Suítes, Piscina com Borda Infinita e Acabamento Italiano',
    cta: 'AGENDAR VISITA PRIVADA',
    category: 'imobiliaria',
    categoryLabel: 'Imobiliária',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop',
    bgColor: '#FAF9F6',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    overlayStyle: 'clean',
    overlayGradient: 'rgba(0,0,0,0.02)'
  },
  {
    id: 'tpl-story-daily',
    title: 'ROTINA MATINAL GLOW',
    subtitle: 'Dicas Práticas para Começar o Dia com Energia Extrema',
    cta: 'CONFIRA NO LINK',
    category: 'story',
    categoryLabel: 'Stories',
    format: 'story',
    bgImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop',
    bgColor: '#FAF5F5',
    textColor: '#2E1A22',
    primaryColor: '#FFB6E5',
    secondaryColor: '#2E1A22',
    fontHeading: 'Sacramento',
    fontBody: 'Inter',
    overlayStyle: 'glass',
    overlayGradient: 'rgba(255,255,255,0.25)'
  },
  {
    id: 'tpl-carrossel-p1',
    title: '5 Regras do Design Pro',
    subtitle: 'Deslize para ver os segredos das marcas milionárias',
    cta: 'VER CONTEÚDO COMPLETO',
    category: 'carrossel',
    categoryLabel: 'Carrossel',
    format: 'feed',
    bgImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    bgColor: '#0D0D12',
    textColor: '#FFFFFF',
    primaryColor: '#7B4DFF',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'neon',
    overlayGradient: 'linear-gradient(180deg, rgba(123,77,255,0.1) 0%, rgba(13,13,18,0.95) 100%)',
    hasGlow: true,
    glowColor: '#7B4DFF'
  },
  {
    id: 'tpl-reels-cover',
    title: 'Hacks Ocultos de Tráfego',
    subtitle: 'Como lotar o seu funil sem gastar um centavo',
    cta: 'ASSISTIR VÍDEO COMPLETO',
    category: 'reels',
    categoryLabel: 'Reels Cover',
    format: 'story',
    bgImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop',
    bgColor: '#0A0A0F',
    textColor: '#FFFFFF',
    primaryColor: '#FF2FBF',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'neon',
    overlayGradient: 'linear-gradient(180deg, rgba(255,47,191,0.15) 0%, rgba(10,10,15,0.95) 100%)',
    hasGlow: true,
    glowColor: '#FF2FBF'
  },
  {
    id: 'tpl-tiktok-trend',
    title: 'TRANSFORMAÇÃO IA 2026',
    subtitle: 'As ferramentas que vão te substituir se você não usar',
    cta: 'CLIQUE E VEJA AGORA',
    category: 'tiktok',
    categoryLabel: 'TikTok',
    format: 'story',
    bgImage: 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=600&auto=format&fit=crop',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    primaryColor: '#00E0FF',
    secondaryColor: '#000000',
    fontHeading: 'Outfit',
    fontBody: 'Inter',
    overlayStyle: 'neon',
    overlayGradient: 'linear-gradient(180deg, rgba(0,224,255,0.2) 0%, rgba(0,0,0,0.9) 100%)',
    hasGlow: true,
    glowColor: '#00E0FF'
  },
  {
    id: 'tpl-pinterest-pins',
    title: 'Paletas de Cores Modernas',
    subtitle: 'Combinações estéticas curadas para designers',
    cta: 'VER PALETAS COMPLETAS',
    category: 'pinterest',
    categoryLabel: 'Pinterest Pin',
    format: 'pinterest',
    bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    bgColor: '#FAF9F6',
    textColor: '#2E221A',
    primaryColor: '#FF2D8D',
    secondaryColor: '#FFFFFF',
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    overlayStyle: 'glass',
    overlayGradient: 'rgba(255,255,255,0.45)'
  }
];

const TemplatesPremium: React.FC = () => {
  const { activeBrand, brands } = useBrand();
  const { activeProjectId } = useCentralStore();
  const { language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'presets' | 'history'>('presets');
  
  // Quick editor states
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStructure | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCta, setEditCta] = useState('');
  const [editBgImage, setEditBgImage] = useState('');
  const [editBgColor, setEditBgColor] = useState('');
  const [editTextColor, setEditTextColor] = useState('');
  const [editPrimaryColor, setEditPrimaryColor] = useState('');
  const [editSecondaryColor, setEditSecondaryColor] = useState('');
  const [editFontHeading, setEditFontHeading] = useState('Outfit');
  const [editFontBody, setEditFontBody] = useState('Inter');
  const [logoOption, setLogoOption] = useState<'color' | 'white' | 'none'>('color');
  
  const [selectedBrandId, setSelectedBrandId] = useState<string>(activeBrand?.id || '');
  const [isExporting, setIsExporting] = useState(false);
  const [historyPack, setHistoryPack] = useState<TemplateStructure[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load history drafts
  const getHistoryStorageKey = () => `pink_logic_template_history_${activeProjectId || 'default'}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getHistoryStorageKey());
      setHistoryPack(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setHistoryPack([]);
    }
  }, [activeProjectId]);

  const saveHistoryDrafts = (drafts: TemplateStructure[]) => {
    setHistoryPack(drafts);
    localStorage.setItem(getHistoryStorageKey(), JSON.stringify(drafts));
  };

  // Sync selectedBrandId when activeBrand changes
  useEffect(() => {
    if (activeBrand) {
      setSelectedBrandId(activeBrand.id);
    }
  }, [activeBrand]);

  // Handle open quick editor modal
  const handleOpenQuickEditor = (tpl: TemplateStructure) => {
    setSelectedTemplate(tpl);
    setEditTitle(getTplString(tpl.title, language));
    setEditSubtitle(getTplString(tpl.subtitle, language));
    setEditCta(getTplString(tpl.cta, language));
    setEditBgImage(tpl.bgImage);
    setEditBgColor(tpl.bgColor);
    setEditTextColor(tpl.textColor);
    setEditPrimaryColor(tpl.primaryColor);
    setEditSecondaryColor(tpl.secondaryColor);
    setEditFontHeading(tpl.fontHeading);
    setEditFontBody(tpl.fontBody);
    setLogoOption(activeBrand?.logo ? 'color' : 'none');
  };

  // Handle Apply Brand Kit
  const handleApplyBrandKit = (brandId: string) => {
    setSelectedBrandId(brandId);
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;

    // Smart color replacement
    const extractedColors = brand.colors && brand.colors.length >= 5 ? brand.colors : [
      brand.palette.primary,
      brand.palette.secondary,
      brand.palette.accent,
      brand.palette.background,
      brand.palette.text
    ];

    setEditBgColor(extractedColors[3]); // Fundo
    setEditTextColor(extractedColors[4]); // Texto
    setEditPrimaryColor(extractedColors[0]); // Primária (botão CTA)
    setEditSecondaryColor(extractedColors[1]); // Secundária

    // Typography
    if (brand.typography?.heading) setEditFontHeading(brand.typography.heading);
    if (brand.typography?.body) setEditFontBody(brand.typography.body);

    // Auto logo option
    const whiteLogo = brand.socialLinks?.instagram || '';
    if (logoOption === 'white' && !whiteLogo) {
      setLogoOption('color');
    } else if (!brand.logo && !whiteLogo) {
      setLogoOption('none');
    } else {
      setLogoOption('color');
    }
  };

  // Upload custom background image
  const handleUploadBgImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setEditBgImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch brand logo based on option
  const getActiveLogoSrc = (): string => {
    const brand = brands.find(b => b.id === selectedBrandId) || activeBrand;
    if (!brand) return '';
    if (logoOption === 'color') return brand.logo || '';
    if (logoOption === 'white') return brand.socialLinks?.instagram || brand.logo || ''; // use instagram mapping for white logo
    return '';
  };

  // Draw preview canvas
  useEffect(() => {
    if (!selectedTemplate) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isVertical = selectedTemplate.format === 'story' || selectedTemplate.format === 'pinterest';
    canvas.width = 800;
    canvas.height = isVertical ? (selectedTemplate.format === 'pinterest' ? 1200 : 1420) : 800;

    const W = canvas.width;
    const H = canvas.height;

    // Draw background color
    ctx.fillStyle = editBgColor;
    ctx.fillRect(0, 0, W, H);

    const drawVisuals = (bgImg?: HTMLImageElement) => {
      // 1. Draw Image Background (with fit cover)
      if (bgImg) {
        ctx.save();
        const scale = Math.max(W / bgImg.width, H / bgImg.height);
        const x = (W - bgImg.width * scale) / 2;
        const y = (H - bgImg.height * scale) / 2;
        ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
        ctx.restore();
      }

      // 2. Draw overlay gradients
      if (selectedTemplate.overlayStyle !== 'none') {
        ctx.save();
        if (selectedTemplate.overlayStyle === 'neon') {
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, `${editPrimaryColor}1c`);
          grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
          grad.addColorStop(1, `${editBgColor}e0`);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          // Neon stroke border
          ctx.strokeStyle = editPrimaryColor;
          ctx.lineWidth = 16;
          ctx.strokeRect(8, 8, W - 16, H - 16);
          if (selectedTemplate.hasGlow) {
            ctx.shadowColor = editPrimaryColor;
            ctx.shadowBlur = 30;
            ctx.strokeRect(8, 8, W - 16, H - 16);
          }
        } else if (selectedTemplate.overlayStyle === 'glass') {
          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          // Render frosted center-card
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.shadowBlur = 20;
          ctx.roundRect ? ctx.roundRect(W*0.08, H*0.08, W*0.84, H*0.84, 24) : ctx.rect(W*0.08, H*0.08, W*0.84, H*0.84);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        } else if (selectedTemplate.overlayStyle === 'luxury') {
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, 'rgba(0,0,0,0.2)');
          grad.addColorStop(1, 'rgba(7,7,10,0.9)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          // Gold border
          ctx.strokeStyle = editPrimaryColor;
          ctx.lineWidth = 4;
          ctx.strokeRect(30, 30, W - 60, H - 60);
          ctx.strokeRect(36, 36, W - 72, H - 72);
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.04)';
          ctx.fillRect(0, 0, W, H);
        }
        ctx.restore();
      }

      // 3. Draw Typography Title & Subtitle
      ctx.save();
      ctx.textAlign = 'center';
      
      // Load and apply Google Cursive Fonts if necessary
      ctx.fillStyle = editTextColor;
      
      // Subtitle (small tag)
      ctx.font = `600 24px ${editFontBody}, sans-serif`;
      ctx.fillText(editSubtitle.toUpperCase(), W / 2, H * 0.28);

      // Title (large)
      ctx.font = `900 52px ${editFontHeading}, sans-serif`;
      // wrap title text if long
      const words = editTitle.split(' ');
      let line = '';
      let yCoord = H * 0.38;
      const lineHeight = 60;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        ctx.font = `900 52px ${editFontHeading}, sans-serif`;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > W * 0.8 && n > 0) {
          ctx.fillText(line, W / 2, yCoord);
          line = words[n] + ' ';
          yCoord += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, W / 2, yCoord);
      ctx.restore();

      // 4. Draw CTA Button
      ctx.save();
      const btnW = 420;
      const btnH = 72;
      const btnX = (W - btnW) / 2;
      const btnY = H * 0.74;

      ctx.fillStyle = editPrimaryColor;
      ctx.shadowColor = `${editPrimaryColor}50`;
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(btnX, btnY, btnW, btnH, 36) : ctx.rect(btnX, btnY, btnW, btnH);
      ctx.fill();

      // CTA Text
      ctx.shadowBlur = 0;
      ctx.fillStyle = editSecondaryColor;
      ctx.font = `bold 22px ${editFontBody}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(editCta.toUpperCase(), W / 2, btnY + btnH / 2);
      ctx.restore();

      // 5. Draw Brand Logo
      const logoSrc = getActiveLogoSrc();
      if (logoSrc) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
          ctx.save();
          // Position logo at the top center
          const logoW = 120;
          const logoH = 50;
          const logoX = (W - logoW) / 2;
          const logoY = H * 0.12;

          ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
          ctx.restore();
        };
        logoImg.src = logoSrc;
      }
    };

    if (editBgImage) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = () => drawVisuals(bgImg);
      bgImg.onerror = () => drawVisuals();
      bgImg.src = editBgImage;
    } else {
      drawVisuals();
    }
  }, [
    selectedTemplate,
    editTitle,
    editSubtitle,
    editCta,
    editBgImage,
    editBgColor,
    editTextColor,
    editPrimaryColor,
    editSecondaryColor,
    editFontHeading,
    editFontBody,
    logoOption,
    selectedBrandId
  ]);

  // Handle Export / Download
  const handleExportPNG = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    setIsExporting(true);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `pink-logic-design-${selectedTemplate?.id}-${Date.now()}.png`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Save draft automatically to history
      handleSaveDraft();
    } catch (e) {
      console.error('Error generating canvas data:', e);
      alert('Erro ao compilar design. Algumas imagens externas podem apresentar restrições CORS. Experimente utilizar outra imagem ou cor sólida.');
    } finally {
      setIsExporting(false);
    }
  };

  // Save to drafts history
  const handleSaveDraft = () => {
    if (!selectedTemplate) return;

    const newDraft: TemplateStructure = {
      ...selectedTemplate,
      id: `draft-${Date.now()}`,
      title: editTitle,
      subtitle: editSubtitle,
      cta: editCta,
      bgImage: editBgImage,
      bgColor: editBgColor,
      textColor: editTextColor,
      primaryColor: editPrimaryColor,
      secondaryColor: editSecondaryColor,
      fontHeading: editFontHeading,
      fontBody: editFontBody,
      isDraft: true
    };

    const updated = [newDraft, ...historyPack.filter(h => h.id !== selectedTemplate.id)];
    saveHistoryDrafts(updated);
  };

  const handleOpenEditorCompleto = () => {
    // Save draft state so editor can pull it if desired
    handleSaveDraft();
    window.location.href = `/criacao/editor?template=${selectedTemplate?.id}&title=${encodeURIComponent(editTitle)}&subtitle=${encodeURIComponent(editSubtitle)}&cta=${encodeURIComponent(editCta)}&bg=${encodeURIComponent(editBgColor)}`;
  };

  // Filters presets
  const filteredPresets = PRESETS_BANK.filter(tpl => {
    const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory || tpl.format === activeCategory;
    const matchesSearch = getTplString(tpl.title, language).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tpl.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          getTplString(tpl.subtitle, language).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="brandkit-pro-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="neon-text" style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Template Hub Premium</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Criação ultra rápida baseada em presets profissionais prontos de alta conversão</p>
        </div>
        
        {/* Toggle between library and drafts */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <button 
            onClick={() => setViewMode('presets')} 
            className={`btn-secondary ${viewMode === 'presets' ? 'active' : ''}`}
            style={{ height: '32px', fontSize: '0.75rem', padding: '0 12px', border: 'none' }}
          >
            <Sparkles size={14} />
            <span>Biblioteca Hub</span>
          </button>
          <button 
            onClick={() => setViewMode('history')} 
            className={`btn-secondary ${viewMode === 'history' ? 'active' : ''}`}
            style={{ height: '32px', fontSize: '0.75rem', padding: '0 12px', border: 'none' }}
          >
            <History size={14} />
            <span>Favoritos & Rascunhos ({historyPack.length})</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Pesquisar nichos, cores ou formatos de templates..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px', height: '40px' }}
          />
        </div>
      </div>

      {viewMode === 'presets' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Categories Sidebar */}
          <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '70vh', overflowY: 'auto', background: 'rgba(17, 17, 24, 0.45)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.7rem', color: '#A1A1B5', fontWeight: 700, paddingLeft: '8px', marginBottom: '8px', textTransform: 'uppercase' }}>Filtros & Categorias</span>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`btn-secondary ${activeCategory === cat.id ? 'active' : ''}`}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  height: '34px',
                  justifyContent: 'flex-start',
                  paddingLeft: '12px',
                  border: 'none',
                  background: activeCategory === cat.id ? 'rgba(255, 47, 191, 0.08)' : 'none',
                  borderColor: 'transparent',
                  color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredPresets.map(tpl => (
              <div 
                key={tpl.id} 
                className="card"
                onClick={() => handleOpenQuickEditor(tpl)}
                style={{ 
                  background: 'rgba(17, 17, 24, 0.35)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, border-color 0.2s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Format tag badge */}
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.65)', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', zIndex: 1 }}>
                  {tpl.format}
                </span>

                {/* Cover Preview Image Container */}
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: '#0a0a0f' }}>
                  <img src={tpl.bgImage} alt={getTplString(tpl.title, language)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                  {/* Overlay Gradient visual mock */}
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: tpl.overlayGradient || 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <span style={{ 
                      fontFamily: tpl.fontHeading, 
                      color: tpl.textColor, 
                      fontWeight: 800, 
                      fontSize: '1.25rem',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      {getTplString(tpl.title, language)}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{tpl.categoryLabel}</span>
                  <h3 style={{ fontSize: '0.9rem', margin: 0, color: 'white', fontWeight: 700 }}>{getTplString(tpl.title, language)}</h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{getTplString(tpl.subtitle, language)}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Edição Rápida</span>
                    <ArrowRight size={14} style={{ color: 'var(--primary)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* HISTORY AND DRAFTS TAB */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {historyPack.length === 0 ? (
            <div className="card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', color: '#A1A1B5' }}>
              <History size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
              <h3>Nenhum rascunho salvo ainda</h3>
              <p style={{ fontSize: '0.85rem' }}>Customize templates na biblioteca hub e exporte-os para salvá-los automaticamente em seu histórico.</p>
            </div>
          ) : (
            historyPack.map(draft => (
              <div 
                key={draft.id} 
                className="card"
                onClick={() => handleOpenQuickEditor(draft)}
                style={{ 
                  background: 'rgba(17, 17, 24, 0.35)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, border-color 0.2s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = historyPack.filter(h => h.id !== draft.id);
                    saveHistoryDrafts(updated);
                  }}
                  style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#EF4444', borderRadius: '4px', padding: '4px', cursor: 'pointer', zIndex: 1 }}
                >
                  <Trash2 size={12} />
                </button>

                <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: '#0a0a0f' }}>
                  <img src={draft.bgImage} alt={getTplString(draft.title, language)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                  <div style={{ position: 'absolute', inset: 0, background: draft.overlayGradient || 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                    <span style={{ fontFamily: draft.fontHeading, color: draft.textColor, fontWeight: 800, fontSize: '1.25rem' }}>
                      {getTplString(draft.title, language)}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Rascunho Salvo</span>
                  <h3 style={{ fontSize: '0.9rem', margin: 0, color: 'white', fontWeight: 700 }}>{getTplString(draft.title, language)}</h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>{getTplString(draft.subtitle, language)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QUICK EDITOR POPUP MODAL */}
      {selectedTemplate && (
        <div className="modal-overlay" style={{ position: 'fixed', zIndex: 999 }}>
          <div className="modal-content" style={{ 
            maxWidth: '1080px', 
            width: '95%', 
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 47, 191, 0.15)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 40px rgba(255,47,191,0.05)',
            display: 'grid', 
            gridTemplateColumns: '1fr 480px', 
            gap: '2rem',
            padding: '2rem',
            borderRadius: '20px'
          }}>
            {/* Left Side: Real-Time Preview Canvas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Formato: <strong style={{ color: 'white', textTransform: 'uppercase' }}>{selectedTemplate.format}</strong></span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estilo: <strong style={{ color: 'white', textTransform: 'uppercase' }}>{selectedTemplate.overlayStyle}</strong></span>
              </div>

              {/* Responsive Visual Viewport */}
              <div style={{
                width: '100%',
                maxWidth: '440px',
                aspectRatio: selectedTemplate.format === 'story' ? '9/16' : selectedTemplate.format === 'pinterest' ? '2/3' : '1/1',
                boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#07070a'
              }}>
                <canvas 
                  ref={previewCanvasRef} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Right Side: Quick Adjustments Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="brand-font" style={{ fontSize: '1.25rem', color: 'white', margin: 0 }}>Edição Cirúrgica</h3>
                <button 
                  onClick={() => setSelectedTemplate(null)}
                  style={{ background: 'none', border: 'none', color: '#A1A1B5', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Brand Kit Selector Tab */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                  <Palette size={14} />
                  <span>APLICAR BRAND KIT INTELIGENTE</span>
                </div>
                <select 
                  className="input-field" 
                  value={selectedBrandId}
                  onChange={(e) => handleApplyBrandKit(e.target.value)}
                >
                  <option value="">Selecione uma Identidade...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              {/* Text fields */}
              <div className="form-group">
                <label>Título Principal</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Subtítulo</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editSubtitle}
                  onChange={e => setEditSubtitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Texto do Botão (CTA)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editCta}
                  onChange={e => setEditCta(e.target.value)}
                />
              </div>

              {/* Image Swap Section */}
              <div className="form-group">
                <label>Imagem de Fundo (Upload ou Link)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="URL da imagem..."
                    value={editBgImage}
                    onChange={e => setEditBgImage(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary"
                    style={{ padding: '0 12px', height: '40px', whiteSpace: 'nowrap' }}
                  >
                    <Upload size={16} />
                  </button>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleUploadBgImage} 
                    style={{ display: 'none' }} 
                  />
                </div>
              </div>

              {/* Brand Logo Toggles */}
              {activeBrand?.logo && (
                <div className="form-group">
                  <label>Inserir Logo da Marca</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {([
                      { id: 'color', label: 'Colorida' },
                      { id: 'white', label: 'Branca' },
                      { id: 'none', label: 'Ocultar' }
                    ] as const).map(option => (
                      <button
                        key={option.id}
                        onClick={() => setLogoOption(option.id)}
                        className={`btn-secondary ${logoOption === option.id ? 'active' : ''}`}
                        style={{ height: '34px', fontSize: '0.75rem', padding: 0 }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Customizer Accordion */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', color: '#A1A1B5' }}>Fundo</span>
                  <input type="color" value={editBgColor} onChange={e => setEditBgColor(e.target.value)} style={{ width: '100%', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', color: '#A1A1B5' }}>Texto</span>
                  <input type="color" value={editTextColor} onChange={e => setEditTextColor(e.target.value)} style={{ width: '100%', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', color: '#A1A1B5' }}>Botão CTA</span>
                  <input type="color" value={editPrimaryColor} onChange={e => setEditPrimaryColor(e.target.value)} style={{ width: '100%', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', color: '#A1A1B5' }}>Texto CTA</span>
                  <input type="color" value={editSecondaryColor} onChange={e => setEditSecondaryColor(e.target.value)} style={{ width: '100%', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
                <button 
                  className="btn-primary" 
                  style={{ height: '44px', justifyContent: 'center', fontSize: '0.85rem' }}
                  onClick={handleExportPNG}
                  disabled={isExporting}
                >
                  <Download size={18} />
                  <span>{isExporting ? 'Compilando Design...' : 'Exportar PNG (Baixar Pronto)'}</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ height: '38px', justifyContent: 'center', fontSize: '0.8rem' }}
                    onClick={handleSaveDraft}
                  >
                    Salvar Rascunho
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ height: '38px', justifyContent: 'center', fontSize: '0.8rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    onClick={handleOpenEditorCompleto}
                  >
                    Editor Completo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic styles injection */}
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          backdrop-filter: blur(8px);
        }
        .modal-content {
          border-radius: var(--radius-lg);
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .form-group label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

    </div>
  );
};

export default TemplatesPremium;
