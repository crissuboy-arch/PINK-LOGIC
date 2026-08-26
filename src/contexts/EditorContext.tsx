import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useBrand } from '../providers/BrandProvider';
import { useCentralStore } from '../store/CentralStore';
import { TEMPLATES_DATA } from '../templates_data';

const EDITOR_DATA_KEY = 'pinklogic.projects.editor'

function saveEditorData(projectId: string, data: { slides: Slide[]; canvasFormat: CanvasFormat; slideCount?: number }) {
  try {
    const all = JSON.parse(localStorage.getItem(EDITOR_DATA_KEY) || '{}')
    all[projectId] = { 
      slides: data.slides, 
      canvasFormat: data.canvasFormat, 
      slideCount: data.slideCount, 
      updatedAt: new Date().toISOString() 
    }
    localStorage.setItem(EDITOR_DATA_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('[EditorContext] Failed to save editor data:', e)
  }
}

export function loadEditorData(projectId: string): { slides: Slide[]; canvasFormat: CanvasFormat; slideCount?: number } | null {
  try {
    const all = JSON.parse(localStorage.getItem(EDITOR_DATA_KEY) || '{}')
    return all[projectId] || null
  } catch {
    return null
  }
}

export interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  isUppercase?: boolean;
  borderRadius?: number;
  blur?: number;
  brightness?: number;
  glow?: string;
  isBackgroundRemoved?: boolean;
  isLocked?: boolean;
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  isHidden?: boolean;
  objectFit?: 'cover' | 'contain';
  backgroundStyle?: string;
  backdropFilter?: string;
  borderStyle?: string;
  borderWidth?: number;
  borderColor?: string;
  borderEnabled?: boolean;
  textGlowEnabled?: boolean;
  textGlowColor?: string;
  textGlowBlur?: number;
  textStrokeColor?: string;
  textStrokeWidth?: number;
  textGradientEnabled?: boolean;
  textGradientColor1?: string;
  textGradientColor2?: string;
}

export interface Slide {
  id: string;
  elements: EditorElement[];
  background: {
    type: 'color' | 'gradient' | 'image';
    value: string;
    blur: number;
    brightness: number;
    opacity: 100 | number;
    color1?: string;
    color2?: string;
    direction?: 'tb' | 'lr' | 'diag';
    overlayType?: string;
    overlayOpacity?: number;
  };
}

export interface CanvasFormat {
  id: string;
  name: string;
  width: number;
  height: number;
}

interface EditorContextType {
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  canvasFormat: CanvasFormat;
  setCanvasFormat: (formatId: string) => void;
  availableFormats: CanvasFormat[];

  // BrandKit aliases — delegates to BrandProvider
  brandKits: ReturnType<typeof useBrand>['brands'];
  activeBrandKit: ReturnType<typeof useBrand>['activeBrand'];
  setActiveBrandKit: (kit: ReturnType<typeof useBrand>['activeBrand']) => void;

  saveProject: () => void;
  slideCount: number;
  setSlideCount: (count: number) => void;

  // Slide helpers
  addSlide: () => void;
  duplicateSlide: (index: number) => void;
  removeSlide: (index: number) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  updateCurrentSlide: (updates: Partial<Slide>) => void;
  colorHistory: string[];
  addToHistory: (color: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slides, setSlides] = useState<Slide[]>([{
    id: 'slide-1',
    elements: [
      {
        id: 'el-1',
        type: 'text',
        content: 'PinkLogic',
        x: 140,
        y: 180,
        width: 800,
        height: 120,
        rotation: 0,
        opacity: 100,
        zIndex: 2,
        fontSize: 72,
        color: '#FF2D9B',
        fontFamily: 'Outfit',
        fontWeight: 800,
        textAlign: 'center',
        lineHeight: 1.1,
        letterSpacing: 0,
        isUppercase: false
      },
      {
        id: 'el-2',
        type: 'text',
        content: 'A revolução visual com inteligência artificial para o seu negócio.',
        x: 190,
        y: 320,
        width: 700,
        height: 100,
        rotation: 0,
        opacity: 80,
        zIndex: 3,
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 400,
        textAlign: 'center',
        lineHeight: 1.4,
        letterSpacing: 0,
        isUppercase: false
      },
      {
        id: 'el-3',
        type: 'shape',
        content: 'square',
        x: 390,
        y: 720,
        width: 300,
        height: 60,
        rotation: 0,
        opacity: 100,
        zIndex: 1,
        color: '#FF2D9B',
        borderRadius: 30
      },
      {
        id: 'el-4',
        type: 'text',
        content: 'QUERO COMEÇAR AGORA',
        x: 390,
        y: 738,
        width: 300,
        height: 30,
        rotation: 0,
        opacity: 100,
        zIndex: 2,
        fontSize: 14,
        color: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 700,
        textAlign: 'center',
        letterSpacing: 2,
        isUppercase: true
      }
    ],
    background: {
      type: 'color',
      value: '#0D0D0D',
      blur: 0,
      brightness: 100,
      opacity: 100
    }
  }]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const availableFormats: CanvasFormat[] = [
    { id: 'ig_post', name: 'Instagram Post', width: 1080, height: 1080 },
    { id: 'ig_story', name: 'Instagram Story', width: 1080, height: 1920 },
    { id: 'reels', name: 'Reels Cover', width: 1080, height: 1920 },
    { id: 'tiktok', name: 'TikTok Vertical', width: 1080, height: 1920 },
    { id: 'carousel', name: 'Carousel', width: 1080, height: 1350 },
  ];

  const [canvasFormat, setCanvasFormatState] = useState<CanvasFormat>(availableFormats[0]);
  const [slideCount, setSlideCount] = useState<number>(5);

  // Bridge to BrandProvider — activeBrandKit/brandKits are managed externally
  const { brands: brandKits, activeBrand: activeBrandKit, setActiveBrand: setActiveBrandKit } = useBrand();
  const { projects: centralProjects, createProject: centralCreateProject, updateProject: centralUpdateProject } = useCentralStore();
  const projectRef = useRef<string | null>(null);

  // Dynamic parameter loading on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('id');
      if (projectId) {
        projectRef.current = projectId;
        const loaded = loadEditorData(projectId);
        if (loaded) {
          if (loaded.slides) setSlides(loaded.slides);
          if (loaded.canvasFormat) setCanvasFormatState(loaded.canvasFormat);
          if (loaded.slideCount) setSlideCount(loaded.slideCount);
        }
      } else {
        const templateParam = params.get('template');
        if (templateParam) {
          let editorTplKey = 'dark-infoproduto';
          const lowerParam = templateParam.toLowerCase();
          if (lowerParam.includes('beauty') || lowerParam.includes('clinica')) {
            editorTplKey = 'beauty-premium';
          } else if (lowerParam.includes('tech') || lowerParam.includes('neon-tech')) {
            editorTplKey = 'tech-neon';
          } else if (lowerParam.includes('black') || lowerParam.includes('friday')) {
            editorTplKey = 'black-friday';
          } else if (lowerParam.includes('drop') || lowerParam.includes('dropshipping')) {
            editorTplKey = 'dropshipping-dark';
          } else if (lowerParam.includes('ebook')) {
            editorTplKey = 'ebook-premium';
          } else if (lowerParam.includes('lux') || lowerParam.includes('luxury') || lowerParam.includes('feminino')) {
            editorTplKey = 'luxury-gold';
          } else if (lowerParam.includes('minimal')) {
            editorTplKey = 'minimal-clean';
          } else if (lowerParam.includes('story')) {
            editorTplKey = 'story-neon';
          }

          const baseTpl = (TEMPLATES_DATA as any)[editorTplKey];
          if (baseTpl) {
            const bg = { ...baseTpl.background };
            const bgParam = params.get('bg');
            if (bgParam) {
              bg.type = 'color';
              bg.value = decodeURIComponent(bgParam);
            }

            let elements = JSON.parse(JSON.stringify(baseTpl.elements || []));
            const titleParam = params.get('title');
            const subtitleParam = params.get('subtitle');
            const ctaParam = params.get('cta');

            elements = elements.map((el: any) => {
              const lowerId = el.id.toLowerCase();
              if (lowerId.includes('title') || lowerId.includes('headline')) {
                if (titleParam) el.content = decodeURIComponent(titleParam);
              } else if (lowerId.includes('desc') || lowerId.includes('sub') || lowerId.includes('subtitle')) {
                if (subtitleParam) el.content = decodeURIComponent(subtitleParam);
              } else if (lowerId.includes('btn') || lowerId.includes('button') || lowerId.includes('cta')) {
                if (el.type === 'text') {
                  if (ctaParam) el.content = decodeURIComponent(ctaParam);
                }
              }
              return el;
            });

            setSlides([{
              id: 'slide-1',
              elements,
              background: bg
            }]);
          }
        }
      }
    } catch (e) {
      console.warn('[EditorContext] Failed to load param project:', e);
    }
  }, []);

  const setCanvasFormat = (formatId: string) => {
    const format = availableFormats.find(f => f.id === formatId);
    if (format) {
      setCanvasFormatState(format);
    }
  };

  const [colorHistory, setColorHistory] = useState<string[]>(['#FF2D8D', '#0d0d12', '#ffffff', '#7000FF', '#00E0FF']);

  const addToHistory = (color: string) => {
    if (color.startsWith('linear-gradient')) return;
    setColorHistory(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 5);
    });
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Math.random().toString(36).substr(2, 9)}`,
      elements: [],
      background: { ...slides[currentSlideIndex].background }
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
    setSelectedElementId(null);
  };

  const duplicateSlide = (index: number) => {
    const slideToCopy = slides[index];
    const newSlide: Slide = {
      ...slideToCopy,
      id: `slide-${Math.random().toString(36).substr(2, 9)}`,
      elements: slideToCopy.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) }))
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(index + 1);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, index - 1));
    setSelectedElementId(null);
  };

  const reorderSlides = (startIndex: number, endIndex: number) => {
    const result = Array.from(slides);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setSlides(result);
    setCurrentSlideIndex(endIndex);
  };

  const updateCurrentSlide = (updates: Partial<Slide>) => {
    setSlides(slides.map((s, i) => i === currentSlideIndex ? { ...s, ...updates } : s));
  };

  const saveProject = async () => {
    const projectId = projectRef.current || crypto.randomUUID();
    
    // Save slides to local storage
    saveEditorData(projectId, { slides, canvasFormat, slideCount });

    // Sync project entity to central store
    const existing = centralProjects.find(p => p.id === projectId);
    if (!existing) {
      await centralCreateProject({
        name: `Design ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        description: 'Criado pelo editor visual',
        brandId: '',
        socialAccounts: ['Instagram'],
        email: '',
        timezone: 'America/Sao_Paulo',
        status: 'active',
      });
    } else {
      await centralUpdateProject(projectId, {
        // Keep existing fields
      });
    }

    projectRef.current = projectId;
    
    // Go back to editorial calendar
    window.location.href = '/gestao/calendario';
  };

  return (
    <EditorContext.Provider value={{
      slides, setSlides,
      currentSlideIndex, setCurrentSlideIndex,
      selectedElementId, setSelectedElementId,
      canvasFormat, setCanvasFormat,
      availableFormats,
      brandKits, activeBrandKit, setActiveBrandKit,
      saveProject,
      slideCount, setSlideCount,
      colorHistory, addToHistory,
      addSlide, duplicateSlide, removeSlide, reorderSlides, updateCurrentSlide
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
