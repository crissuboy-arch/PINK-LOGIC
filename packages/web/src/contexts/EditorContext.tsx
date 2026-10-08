import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useBrand } from '../providers/BrandProvider';
import { useCentralStore } from '../store/CentralStore';
import { TEMPLATES_DATA } from '../templates_data';

import { useLocation, useNavigate } from 'react-router-dom';
import { requireSupabase } from '../services/api';
import { loadEditorData, saveEditorData } from '../services/editorDocuments';

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

  saveProject: () => Promise<void>;
  generatedCaption: string;
  setGeneratedCaption: React.Dispatch<React.SetStateAction<string>>;
  isSaving: boolean;
  isLoadingDocument: boolean;
  persistenceError: string | null;
  saveMessage: string | null;
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

const availableFormats: CanvasFormat[] = [
    { id: 'ig_post', name: 'Instagram Post', width: 1080, height: 1080 },
    { id: 'ig_story', name: 'Instagram Story', width: 1080, height: 1920 },
    { id: 'reels', name: 'Reels Cover', width: 1080, height: 1920 },
    { id: 'tiktok', name: 'TikTok Vertical', width: 1080, height: 1920 },
    { id: 'carousel', name: 'Carousel', width: 1080, height: 1350 },
  ];

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


  const [canvasFormat, setCanvasFormatState] = useState<CanvasFormat>(availableFormats[0]);
  const [slideCount, setSlideCount] = useState<number>(5);

  // Bridge to BrandProvider — activeBrandKit/brandKits are managed externally
  const { brands: brandKits, activeBrand: activeBrandKit, setActiveBrand: setActiveBrandKit } = useBrand();
  const { userId, createProject: centralCreateProject } = useCentralStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const versionRef = useRef(0);
  const savingRef = useRef(false);
  const loadedRef = useRef(false);
  const initialSlides = useRef(slides);
  const projectRef = useRef<string | null>(null);

  // Clear account-specific content before another account can open the editor.
  useEffect(() => {
    projectRef.current = null; versionRef.current = 0; loadedRef.current = false;
    setSlides(initialSlides.current); setGeneratedCaption(''); setSaveMessage(null);
  }, [userId]);

  // Reload documents on navigation, including when the provider stays mounted.
  useEffect(() => {
    if (!userId) return;
    if (!['/criacao/editor', '/criacao/carrossel'].includes(location.pathname)) return;
    let cancelled = false;
    const params = new URLSearchParams(location.search);
    const projectId = params.get('id');
    if (projectId && projectId === projectRef.current && loadedRef.current) return;
    projectRef.current = projectId;
    versionRef.current = 0;
    loadedRef.current = !projectId;
    setPersistenceError(null); setSaveMessage(null); setGeneratedCaption('');
    setCurrentSlideIndex(0); setSelectedElementId(null);
    setSlides(initialSlides.current);
    setCanvasFormatState(availableFormats.find(f => f.id === (location.pathname.endsWith('carrossel') ? 'carousel' : 'ig_post'))!);
    setSlideCount(5);
    setIsLoadingDocument(Boolean(projectId));
    try {
      if (projectId) {
        loadEditorData(projectId).then(async loaded => {
          if (cancelled) return;
          if (!loaded) {
            const { data, error } = await requireSupabase().from('projects').select('id').eq('id', projectId).maybeSingle();
            if (cancelled) return;
            if (error || !data) throw new Error('Projeto não encontrado ou sem permissão de acesso.');
            loadedRef.current = true;
            return;
          }
          setSlides(loaded.document.slides);
          setCanvasFormatState(loaded.document.canvasFormat);
          setSlideCount(loaded.document.slideCount || loaded.document.slides.length);
          setGeneratedCaption(loaded.document.caption || '');
          versionRef.current = loaded.version;
          loadedRef.current = true;
        }).catch(error => { if (!cancelled) setPersistenceError(error instanceof Error ? error.message : 'Não foi possível abrir o design.'); })
          .finally(() => { if (!cancelled) setIsLoadingDocument(false); });
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
      setPersistenceError(e instanceof Error ? e.message : 'Não foi possível abrir o design.');
    }
    return () => { cancelled = true; };
  }, [location.pathname, location.search, userId]);

  const setCanvasFormat = useCallback((formatId: string) => {
    const format = availableFormats.find(f => f.id === formatId);
    if (format) {
      setCanvasFormatState(current => current.id === format.id ? current : format);
    }
  }, []);

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
    if (savingRef.current || isLoadingDocument) return;
    if (projectRef.current && !loadedRef.current) { setPersistenceError('Reabra o projeto antes de salvar para evitar substituir um design que não foi carregado.'); return; }
    savingRef.current = true; setIsSaving(true); setPersistenceError(null); setSaveMessage(null);
    try {
      if (!projectRef.current) {
        const project = await centralCreateProject({
          name: `Design ${new Date().toLocaleString('pt-BR')}`,
          description: 'Criado pelo editor visual', brandId: '', socialAccounts: ['Instagram'],
          email: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, status: 'active',
        });
        projectRef.current = project.id;
        loadedRef.current = true;
      }
      versionRef.current = await saveEditorData(projectRef.current, { slides, canvasFormat, slideCount, caption: generatedCaption }, versionRef.current);
      setSaveMessage('Design e legenda salvos na sua conta.');
      navigate(`${location.pathname}?id=${projectRef.current}`, { replace: true });
    } catch (error) {
      setPersistenceError(error instanceof Error ? error.message : 'Falha ao salvar. Seu conteúdo continua no editor.');
    } finally { savingRef.current = false; setIsSaving(false); }
  };

  return (
    <EditorContext.Provider value={{
      slides, setSlides,
      currentSlideIndex, setCurrentSlideIndex,
      selectedElementId, setSelectedElementId,
      canvasFormat, setCanvasFormat,
      availableFormats,
      brandKits, activeBrandKit, setActiveBrandKit,
      saveProject, generatedCaption, setGeneratedCaption, isSaving, isLoadingDocument, persistenceError, saveMessage,
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
