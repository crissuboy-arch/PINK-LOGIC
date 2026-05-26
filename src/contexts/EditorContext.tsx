import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useBrand } from '../providers/BrandProvider';
import { useCentralStore } from '../store/CentralStore';

const EDITOR_DATA_KEY = 'pinklogic.projects.editor'

function saveEditorData(projectId: string, data: { slides: Slide[]; canvasFormat: CanvasFormat }) {
  try {
    const all = JSON.parse(localStorage.getItem(EDITOR_DATA_KEY) || '{}')
    all[projectId] = { slides: data.slides, canvasFormat: data.canvasFormat, updatedAt: new Date().toISOString() }
    localStorage.setItem(EDITOR_DATA_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('[EditorContext] Failed to save editor data:', e)
  }
}

export function loadEditorData(projectId: string): { slides: Slide[]; canvasFormat: CanvasFormat } | null {
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

  // Slide helpers
  addSlide: () => void;
  duplicateSlide: (index: number) => void;
  removeSlide: (index: number) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  colorHistory: string[];
  addToHistory: (color: string) => void;
  updateCurrentSlide: (updates: Partial<Slide>) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slides, setSlides] = useState<Slide[]>([{
    id: 'slide-1',
    elements: [],
    background: {
      type: 'color',
      value: '#0d0d12',
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
    saveEditorData(projectId, { slides, canvasFormat });

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
