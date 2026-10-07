import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  Square, 
  Palette, 
  Upload, 
  Download, 
  Trash2, 
  Layers, 
  Plus, 
  Minus, 
  Save,
  Sparkles,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Image as ImageIcon,
  MoreHorizontal,
  SlidersHorizontal
} from 'lucide-react';
import { Rnd } from 'react-rnd';
import { TEMPLATES_DATA } from '../../templates_data';
import { useEditor } from '../../contexts/EditorContext';
import { useProjectDesign } from '../../hooks/useProjectDesign';
import { useBrand } from '../../providers/BrandProvider';
import { applyResolvedDesign, getBrandColorsArray } from '../../hooks/applyResolvedDesign';
import { ColorPicker } from '../../components/Editor/ColorPicker';
import type { EditorElement, Slide } from '../../contexts/EditorContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCentralStore } from '../../store/CentralStore';
import { useIsMobile } from '../../hooks/useIsMobile';

const getGradientCss = (color1: string, color2: string, direction: 'tb' | 'lr' | 'diag') => {
  const dirMap = {
    tb: 'to bottom',
    lr: 'to right',
    diag: '135deg'
  };
  const dir = dirMap[direction] || 'to bottom';
  return `linear-gradient(${dir}, ${color1}, ${color2})`;
};

const getShadowStyle = (el: EditorElement) => {
  if (!el.shadowEnabled) return 'none';
  const x = el.shadowOffsetX ?? 0;
  const y = el.shadowOffsetY ?? 8;
  const blur = el.shadowBlur ?? 20;
  const color = el.shadowColor ?? '#000000';
  const opacity = el.shadowOpacity ?? 25;

  let r = 0, g = 0, b = 0;
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }
  return `drop-shadow(${x}px ${y}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity / 100}))`;
};

const GOOGLE_FONTS_LIST = [
  { name: 'Playfair Display', category: 'Luxo' },
  { name: 'Cormorant Garamond', category: 'Luxo' },
  { name: 'Cinzel', category: 'Luxo' },
  { name: 'Lora', category: 'Luxo' },
  { name: 'Bodoni Moda', category: 'Luxo' },
  { name: 'Prata', category: 'Luxo' },
  { name: 'Cardo', category: 'Luxo' },
  { name: 'EB Garamond', category: 'Luxo' },
  { name: 'Libre Baskerville', category: 'Luxo' },
  { name: 'Merriweather', category: 'Luxo' },
  
  { name: 'Inter', category: 'Minimalista' },
  { name: 'Nunito', category: 'Minimalista' },
  { name: 'Lato', category: 'Minimalista' },
  { name: 'DM Sans', category: 'Minimalista' },
  { name: 'Montserrat', category: 'Minimalista' },
  { name: 'Outfit', category: 'Minimalista' },
  { name: 'Poppins', category: 'Minimalista' },
  { name: 'Roboto', category: 'Minimalista' },
  { name: 'Open Sans', category: 'Minimalista' },
  { name: 'Work Sans', category: 'Minimalista' },
  { name: 'Quicksand', category: 'Minimalista' },
  
  { name: 'Bebas Neue', category: 'Bold' },
  { name: 'Oswald', category: 'Bold' },
  { name: 'Anton', category: 'Bold' },
  { name: 'Archivo Black', category: 'Bold' },
  { name: 'Impact', category: 'Bold' },
  { name: 'Barlow Condensed', category: 'Bold' },
  { name: 'Teko', category: 'Bold' },
  { name: 'Rubik Mono One', category: 'Bold' },
  { name: 'Syncopate', category: 'Bold' },
  { name: 'Orbitron', category: 'Bold' },
  
  { name: 'Great Vibes', category: 'Escrita' },
  { name: 'Sacramento', category: 'Escrita' },
  { name: 'Parisienne', category: 'Escrita' },
  { name: 'Alex Brush', category: 'Escrita' },
  { name: 'Pacifico', category: 'Escrita' },
  { name: 'Dancing Script', category: 'Escrita' },
  { name: 'Allura', category: 'Escrita' },
  { name: 'Pinyon Script', category: 'Escrita' }
];

const Editor = ({ isCarouselOnly = false }: { isCarouselOnly?: boolean }) => {
  const { t } = useLanguage();
  const { 
    slides, setSlides, currentSlideIndex, setCurrentSlideIndex,
    selectedElementId, setSelectedElementId,
    canvasFormat, setCanvasFormat, availableFormats,
    saveProject,
    slideCount, setSlideCount,
    addSlide, duplicateSlide, removeSlide, reorderSlides, updateCurrentSlide,
    colorHistory, addToHistory
  } = useEditor();

  const { projectBranding, cssVariables } = useProjectDesign();
  useEffect(() => {
    if (isCarouselOnly) {
      setCanvasFormat('carousel');
    }
  }, [isCarouselOnly, setCanvasFormat]);
  const { brands: brandKits, activeBrand: activeBrandKit, setActiveBrand: setActiveBrandKit, updateBrand } = useBrand();

  const currentSlide = slides[currentSlideIndex];
  const elements = currentSlide.elements;
  const background = currentSlide.background;

  type EditorTab = 'elements' | 'text' | 'uploads' | 'background' | 'brand' | 'templates' | 'layers' | 'mockups';
  const [activeTab, setActiveTab] = useState<EditorTab>('templates');

  // Mobile (≤768px): ferramentas e propriedades abrem em bottom sheets sobre o canvas.
  const isMobile = useIsMobile();
  const [mobileToolOpen, setMobileToolOpen] = useState(false);
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  const selectTab = (tab: EditorTab) => {
    if (isMobile && activeTab === tab && mobileToolOpen) {
      setMobileToolOpen(false);
      return;
    }
    setActiveTab(tab);
    if (isMobile) {
      setMobilePropsOpen(false);
      setMobileToolOpen(true);
    }
  };

  const toggleMobileProps = () => {
    setMobileToolOpen(false);
    setMobilePropsOpen(open => !open);
  };

  const [zoom, setZoom] = useState(0.8);

  // Mobile: alças de redimensionar com ~32px reais na tela (o canvas é escalado pelo zoom).
  const touchHandle = Math.round(32 / Math.max(zoom, 0.05));
  const corner = (v: 'top' | 'bottom', h: 'left' | 'right') =>
    ({ width: touchHandle, height: touchHandle, [v]: -touchHandle / 2, [h]: -touchHandle / 2 });
  const mobileResizeHandles = isMobile
    ? { topLeft: corner('top', 'left'), topRight: corner('top', 'right'), bottomLeft: corner('bottom', 'left'), bottomRight: corner('bottom', 'right') }
    : undefined;
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const designApplied = useRef(false);

  // Guidelines snapping, mockups and logos
  const [snapLines, setSnapLines] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
  const [selectedMockup, setSelectedMockup] = useState<string | null>(null);
  const [logoList, setLogoList] = useState<string[]>([]);
  const [logoUrlInputValue, setLogoUrlInputValue] = useState('');
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlayingSlideshow) {
      interval = setInterval(() => {
        const nextIndex = currentSlideIndex >= slides.length - 1 ? 0 : currentSlideIndex + 1;
        setCurrentSlideIndex(nextIndex);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlayingSlideshow, slides.length, currentSlideIndex]);

  useEffect(() => {
    if (activeBrandKit?.logo) {
      setLogoUrlInputValue(activeBrandKit.logo);
    } else {
      setLogoUrlInputValue('');
    }
  }, [activeBrandKit]);

  // Load premium Google Fonts dynamically and load logos on mount
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Inter:wght@100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Bebas+Neue&family=Oswald:wght@200..700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Anton&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Great+Vibes&family=Sacramento&family=Parisienne&family=Alex+Brush&display=swap';
    document.head.appendChild(link);

    const savedLogos = localStorage.getItem('pink_logic_brand_logos');
    if (savedLogos) {
      setLogoList(JSON.parse(savedLogos));
    } else {
      setLogoList(['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&auto=format&fit=crop']);
    }

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const { activeProjectId } = useCentralStore();
  const [projectStickers, setProjectStickers] = useState<any[]>([]);
  const [localUploads, setLocalUploads] = useState<string[]>([]);
  const [customModels, setCustomModels] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storageKey = `pink_logic_stickers_${activeProjectId || 'default'}`;
      const savedStickers = localStorage.getItem(storageKey);
      if (savedStickers) {
        setProjectStickers(JSON.parse(savedStickers));
      } else {
        setProjectStickers([]);
      }

      const uploadsKey = `pink_logic_uploads_${activeProjectId || 'default'}`;
      const savedUploads = localStorage.getItem(uploadsKey);
      if (savedUploads) {
        setLocalUploads(JSON.parse(savedUploads));
      } else {
        setLocalUploads([]);
      }

      const savedModels = localStorage.getItem('pink_logic_custom_models');
      if (savedModels) {
        setCustomModels(JSON.parse(savedModels));
      } else {
        setCustomModels([]);
      }
    } catch (e) {
      console.error('Failed to load assets in editor', e);
    }
  }, [activeProjectId, activeTab]);

  // Check for pending asset from Assets OS on mount or when index changes
  useEffect(() => {
    const pending = localStorage.getItem('pink_logic_editor_pending_asset');
    if (pending) {
      localStorage.removeItem('pink_logic_editor_pending_asset');
      const timer = setTimeout(() => {
        addImage(pending);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentSlideIndex]);

  if (typeof document !== 'undefined' && !designApplied.current) {
    applyResolvedDesign(document.documentElement, { cssVariables });
    designApplied.current = true;
  }

  // Auto-calculate scale/zoom to fit canvas perfectly in the workspace
  useEffect(() => {
    const fitToScreen = () => {
      const workspace = document.querySelector('.editor-workspace') as HTMLElement;
      if (workspace) {
        // Safe area margins: 80px horizontal, 180px vertical (to account for header and slide strip).
        // Mobile: margens mínimas para o canvas ocupar a tela (só desconta a faixa de slides, se houver).
        const mobile = window.matchMedia('(max-width: 768px)').matches;
        const slideBar = document.querySelector('.slide-manager-bar') as HTMLElement | null;
        const cs = getComputedStyle(workspace);
        const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        const safeWidth = workspace.clientWidth - (mobile ? padX : 80);
        // No mobile o padding inferior reserva o espaço do bottom sheet aberto
        const safeHeight = workspace.clientHeight - (mobile ? padY + 8 + (slideBar?.offsetHeight || 0) : 180);
        
        if (safeWidth > 0 && safeHeight > 0) {
          const scaleX = safeWidth / canvasFormat.width;
          const scaleY = safeHeight / canvasFormat.height;
          // Use the limiting dimension to ensure the canvas is fully visible
          const optimalZoom = Math.min(scaleX, scaleY);
          // Limit maximum zoom to 0.95 for a nice safe area border
          setZoom(Math.min(Number(optimalZoom.toFixed(2)), 0.95));
        }
      }
    };

    // Calculate immediately and also resize listener
    fitToScreen();
    window.addEventListener('resize', fitToScreen);
    
    // Fallback timer to ensure layout is settled
    const timer = setTimeout(fitToScreen, 100);
    
    return () => {
      window.removeEventListener('resize', fitToScreen);
      clearTimeout(timer);
    };
  }, [canvasFormat, mobileToolOpen, mobilePropsOpen]);

  const [showFormatModal, setShowFormatModal] = useState(!isCarouselOnly);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInputs, setAiInputs] = useState({ niche: '', topic: '', tone: 'motivational' });

  const selectedElement = elements.find(el => el.id === selectedElementId);

  // Mobile: selecionar um elemento abre as propriedades; desselecionar fecha.
  useEffect(() => {
    if (!isMobile) return;
    if (selectedElementId) {
      setMobileToolOpen(false);
      setMobilePropsOpen(true);
    } else {
      setMobilePropsOpen(false);
    }
  }, [selectedElementId, isMobile]);

  const [fontSearchQuery, setFontSearchQuery] = useState('');
  const [activeFontCategory, setActiveFontCategory] = useState<'all' | 'Luxo' | 'Minimalista' | 'Bold' | 'Escrita' | 'favoritas' | 'recentes'>('all');
  const [favoriteFonts, setFavoriteFonts] = useState<string[]>([]);
  const [recentFonts, setRecentFonts] = useState<string[]>([]);

  useEffect(() => {
    try {
      const favs = localStorage.getItem('pink_logic_favorite_fonts');
      if (favs) setFavoriteFonts(JSON.parse(favs));
      const recs = localStorage.getItem('pink_logic_recent_fonts');
      if (recs) setRecentFonts(JSON.parse(recs));
    } catch (e) {
      console.error('Error loading fonts settings', e);
    }
  }, []);

  const toggleFavoriteFont = (fontName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favoriteFonts.includes(fontName)
      ? favoriteFonts.filter(f => f !== fontName)
      : [...favoriteFonts, fontName];
    setFavoriteFonts(updated);
    localStorage.setItem('pink_logic_favorite_fonts', JSON.stringify(updated));
  };

  const selectFont = (fontName: string) => {
    lazyLoadFont(fontName);
    const updatedRecents = [fontName, ...recentFonts.filter(f => f !== fontName)].slice(0, 10);
    setRecentFonts(updatedRecents);
    localStorage.setItem('pink_logic_recent_fonts', JSON.stringify(updatedRecents));
    if (selectedElement && selectedElement.type === 'text') {
      updateElement(selectedElement.id, { fontFamily: fontName });
    }
  };

  const lazyLoadFont = (fontName: string) => {
    const linkId = `google-font-lazy-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700;800&display=swap`;
      document.head.appendChild(link);
    }
  };

  const applyFontPair = (heading: string, body: string) => {
    lazyLoadFont(heading);
    lazyLoadFont(body);

    if (selectedElement && selectedElement.type === 'text') {
      updateElement(selectedElement.id, { fontFamily: heading });
    }

    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    const headingEl: EditorElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: 'Título de Alta Conversão',
      x: (canvasFormat.width / 2) - 250,
      y: (canvasFormat.height / 2) - 80,
      width: 500,
      height: 100,
      rotation: 0,
      opacity: 100,
      zIndex: maxZ + 1,
      fontSize: 54,
      color: '#ffffff',
      fontFamily: heading,
      fontWeight: 800,
      textAlign: 'center',
      lineHeight: 1.2
    };

    const bodyEl: EditorElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: 'Texto complementar de alta legibilidade.',
      x: (canvasFormat.width / 2) - 250,
      y: (canvasFormat.height / 2) + 30,
      width: 500,
      height: 120,
      rotation: 0,
      opacity: 100,
      zIndex: maxZ + 2,
      fontSize: 18,
      color: '#dddddd',
      fontFamily: body,
      fontWeight: 400,
      textAlign: 'center',
      lineHeight: 1.5
    };

    updateCurrentSlide({ elements: [...elements, headingEl, bodyEl] });
    setSelectedElementId(headingEl.id);
  };

  const addText = (type: 'title' | 'subtitle' | 'body') => {
    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    const newEl: EditorElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: type === 'title' ? t('editor.placeholder_title') : type === 'subtitle' ? t('editor.placeholder_subtitle') : t('editor.placeholder_body'),
      x: (canvasFormat.width / 2) - 200,
      y: (canvasFormat.height / 2) - 50,
      width: 400,
      height: 100,
      rotation: 0,
      opacity: 100,
      zIndex: maxZ + 1,
      fontSize: type === 'title' ? 64 : type === 'subtitle' ? 32 : 18,
      color: '#ffffff',
      fontFamily: 'Outfit',
      fontWeight: type === 'title' ? 800 : type === 'subtitle' ? 600 : 400,
      textAlign: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      isUppercase: false,
    };
    updateCurrentSlide({ elements: [...elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const addImage = (url: string) => {
    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    const newEl: EditorElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'image',
      content: url,
      x: (canvasFormat.width / 2) - 250,
      y: (canvasFormat.height / 2) - 250,
      width: 500,
      height: 500,
      rotation: 0,
      opacity: 100,
      zIndex: maxZ + 1,
    };
    updateCurrentSlide({ elements: [...elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const addShape = (type: 'square' | 'circle') => {
    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    const newEl: EditorElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'shape',
      content: type,
      x: (canvasFormat.width / 2) - 100,
      y: (canvasFormat.height / 2) - 100,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 100,
      zIndex: maxZ + 1,
      color: '#FF2D8D',
    };
    updateCurrentSlide({ elements: [...elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const removeElement = (id: string) => {
    updateCurrentSlide({ elements: elements.filter(el => el.id !== id) });
    setSelectedElementId(null);
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    updateCurrentSlide({ elements: elements.map(el => el.id === id ? { ...el, ...updates } : el) });
  };

  const addLogoToCanvas = (logoUrl: string) => {
    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    const newEl: EditorElement = {
      id: 'logo-' + Math.random().toString(36).substr(2, 9),
      type: 'image',
      content: logoUrl,
      x: (canvasFormat.width / 2) - 100,
      y: (canvasFormat.height / 2) - 100,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 100,
      zIndex: maxZ + 1,
      borderRadius: 0,
      objectFit: 'contain',
    };
    updateCurrentSlide({ elements: [...elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const handleDrag = (elId: string, d: { x: number; y: number }, elWidth: number, elHeight: number) => {
    const W = canvasFormat.width;
    const H = canvasFormat.height;
    const centerX = W / 2;
    const centerY = H / 2;

    let snappedX = d.x;
    let snappedY = d.y;
    let guideX: number | null = null;
    let guideY: number | null = null;

    const threshold = 8;

    // Horizontal snapping (Vertical guidelines lines)
    if (Math.abs(d.x - 40) < threshold) {
      snappedX = 40;
      guideX = 40;
    } else if (Math.abs(d.x + elWidth - (W - 40)) < threshold) {
      snappedX = W - 40 - elWidth;
      guideX = W - 40;
    } else if (Math.abs(d.x + elWidth / 2 - centerX) < threshold) {
      snappedX = centerX - elWidth / 2;
      guideX = centerX;
    }

    // Vertical snapping (Horizontal guidelines lines)
    if (Math.abs(d.y - 40) < threshold) {
      snappedY = 40;
      guideY = 40;
    } else if (Math.abs(d.y + elHeight - (H - 40)) < threshold) {
      snappedY = H - 40 - elHeight;
      guideY = H - 40;
    } else if (Math.abs(d.y + elHeight / 2 - centerY) < threshold) {
      snappedY = centerY - elHeight / 2;
      guideY = centerY;
    }

    setSnapLines({ x: guideX, y: guideY });
    updateElement(elId, { x: snappedX, y: snappedY });
  };

  const getCanvasMockupStyles = () => {
    if (!selectedMockup) {
      return {
        boxShadow: '0 0 40px rgba(255, 47, 191, 0.2), 0 30px 70px rgba(0,0,0,0.7)',
        outline: '2px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '0px',
      };
    }
    
    switch (selectedMockup) {
      case 'iphone':
        return {
          borderRadius: '40px',
          outline: '12px solid #1a1a1c',
          boxShadow: '0 0 0 4px #2c2c2e, 0 25px 50px -12px rgba(0,0,0,0.9), 0 0 40px rgba(255, 47, 191, 0.15)',
        };
      case 'ipad':
        return {
          borderRadius: '24px',
          outline: '20px solid #111112',
          boxShadow: '0 0 0 3px #2c2c2e, 0 25px 50px rgba(0,0,0,0.95)',
        };
      case 'notebook':
        return {
          borderRadius: '6px',
          outline: '10px solid #0a0a0a',
          boxShadow: '0 20px 40px rgba(0,0,0,0.9)',
        };
      case 'ebook':
        return {
          borderRadius: '2px 14px 14px 2px',
          boxShadow: 'inset 20px 0 30px rgba(0,0,0,0.4), 10px 10px 25px rgba(0,0,0,0.6)',
          outline: '1px solid rgba(255,255,255,0.05)',
        };
      case 'holo_screen':
        return {
          borderRadius: '12px',
          outline: '3px double #00e0ff',
          boxShadow: '0 0 30px rgba(0, 224, 255, 0.3), inset 0 0 15px rgba(0, 224, 255, 0.1), 0 10px 40px rgba(0,0,0,0.8)',
        };
      default:
        return {};
    }
  };

  const handleResizeStart = (e: React.MouseEvent, element: EditorElement, handle: 'nw' | 'ne' | 'sw' | 'se') => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;
    const startLeft = element.x;
    const startTop = element.y;
    const aspectRatio = startWidth / startHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startLeft;
      let newY = startTop;

      const maintainRatio = element.type === 'image' || moveEvent.shiftKey;

      if (handle === 'se') {
        if (maintainRatio) {
          const delta = (deltaX + deltaY * aspectRatio) / 2;
          newWidth = Math.max(20, startWidth + delta);
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
        }
      } else if (handle === 'sw') {
        if (maintainRatio) {
          const delta = (-deltaX + deltaY * aspectRatio) / 2;
          newWidth = Math.max(20, startWidth + delta);
          newHeight = newWidth / aspectRatio;
          newX = startLeft + (startWidth - newWidth);
        } else {
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          newX = startLeft + (startWidth - newWidth);
        }
      } else if (handle === 'ne') {
        if (maintainRatio) {
          const delta = (deltaX - deltaY * aspectRatio) / 2;
          newWidth = Math.max(20, startWidth + delta);
          newHeight = newWidth / aspectRatio;
          newY = startTop + (startHeight - newHeight);
        } else {
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newY = startTop + (startHeight - newHeight);
        }
      } else if (handle === 'nw') {
        if (maintainRatio) {
          const delta = (-deltaX - deltaY * aspectRatio) / 2;
          newWidth = Math.max(20, startWidth + delta);
          newHeight = newWidth / aspectRatio;
          newX = startLeft + (startWidth - newWidth);
          newY = startTop + (startHeight - newHeight);
        } else {
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newX = startLeft + (startWidth - newWidth);
          newY = startTop + (startHeight - newHeight);
        }
      }

      updateElement(element.id, {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        x: Math.round(newX),
        y: Math.round(newY),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleFillCanvas = (element: EditorElement) => {
    updateElement(element.id, {
      x: 0,
      y: 0,
      width: canvasFormat.width,
      height: canvasFormat.height
    });
  };

  const handleFitToCanvas = (element: EditorElement) => {
    const aspectRatio = element.width / element.height;
    const canvasRatio = canvasFormat.width / canvasFormat.height;

    let newWidth, newHeight;
    if (aspectRatio > canvasRatio) {
      newWidth = canvasFormat.width;
      newHeight = newWidth / aspectRatio;
    } else {
      newHeight = canvasFormat.height;
      newWidth = newHeight * aspectRatio;
    }

    const x = (canvasFormat.width - newWidth) / 2;
    const y = (canvasFormat.height - newHeight) / 2;

    updateElement(element.id, {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(newWidth),
      height: Math.round(newHeight)
    });
  };

  const duplicateElement = (element: EditorElement) => {
    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    const newEl: EditorElement = {
      ...element,
      id: Math.random().toString(36).substr(2, 9),
      x: element.x + 30,
      y: element.y + 30,
      zIndex: maxZ + 1
    };
    updateCurrentSlide({ elements: [...elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const handleRemoveBackground = () => {
    if (!selectedElement || selectedElement.type !== 'image') return;
    setIsProcessing(true);
    alert('Simulando Remoção de Fundo via Inteligência Artificial (Pronto para conectar API real)...');
    setTimeout(() => {
      updateElement(selectedElement.id, { isBackgroundRemoved: true, glow: '0 0 20px rgba(255, 45, 141, 0.5)' });
      setIsProcessing(false);
    }, 1500);
  };

  const handleIAVariation = () => {
    if (!selectedElement || selectedElement.type !== 'image') return;
    setIsProcessing(true);
    alert('Simulando Geração de Variação por IA...');
    setTimeout(() => {
      // update image content with a new AI generated visual variation
      updateElement(selectedElement.id, { 
        content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'
      });
      setIsProcessing(false);
    }, 1500);
  };

  const addOverlay = () => {
    const imageElements = elements.filter(e => e.type === 'image');
    const maxImageZ = imageElements.length > 0 ? Math.max(...imageElements.map(e => e.zIndex)) : 0;
    
    elements.forEach(el => {
      if (el.type === 'text' && el.zIndex > maxImageZ) {
        updateElement(el.id, { zIndex: el.zIndex + 1 });
      }
    });

    const newEl: EditorElement = {
      id: 'overlay-' + Math.random().toString(36).substr(2, 9),
      type: 'shape',
      content: 'square',
      x: 0,
      y: 0,
      width: canvasFormat.width,
      height: canvasFormat.height,
      rotation: 0,
      opacity: 40,
      zIndex: maxImageZ + 1,
      color: '#000000',
    };
    updateCurrentSlide({ elements: [...elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const moveLayerUp = (id: string) => {
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = sorted.findIndex(el => el.id === id);
    if (index === -1 || index === sorted.length - 1) return;
    
    const currentEl = sorted[index];
    const nextEl = sorted[index + 1];
    const tempZ = currentEl.zIndex;
    
    updateElement(currentEl.id, { zIndex: nextEl.zIndex });
    updateElement(nextEl.id, { zIndex: tempZ });
  };

  const moveLayerDown = (id: string) => {
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = sorted.findIndex(el => el.id === id);
    if (index === -1 || index === 0) return;
    
    const currentEl = sorted[index];
    const prevEl = sorted[index - 1];
    const tempZ = currentEl.zIndex;
    
    updateElement(currentEl.id, { zIndex: prevEl.zIndex });
    updateElement(prevEl.id, { zIndex: tempZ });
  };

  const bringToFront = (id: string) => {
    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    updateElement(id, { zIndex: maxZ + 1 });
  };

  const sendToBack = (id: string) => {
    const minZ = elements.length > 0 ? Math.min(...elements.map(e => e.zIndex)) : 0;
    updateElement(id, { zIndex: minZ - 1 });
  };

  const addBasicElement = (type: string) => {
    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    const colors = activeBrandKit?.colors && activeBrandKit.colors.length >= 3 
      ? activeBrandKit.colors 
      : ['#FF2D8D', '#7B4DFF', '#00E0FF', '#ffffff', '#111118', '#07070A'];
    
    const primary = colors[0];
    const secondary = colors[1];
    const accent = colors[2] || '#00E0FF';
    
    let newEl: EditorElement | null = null;
    let extraEl: EditorElement | null = null;

    if (type === 'rect') {
      newEl = {
        id: 'rect-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 150,
        y: (canvasFormat.height / 2) - 75,
        width: 300,
        height: 150,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: primary,
      };
    } else if (type === 'square') {
      newEl = {
        id: 'square-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 100,
        y: (canvasFormat.height / 2) - 100,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: primary,
      };
    } else if (type === 'circle') {
      newEl = {
        id: 'circle-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'circle',
        x: (canvasFormat.width / 2) - 100,
        y: (canvasFormat.height / 2) - 100,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: primary,
      };
    } else if (type === 'gradient') {
      newEl = {
        id: 'gradient-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 200,
        y: (canvasFormat.height / 2) - 100,
        width: 400,
        height: 200,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: primary,
        backgroundStyle: `linear-gradient(135deg, ${primary}, ${secondary})`,
      };
    } else if (type === 'glow') {
      newEl = {
        id: 'glow-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'circle',
        x: (canvasFormat.width / 2) - 150,
        y: (canvasFormat.height / 2) - 150,
        width: 300,
        height: 300,
        rotation: 0,
        opacity: 35,
        zIndex: maxZ + 1,
        color: primary,
        glow: `0 0 50px ${primary}`,
      };
    } else if (type === 'glassmorphism') {
      newEl = {
        id: 'glass-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 175,
        y: (canvasFormat.height / 2) - 125,
        width: 350,
        height: 250,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        borderStyle: '1px solid rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(16px)',
      };
    } else if (type === 'top_bar') {
      newEl = {
        id: 'top-bar-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: 0,
        y: 0,
        width: canvasFormat.width,
        height: 120,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: '#111118',
      };
    } else if (type === 'bottom_bar') {
      newEl = {
        id: 'bottom-bar-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: 0,
        y: canvasFormat.height - 120,
        width: canvasFormat.width,
        height: 120,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: '#111118',
      };
    } else if (type === 'textbox') {
      newEl = {
        id: 'textbox-' + Math.random().toString(36).substr(2, 9),
        type: 'text',
        content: 'Escreva seu texto aqui...',
        x: (canvasFormat.width / 2) - 200,
        y: (canvasFormat.height / 2) - 50,
        width: 400,
        height: 100,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Outfit',
        fontWeight: 400,
        textAlign: 'center',
      };
    } else if (type === 'cta_button') {
      newEl = {
        id: 'cta-btn-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 150,
        y: (canvasFormat.height / 2) - 35,
        width: 300,
        height: 70,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: primary,
        borderRadius: 35, // rounded pill
      };
      extraEl = {
        id: 'cta-text-' + Math.random().toString(36).substr(2, 9),
        type: 'text',
        content: 'CLIQUE AQUI',
        x: (canvasFormat.width / 2) - 150,
        y: (canvasFormat.height / 2) - 14,
        width: 300,
        height: 40,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 2,
        fontSize: 20,
        color: '#ffffff',
        fontFamily: 'Outfit',
        fontWeight: 800,
        textAlign: 'center',
        isUppercase: true,
      };
    } else if (type === 'selo') {
      newEl = {
        id: 'selo-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'circle',
        x: (canvasFormat.width / 2) - 60,
        y: (canvasFormat.height / 2) - 60,
        width: 120,
        height: 120,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: secondary,
      };
    } else if (type === 'price_tag') {
      newEl = {
        id: 'tag-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 80,
        y: (canvasFormat.height / 2) - 25,
        width: 160,
        height: 50,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: accent,
        borderRadius: 8,
      };
      extraEl = {
        id: 'tag-text-' + Math.random().toString(36).substr(2, 9),
        type: 'text',
        content: 'R$ 97,90',
        x: (canvasFormat.width / 2) - 80,
        y: (canvasFormat.height / 2) - 12,
        width: 160,
        height: 35,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 2,
        fontSize: 18,
        color: '#07070A',
        fontFamily: 'Outfit',
        fontWeight: 800,
        textAlign: 'center',
      };
    } else if (type === 'moldura') {
      newEl = {
        id: 'moldura-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: 40,
        y: 40,
        width: canvasFormat.width - 80,
        height: canvasFormat.height - 80,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: 'transparent',
        borderStyle: `3px solid ${primary}`,
      };
    } else if (type === 'card_premium') {
      newEl = {
        id: 'card-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 200,
        y: (canvasFormat.height / 2) - 150,
        width: 400,
        height: 300,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: '#11111E',
        borderRadius: 16,
        glow: '0 20px 40px rgba(0,0,0,0.5)',
      };
    } else if (type === 'neon') {
      newEl = {
        id: 'neon-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 100,
        y: (canvasFormat.height / 2) - 100,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: 'transparent',
        borderStyle: `2px solid ${primary}`,
        glow: `0 0 15px ${primary}`,
      };
    } else if (type === 'linha') {
      newEl = {
        id: 'line-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 200,
        y: (canvasFormat.height / 2) - 2,
        width: 400,
        height: 4,
        rotation: 0,
        opacity: 50,
        zIndex: maxZ + 1,
        color: primary,
      };
    } else if (type === 'sombra') {
      newEl = {
        id: 'shadow-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: 0,
        y: 0,
        width: canvasFormat.width,
        height: canvasFormat.height,
        rotation: 0,
        opacity: 45,
        zIndex: maxZ + 1,
        color: 'transparent',
        backgroundStyle: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.85))',
      };
    } else if (type === 'blur_layer') {
      newEl = {
        id: 'blur-' + Math.random().toString(36).substr(2, 9),
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 150,
        y: (canvasFormat.height / 2) - 150,
        width: 300,
        height: 300,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: 'rgba(255,255,255,0.01)',
        backdropFilter: 'blur(30px)',
      };
    }

    if (newEl) {
      if (extraEl) {
        updateCurrentSlide({ elements: [...elements, newEl, extraEl] });
        setSelectedElementId(extraEl.id);
      } else {
        updateCurrentSlide({ elements: [...elements, newEl] });
        setSelectedElementId(newEl.id);
      }
    }
  };

  const addTextPreset = (preset: string) => {
    const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
    const colors = activeBrandKit?.colors && activeBrandKit.colors.length >= 3 
      ? activeBrandKit.colors 
      : ['#FF2D8D', '#7B4DFF', '#00E0FF', '#ffffff', '#111118', '#07070A'];
    
    const primary = colors[0];
    const secondary = colors[1];
    const accent = colors[2] || '#00E0FF';
    
    if (preset === 'white_shadow') {
      const newEl: EditorElement = {
        id: 'text-preset-' + Math.random().toString(36).substr(2, 9),
        type: 'text',
        content: 'TEXTO COM SOMBRA',
        x: (canvasFormat.width / 2) - 250,
        y: (canvasFormat.height / 2) - 50,
        width: 500,
        height: 100,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        fontSize: 48,
        color: '#ffffff',
        fontFamily: 'Outfit',
        fontWeight: 800,
        textAlign: 'center',
        shadowEnabled: true,
        shadowColor: '#000000',
        shadowBlur: 15,
        shadowOffsetX: 0,
        shadowOffsetY: 6,
        shadowOpacity: 60,
      };
      updateCurrentSlide({ elements: [...elements, newEl] });
      setSelectedElementId(newEl.id);
    } else if (preset === 'dark_box') {
      const boxId = 'box-' + Math.random().toString(36).substr(2, 9);
      const textId = 'text-' + Math.random().toString(36).substr(2, 9);
      
      const boxEl: EditorElement = {
        id: boxId,
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 220,
        y: (canvasFormat.height / 2) - 60,
        width: 440,
        height: 120,
        rotation: 0,
        opacity: 75,
        zIndex: maxZ + 1,
        color: '#111118',
        borderRadius: 8,
      };

      const textEl: EditorElement = {
        id: textId,
        type: 'text',
        content: 'TEXTO COM CAIXA',
        x: (canvasFormat.width / 2) - 200,
        y: (canvasFormat.height / 2) - 25,
        width: 400,
        height: 80,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 2,
        fontSize: 32,
        color: '#ffffff',
        fontFamily: 'Outfit',
        fontWeight: 700,
        textAlign: 'center',
      };

      updateCurrentSlide({ elements: [...elements, boxEl, textEl] });
      setSelectedElementId(textEl.id);
    } else if (preset === 'glow') {
      const newEl: EditorElement = {
        id: 'text-preset-' + Math.random().toString(36).substr(2, 9),
        type: 'text',
        content: 'TEXTO BRILHANTE',
        x: (canvasFormat.width / 2) - 250,
        y: (canvasFormat.height / 2) - 50,
        width: 500,
        height: 100,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        fontSize: 48,
        color: '#ffffff',
        fontFamily: 'Outfit',
        fontWeight: 800,
        textAlign: 'center',
        shadowEnabled: true,
        shadowColor: primary,
        shadowBlur: 25,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowOpacity: 100,
      };
      updateCurrentSlide({ elements: [...elements, newEl] });
      setSelectedElementId(newEl.id);
    } else if (preset === 'title_center') {
      const newEl: EditorElement = {
        id: 'text-preset-' + Math.random().toString(36).substr(2, 9),
        type: 'text',
        content: 'TÍTULO CENTRAL',
        x: (canvasFormat.width / 2) - 300,
        y: (canvasFormat.height / 2) - 50,
        width: 600,
        height: 100,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        fontSize: 64,
        color: '#ffffff',
        fontFamily: 'Outfit',
        fontWeight: 800,
        textAlign: 'center',
      };
      updateCurrentSlide({ elements: [...elements, newEl] });
      setSelectedElementId(newEl.id);
    } else if (preset === 'title_bottom') {
      const newEl: EditorElement = {
        id: 'text-preset-' + Math.random().toString(36).substr(2, 9),
        type: 'text',
        content: 'TÍTULO INFERIOR',
        x: (canvasFormat.width / 2) - 300,
        y: canvasFormat.height - 200,
        width: 600,
        height: 100,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        fontSize: 48,
        color: '#ffffff',
        fontFamily: 'Outfit',
        fontWeight: 800,
        textAlign: 'center',
      };
      updateCurrentSlide({ elements: [...elements, newEl] });
      setSelectedElementId(newEl.id);
    } else if (preset === 'cta_bottom') {
      const btnId = 'btn-' + Math.random().toString(36).substr(2, 9);
      const textId = 'text-' + Math.random().toString(36).substr(2, 9);
      
      const btnEl: EditorElement = {
        id: btnId,
        type: 'shape',
        content: 'square',
        x: (canvasFormat.width / 2) - 200,
        y: canvasFormat.height - 130,
        width: 400,
        height: 64,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 1,
        color: secondary,
        borderRadius: 32,
      };

      const textEl: EditorElement = {
        id: textId,
        type: 'text',
        content: 'SAIBA MAIS NO LINK',
        x: (canvasFormat.width / 2) - 200,
        y: canvasFormat.height - 110,
        width: 400,
        height: 32,
        rotation: 0,
        opacity: 100,
        zIndex: maxZ + 2,
        fontSize: 18,
        color: '#ffffff',
        fontFamily: 'Outfit',
        fontWeight: 800,
        textAlign: 'center',
        isUppercase: true,
      };

      updateCurrentSlide({ elements: [...elements, btnEl, textEl] });
      setSelectedElementId(textEl.id);
    }
  };

  const applyTemplate = (templateId: string) => {
    const tpl = TEMPLATES_DATA[templateId];
    if (!tpl) return;
    
    const W = canvasFormat.width;
    const H = canvasFormat.height;
    // Designed for 1080x1080
    const scaleX = W / 1080;
    const scaleY = H / 1080;
    let newBg = { ...tpl.background };
    let newElements = tpl.elements.map((el: any) => {
      // Scale dynamically to fit canvas size
      const mappedX = Math.round(el.x * scaleX);
      const mappedY = Math.round(el.y * scaleY);
      const mappedW = Math.round(el.width * scaleX);
      const mappedH = el.type === 'text' ? el.height : Math.round(el.height * scaleY);
      
      return {
        ...el,
        id: `${el.id}-${Math.random().toString(36).substr(2, 9)}`,
        x: mappedX,
        y: mappedY,
        width: mappedW,
        height: mappedH,
        borderRadius: el.borderRadius ? Math.round(el.borderRadius * Math.min(scaleX, scaleY)) : undefined,
        shadowEnabled: tpl.shadow,
        glow: tpl.glow ? '0 0 25px rgba(255, 47, 191, 0.45)' : undefined,
      };
    });

    // Auto-Brand Apply
    const isAutoBrand = localStorage.getItem('pink_logic_auto_brand') === 'true';
    if (isAutoBrand && activeBrandKit) {
      // 1. Sincronizar cores no background
      if (newBg.type === 'gradient') {
        newBg.color1 = activeBrandKit.palette?.primary || activeBrandKit.colors?.[0] || newBg.color1 || '#FF2D8D';
        newBg.color2 = activeBrandKit.palette?.secondary || activeBrandKit.colors?.[1] || newBg.color2 || '#7000FF';
      } else if (newBg.type === 'color') {
        newBg.value = activeBrandKit.palette?.background || activeBrandKit.palette?.primary || activeBrandKit.colors?.[0] || newBg.value || '#0d0d12';
      }

      // 2. Sincronizar cores nos elementos e fontes nos textos
      newElements = newElements.map((el: any) => {
        const updated = { ...el };
        if (el.type === 'shape') {
          if (updated.content.startsWith('#') || updated.content.startsWith('rgb')) {
            updated.content = activeBrandKit.palette?.primary || activeBrandKit.colors?.[0] || updated.content;
          }
          if (updated.glow) {
            updated.glow = activeBrandKit.palette?.primary || activeBrandKit.colors?.[0];
          }
        } else if (el.type === 'text') {
          const isHeading = (el.fontSize && el.fontSize >= 24) || el.id.includes('title') || el.fontWeight === 'bold' || el.fontWeight === 800;
          updated.fontFamily = isHeading ? (activeBrandKit.typography?.heading || 'Outfit') : (activeBrandKit.typography?.body || 'Inter');
          if (isHeading) {
            updated.color = activeBrandKit.palette?.primary || activeBrandKit.colors?.[0] || updated.color;
          } else {
            updated.color = activeBrandKit.palette?.text || activeBrandKit.colors?.[2] || updated.color;
          }
        }
        return updated;
      });
    }

    if (activeBrandKit?.logo) {
      const logoIndex = newElements.findIndex((el: any) => el.id.includes('logo') || el.type === 'image' && el.content.includes('logo'));
      if (logoIndex !== -1) {
        newElements[logoIndex].content = activeBrandKit.logo;
      } else {
        const maxZ = newElements.length > 0 ? Math.max(...newElements.map((e: any) => e.zIndex)) : 0;
        newElements.push({
          id: 'logo-' + Math.random().toString(36).substr(2, 9),
          type: 'image',
          content: activeBrandKit.logo,
          x: 40,
          y: 40,
          width: 120,
          height: 120,
          rotation: 0,
          opacity: 100,
          zIndex: maxZ + 1,
          borderRadius: 0,
          objectFit: 'contain',
        });
      }
    }
    
    updateCurrentSlide({ background: newBg, elements: newElements });
    setSelectedElementId(null);
  };

  const applyBrandKitToSlide = (kit: any) => {
    if (!kit) return;
    
    // 1. Sincronizar cores no background
    const newBg = { ...background };
    if (newBg.type === 'gradient') {
      newBg.color1 = kit.palette?.primary || kit.colors?.[0] || newBg.color1 || '#FF2D8D';
      newBg.color2 = kit.palette?.secondary || kit.colors?.[1] || newBg.color2 || '#7000FF';
    } else if (newBg.type === 'color') {
      newBg.value = kit.palette?.background || kit.palette?.primary || kit.colors?.[0] || newBg.value || '#0d0d12';
    }

    // 2. Sincronizar cores nos elementos e fontes nos textos
    const newElements = elements.map(el => {
      const updated = { ...el };
      if (el.type === 'shape') {
        if (updated.content.startsWith('#') || updated.content.startsWith('rgb')) {
          updated.content = kit.palette?.primary || kit.colors?.[0] || updated.content;
        }
        if (updated.glow) {
          updated.glow = kit.palette?.primary || kit.colors?.[0];
        }
      } else if (el.type === 'text') {
        const isHeading = (el.fontSize && el.fontSize >= 24) || el.id.includes('title') || el.fontWeight === 'bold' || el.fontWeight === 800;
        updated.fontFamily = isHeading ? (kit.typography?.heading || 'Outfit') : (kit.typography?.body || 'Inter');
        if (isHeading) {
          updated.color = kit.palette?.primary || kit.colors?.[0] || updated.color;
        } else {
          updated.color = kit.palette?.text || kit.colors?.[2] || updated.color;
        }
      }
      return updated;
    });

    // 3. Inserir ou atualizar automaticamente o logotipo da marca na arte atual (se houver logo no kit)
    if (kit.logo) {
      const logoIndex = newElements.findIndex(el => el.type === 'image' && (el.id.includes('logo') || el.content === kit.logo));
      if (logoIndex !== -1) {
        newElements[logoIndex] = {
          ...newElements[logoIndex],
          content: kit.logo,
          isHidden: false,
        };
      } else {
        const maxZ = newElements.length > 0 ? Math.max(...newElements.map(e => e.zIndex)) : 0;
        const newLogoEl: EditorElement = {
          id: 'logo-' + Math.random().toString(36).substr(2, 9),
          type: 'image',
          content: kit.logo,
          x: 40,
          y: 40,
          width: 120,
          height: 120,
          rotation: 0,
          opacity: 100,
          zIndex: maxZ + 1,
          borderRadius: 0,
          objectFit: 'contain',
        };
        newElements.push(newLogoEl);
      }
    }

    updateCurrentSlide({ background: newBg, elements: newElements });
  };

  const getCarouselSteps = (topic: string, count: number): { title: string, desc: string }[] => {
    const normalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    const stepsData: Record<string, { title: string, desc: string }[]> = {
      marketing: [
        { title: "Defina sua Persona", desc: "Antes de vender, você precisa conhecer detalhadamente com quem está falando." },
        { title: "Crie Conteúdo Útil", desc: "Produza conteúdo que resolva um problema real e imediato da sua audiência." },
        { title: "Construa uma Oferta", desc: "Seu produto ou serviço deve parecer irresistível frente aos benefícios." },
        { title: "Escolha os Canais", desc: "Esteja presente nas redes onde seu público passa a maior parte do tempo." },
        { title: "Monitore Métricas", desc: "Analise o engajamento, taxas de clique e conversão para otimizar." },
        { title: "Automação de Vendas", desc: "Crie funis automáticos para nutrir leads e fechar negócios 24 horas por dia." },
        { title: "Overdelivery", desc: "Entregue mais valor do que o cliente espera para fidelizar e reter." },
        { title: "Escala", desc: "Reinvista os lucros em tráfego pago para alcançar novos públicos." }
      ],
      fitness: [
        { title: "Defina sua Meta", desc: "Seja emagrecimento, hipertrofia ou saúde, tenha um objetivo claro." },
        { title: "Treino Consistente", desc: "A regularidade nos treinos é muito mais importante do que a intensidade isolada." },
        { title: "Nutrição Equilibrada", desc: "Alimente seu corpo com os nutrientes certos para acelerar a recuperação." },
        { title: "Descanse Adequadamente", desc: "O sono de qualidade é onde os músculos realmente crescem e se recuperam." },
        { title: "Beba Água", desc: "Manter a hidratação adequada melhora o rendimento físico e a digestão." },
        { title: "Acompanhe Evolução", desc: "Tire fotos, medidas e anote as cargas para ver o progresso real." },
        { title: "Mentalidade Forte", desc: "Haverá dias sem motivação, mas a disciplina garantirá seus resultados." },
        { title: "Ajustes Constantes", desc: "Periodize seus treinos a cada 4 a 6 semanas para evitar estagnação." }
      ],
      negocios: [
        { title: "Estudo de Mercado", desc: "Analise os concorrentes e identifique oportunidades inexploradas no setor." },
        { title: "Validação da Ideia", desc: "Teste seu produto mínimo viável (MVP) com clientes reais antes de escalar." },
        { title: "Planejamento Financeiro", desc: "Controle seu fluxo de caixa e tenha clareza do ponto de equilíbrio." },
        { title: "Atração de Clientes", desc: "Crie canais eficientes e replicáveis de marketing para gerar vendas constantes." },
        { title: "Processos Claros", desc: "Documente as tarefas diárias para que a equipe execute com padronização." },
        { title: "Gestão de Pessoas", desc: "Contrate pelos valores da empresa e treine pelas competências técnicas." },
        { title: "Inovação Contínua", desc: "Fique atento às mudanças de mercado para evoluir seu produto." },
        { title: "Escalabilidade", desc: "Construa um modelo que cresça sem aumentar os custos na mesma proporção." }
      ],
      generic: [
        { title: `Entenda o Cenário de ${normalizedTopic}`, desc: `Estude o estado atual de ${normalizedTopic} para identificar gargalos e pontos de melhoria.` },
        { title: `Planejamento de Ação`, desc: `Trace um plano estruturado focado no desenvolvimento de ${normalizedTopic} no seu dia a dia.` },
        { title: `Prática Consistente`, desc: `A execução diária de pequenas tarefas relacionadas a ${normalizedTopic} consolida o aprendizado.` },
        { title: `Otimização de Resultados`, desc: `Analise o que funcionou e o que falhou na sua abordagem sobre ${normalizedTopic}.` },
        { title: `Foque em Feedback`, desc: `Peça conselhos e observe como os outros reagem às suas práticas de ${normalizedTopic}.` },
        { title: `Gere Parcerias`, desc: `Conecte-se com pessoas da área de ${normalizedTopic} para expandir sua rede de contatos.` },
        { title: `Celebre Conquistas`, desc: `Reconheça o progresso alcançado em ${normalizedTopic}, mantendo a motivação em alta.` },
        { title: `Evolução Contínua`, desc: `Nunca pare de aprender; o universo de ${normalizedTopic} está em constante transformação.` }
      ]
    };

    const lowerTopic = topic.toLowerCase();
    let selected = stepsData.generic;
    if (lowerTopic.includes("fit") || lowerTopic.includes("saud") || lowerTopic.includes("trein") || lowerTopic.includes("dieta") || lowerTopic.includes("corpo") || lowerTopic.includes("academia")) {
      selected = stepsData.fitness;
    } else if (lowerTopic.includes("negoc") || lowerTopic.includes("empresa") || lowerTopic.includes("financ") || lowerTopic.includes("venda") || lowerTopic.includes("dinheir") || lowerTopic.includes("invest")) {
      selected = stepsData.negocios;
    } else if (lowerTopic.includes("marketing") || lowerTopic.includes("social") || lowerTopic.includes("divulg") || lowerTopic.includes("anunc") || lowerTopic.includes("public")) {
      selected = stepsData.marketing;
    }

    const result: { title: string, desc: string }[] = [];
    for (let i = 0; i < count; i++) {
      const stepIdx = i % selected.length;
      const stepNum = i + 1;
      result.push({
        title: `${stepNum}. ${selected[stepIdx].title}`,
        desc: selected[stepIdx].desc
      });
    }
    return result;
  };

  const handleGenerateAI = () => {
    // Check if the current slides are not default, and if so, confirm overwrite
    const isDefault = slides.length === 1 && 
      slides[0].elements.length === 4 && 
      slides[0].elements[0].content === 'PinkLogic' &&
      slides[0].elements[1].content === 'A revolução visual com inteligência artificial para o seu negócio.';
      
    if (!isDefault && (slides.length > 1 || (slides[0] && slides[0].elements.length > 0))) {
      const confirm = window.confirm("Deseja gerar um novo design com a Inteligência Artificial? Seus slides e conteúdos atuais serão substituídos.");
      if (!confirm) return;
    }

    setIsProcessing(true);
    setShowAIModal(false);
    
    setTimeout(() => {
      const promptText = (aiInputs.topic || aiInputs.niche || '').toLowerCase();
      
      // Match template ID based on keywords
      let templateId = 'dark-infoproduto';
      if (promptText.includes('beleza') || promptText.includes('maquiagem') || promptText.includes('estética') || promptText.includes('beauty') || promptText.includes('skin') || promptText.includes('cabelo')) {
        templateId = 'beauty-premium';
      } else if (promptText.includes('tech') || promptText.includes('tecnologia') || promptText.includes('ia') || promptText.includes('ai') || promptText.includes('software') || promptText.includes('programação')) {
        templateId = 'tech-neon';
      } else if (promptText.includes('black') || promptText.includes('friday') || promptText.includes('desconto') || promptText.includes('promo') || promptText.includes('liquidação')) {
        templateId = 'black-friday';
      } else if (promptText.includes('drop') || promptText.includes('loja') || promptText.includes('venda') || promptText.includes('produto') || promptText.includes('anúncio')) {
        templateId = 'dropshipping-dark';
      } else if (promptText.includes('ebook') || promptText.includes('livro') || promptText.includes('guia') || promptText.includes('pdf') || promptText.includes('digital')) {
        templateId = 'ebook-premium';
      } else if (promptText.includes('coach') || promptText.includes('mulher') || promptText.includes('feminina') || promptText.includes('carreira') || promptText.includes('vida')) {
        templateId = 'coach-feminina';
      } else if (promptText.includes('lux') || promptText.includes('gold') || promptText.includes('ouro') || promptText.includes('premium') || promptText.includes('grife')) {
        templateId = 'luxury-gold';
      } else if (promptText.includes('viral') || promptText.includes('instagram') || promptText.includes('feed') || promptText.includes('dica')) {
        templateId = 'instagram-viral';
      } else if (promptText.includes('neon') || promptText.includes('balada') || promptText.includes('brilho') || promptText.includes('festa')) {
        templateId = 'story-neon';
      } else if (promptText.includes('clean') || promptText.includes('minimal') || promptText.includes('simples')) {
        templateId = 'minimal-clean';
      } else if (promptText.includes('link') || promptText.includes('cta') || promptText.includes('story') || promptText.includes('bio')) {
        templateId = 'cta-story';
      }

      // Load matching template base composition
      const tpl = TEMPLATES_DATA[templateId] || TEMPLATES_DATA['dark-infoproduto'];
      const W = canvasFormat.width;
      const H = canvasFormat.height;
      const scaleX = W / 1080;
      const scaleY = H / 1080;

      // Copywriting generator based on prompt topic
      const topicName = aiInputs.topic || aiInputs.niche || 'Seu Negócio';
      let titleCopy = `MÉTODO ${topicName.toUpperCase()}`;
      let subtitleCopy = `Como acelerar seus resultados e se destacar no mercado digital hoje.`;
      let ctaCopy = `QUERO ACESSAR AGORA`;

      if (templateId === 'beauty-premium') {
        titleCopy = `Sua Beleza Autêntica`;
        subtitleCopy = `Descubra cuidados e tratamentos personalizados para o nicho de ${topicName}.`;
        ctaCopy = `AGENDAR AVALIAÇÃO`;
      } else if (templateId === 'tech-neon') {
        titleCopy = `REVOLUÇÃO TECH: ${topicName.toUpperCase()}`;
        subtitleCopy = `Implemente automação e sistemas com IA de alta performance no seu negócio.`;
        ctaCopy = `INICIAR INTEGRAÇÃO ➔`;
      } else if (templateId === 'black-friday') {
        titleCopy = `BLACK FRIDAY: ${topicName.toUpperCase()}`;
        subtitleCopy = `Toda a nossa linha de produtos com condições insanas. Últimas unidades!`;
        ctaCopy = `APROVEITAR DESCONTO`;
      } else if (templateId === 'dropshipping-dark') {
        titleCopy = `${topicName.toUpperCase()} COM 50% OFF`;
        subtitleCopy = `Garanta frete grátis e entrega rápida monitorada em todo o país.`;
        ctaCopy = `COMPRAR COM DESCONTO`;
      } else if (templateId === 'ebook-premium') {
        titleCopy = `Guia Definitivo de ${topicName}`;
        subtitleCopy = `O livro digital que ensina os bastidores da escala e performance profissional.`;
        ctaCopy = `BAIXAR EBOOK GRATUITO`;
      } else if (templateId === 'coach-feminina') {
        titleCopy = `Evolução & Propósito`;
        subtitleCopy = `Mentoria focada no desenvolvimento e inteligência emocional em ${topicName}.`;
        ctaCopy = `APLICAR PARA VAGA`;
      } else if (templateId === 'luxury-gold') {
        titleCopy = `O Estilo de ${topicName}`;
        subtitleCopy = `Sofisticação, exclusividade e os mais finos detalhes desenhados sob medida.`;
        ctaCopy = `CONHECER COLEÇÃO`;
      } else if (templateId === 'instagram-viral') {
        titleCopy = `3 REGRAS DE OURO DE ${topicName.toUpperCase()}`;
        subtitleCopy = `Arraste para o lado e entenda o hack de crescimento que ninguém te conta.`;
        ctaCopy = `SALVAR ESTE POST`;
      }

      // Apply to elements
      const newElements = tpl.elements.map((el: any) => {
        let content = el.content;
        // Replace text contents of template dynamically
        if (el.id.includes('title')) {
          content = titleCopy;
        } else if (el.id.includes('desc') || el.id.includes('sub') || el.id.includes('card-text') || el.id.includes('step')) {
          content = subtitleCopy;
        } else if (el.id.includes('btn-txt') || el.id.includes('badge-txt')) {
          if (el.id.includes('btn-txt')) content = ctaCopy;
        }
        
        return {
          ...el,
          id: `${el.id}-${Math.random().toString(36).substr(2, 9)}`,
          content: content,
          x: Math.round(el.x * scaleX),
          y: Math.round(el.y * scaleY),
          width: Math.round(el.width * scaleX),
          height: el.type === 'text' ? el.height : Math.round(el.height * scaleY),
          borderRadius: el.borderRadius ? Math.round(el.borderRadius * Math.min(scaleX, scaleY)) : undefined,
          shadowEnabled: tpl.shadow,
          glow: tpl.glow ? '0 0 20px rgba(255, 45, 141, 0.45)' : undefined,
        };
      });

      if (activeBrandKit?.logo) {
        const logoIndex = newElements.findIndex((el: any) => el.id.includes('logo') || el.type === 'image' && el.content.includes('logo'));
        if (logoIndex !== -1) {
          newElements[logoIndex].content = activeBrandKit.logo;
        } else {
          const maxZ = newElements.length > 0 ? Math.max(...newElements.map((e: any) => e.zIndex)) : 0;
          newElements.push({
            id: 'logo-' + Math.random().toString(36).substr(2, 9),
            type: 'image',
            content: activeBrandKit.logo,
            x: 40,
            y: 40,
            width: 120,
            height: 120,
            rotation: 0,
            opacity: 100,
            zIndex: maxZ + 1,
            borderRadius: 0,
            objectFit: 'contain',
          });
        }
      }

      // Auto-Brand Apply
      let finalBg = { ...tpl.background };
      let finalElements = [...newElements];
      const isAutoBrand = localStorage.getItem('pink_logic_auto_brand') === 'true';
      if (isAutoBrand && activeBrandKit) {
        if (finalBg.type === 'gradient') {
          finalBg.color1 = activeBrandKit.palette?.primary || activeBrandKit.colors?.[0] || finalBg.color1 || '#FF2D8D';
          finalBg.color2 = activeBrandKit.palette?.secondary || activeBrandKit.colors?.[1] || finalBg.color2 || '#7000FF';
        } else if (finalBg.type === 'color') {
          finalBg.value = activeBrandKit.palette?.background || activeBrandKit.palette?.primary || activeBrandKit.colors?.[0] || finalBg.value || '#0d0d12';
        }

        finalElements = finalElements.map((el: any) => {
          const updated = { ...el };
          if (el.type === 'shape') {
            if (updated.content.startsWith('#') || updated.content.startsWith('rgb')) {
              updated.content = activeBrandKit.palette?.primary || activeBrandKit.colors?.[0] || updated.content;
            }
            if (updated.glow) {
              updated.glow = activeBrandKit.palette?.primary || activeBrandKit.colors?.[0];
            }
          } else if (el.type === 'text') {
            const isHeading = (el.fontSize && el.fontSize >= 24) || el.id.includes('title') || el.fontWeight === 'bold' || el.fontWeight === 800;
            updated.fontFamily = isHeading ? (activeBrandKit.typography?.heading || 'Outfit') : (activeBrandKit.typography?.body || 'Inter');
            if (isHeading) {
              updated.color = activeBrandKit.palette?.primary || activeBrandKit.colors?.[0] || updated.color;
            } else {
              updated.color = activeBrandKit.palette?.text || activeBrandKit.colors?.[2] || updated.color;
            }
          }
          return updated;
        });
      }

      const isCTAElement = (el: any) => {
        const lowerId = el.id.toLowerCase();
        return lowerId.includes('btn') || lowerId.includes('button') || lowerId.includes('cta');
      };

      const isTitleElement = (el: any) => {
        const lowerId = el.id.toLowerCase();
        return lowerId.includes('title') || lowerId.includes('headline');
      };

      const isDescElement = (el: any) => {
        const lowerId = el.id.toLowerCase();
        return lowerId.includes('desc') || lowerId.includes('sub') || lowerId.includes('card-text') || lowerId.includes('step');
      };

      if (canvasFormat.id === 'carousel') {
        const generatedSlides: Slide[] = [];
        const numSlides = slideCount;
        const steps = getCarouselSteps(topicName, numSlides - 2);

        for (let s = 0; s < numSlides; s++) {
          // Clone and map elements for unique IDs
          const slideElements = finalElements.map((el: any) => {
            const baseId = el.id.split('-')[0] || el.id;
            return {
              ...el,
              id: `${baseId}-${Math.random().toString(36).substr(2, 9)}`,
            };
          });

          // Filter and update content based on slide type
          let filteredElements = [];
          if (s === 0) {
            // Cover Slide
            filteredElements = slideElements.filter(el => !isCTAElement(el));
            filteredElements = filteredElements.map(el => {
              if (isTitleElement(el)) {
                return { ...el, content: titleCopy };
              }
              if (isDescElement(el)) {
                return { ...el, content: subtitleCopy };
              }
              return el;
            });
          } else if (s === numSlides - 1) {
            // CTA Slide
            filteredElements = slideElements.map(el => {
              if (isTitleElement(el)) {
                return { ...el, content: "Comece Hoje Mesmo!" };
              }
              if (isDescElement(el)) {
                return { ...el, content: "O próximo passo só depende de você. Clique no link para acelerar." };
              }
              if (el.id.includes('btn-txt')) {
                return { ...el, content: ctaCopy };
              }
              return el;
            });
          } else {
            // Intermediate step slides
            filteredElements = slideElements.filter(el => !isCTAElement(el));
            const stepIndex = s - 1;
            const currentStep = steps[stepIndex];
            filteredElements = filteredElements.map(el => {
              if (isTitleElement(el)) {
                return { ...el, content: currentStep.title };
              }
              if (isDescElement(el)) {
                return { ...el, content: currentStep.desc };
              }
              return el;
            });
          }

          generatedSlides.push({
            id: `slide-${s}-${Math.random().toString(36).substr(2, 9)}`,
            elements: filteredElements,
            background: JSON.parse(JSON.stringify(finalBg)),
          });
        }

        setSlides(generatedSlides);
        setCurrentSlideIndex(0);
      } else {
        // Non-carousel format: update the current active slide
        updateCurrentSlide({
          background: finalBg,
          elements: finalElements
        });
      }

      setSelectedElementId(null);
      setIsProcessing(false);
    }, 1500);
  };

  const drawSlideToCanvas = async (slide: Slide, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Background
    if (slide.background.type === 'color') {
      ctx.fillStyle = slide.background.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (slide.background.type === 'gradient') {
      const color1 = slide.background.color1 || '#FF2D8D';
      const color2 = slide.background.color2 || '#7000FF';
      const direction = slide.background.direction || 'tb';

      let grad;
      if (direction === 'lr') {
        grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      } else if (direction === 'diag') {
        grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      } else {
        grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      }
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (slide.background.type === 'image') {
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(null);
        };
        img.onerror = () => resolve(null);
        if (slide.background.value.startsWith('http')) {
          img.crossOrigin = 'anonymous';
        }
        img.src = slide.background.value;
      });
    }

    // Draw Elements (Sorted by Z-Index)
    const sortedElements = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);
    for (const el of sortedElements) {
      ctx.save();
      ctx.globalAlpha = el.opacity / 100;
      if (el.rotation) {
        ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-(el.x + el.width / 2), -(el.y + el.height / 2));
      }

      if (el.type === 'shape') {
        if (el.shadowEnabled) {
          const opacity = el.shadowOpacity ?? 25;
          const color = el.shadowColor ?? '#000000';
          let r = 0, g = 0, b = 0;
          if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            if (hex.length === 3) {
              r = parseInt(hex[0] + hex[0], 16);
              g = parseInt(hex[1] + hex[1], 16);
              b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length === 6) {
              r = parseInt(hex.substring(0, 2), 16);
              g = parseInt(hex.substring(2, 4), 16);
              b = parseInt(hex.substring(4, 6), 16);
            }
          }
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
          ctx.shadowBlur = el.shadowBlur ?? 20;
          ctx.shadowOffsetX = el.shadowOffsetX ?? 0;
          ctx.shadowOffsetY = el.shadowOffsetY ?? 8;
        }

        ctx.fillStyle = el.color || '#000';
        if (el.content === 'circle') {
          ctx.beginPath();
          ctx.arc(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          if (el.borderRadius && el.borderRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(el.x, el.y, el.width, el.height, el.borderRadius);
            ctx.fill();
          } else {
            ctx.fillRect(el.x, el.y, el.width, el.height);
          }
        }
      } else if (el.type === 'text') {
        if (el.shadowEnabled) {
          const opacity = el.shadowOpacity ?? 25;
          const color = el.shadowColor ?? '#000000';
          let r = 0, g = 0, b = 0;
          if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            if (hex.length === 3) {
              r = parseInt(hex[0] + hex[0], 16);
              g = parseInt(hex[1] + hex[1], 16);
              b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length === 6) {
              r = parseInt(hex.substring(0, 2), 16);
              g = parseInt(hex.substring(2, 4), 16);
              b = parseInt(hex.substring(4, 6), 16);
            }
          }
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
          ctx.shadowBlur = el.shadowBlur ?? 20;
          ctx.shadowOffsetX = el.shadowOffsetX ?? 0;
          ctx.shadowOffsetY = el.shadowOffsetY ?? 8;
        }

        ctx.fillStyle = el.color || '#fff';
        ctx.font = `${el.fontWeight || 400} ${el.fontSize || 16}px ${el.fontFamily || 'Outfit'}`;
        ctx.textBaseline = 'top';
        ctx.textAlign = el.textAlign || 'center';
        
        const content = el.isUppercase ? el.content.toUpperCase() : el.content;
        const lines = content.split('\n');
        const lineHeight = (el.lineHeight || 1.2) * (el.fontSize || 16);
        const letterSpacing = el.letterSpacing || 0;
        
        lines.forEach((line: string, index: number) => {
          const y = el.y + (index * lineHeight);
          
          if (letterSpacing === 0) {
            const x = el.textAlign === 'left' ? el.x : el.textAlign === 'right' ? el.x + el.width : el.x + el.width / 2;
            ctx.fillText(line, x, y);
          } else {
            let currentX = el.x;
            if (el.textAlign === 'center') {
              const totalWidth = ctx.measureText(line).width + (line.length - 1) * letterSpacing;
              currentX = el.x + (el.width - totalWidth) / 2;
            } else if (el.textAlign === 'right') {
              const totalWidth = ctx.measureText(line).width + (line.length - 1) * letterSpacing;
              currentX = el.x + el.width - totalWidth;
            }
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              ctx.fillText(char, currentX, y);
              currentX += ctx.measureText(char).width + letterSpacing;
            }
          }
        });
      } else if (el.type === 'image') {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            if (el.borderRadius && el.borderRadius > 0) {
              const r = Math.min(el.borderRadius, el.width / 2, el.height / 2);
              if (el.shadowEnabled) {
                ctx.save();
                const opacity = el.shadowOpacity ?? 25;
                const color = el.shadowColor ?? '#000000';
                let cr = 0, cg = 0, cb = 0;
                if (color.startsWith('#')) {
                  const hex = color.replace('#', '');
                  if (hex.length === 3) {
                    cr = parseInt(hex[0] + hex[0], 16);
                    cg = parseInt(hex[1] + hex[1], 16);
                    cb = parseInt(hex[2] + hex[2], 16);
                  } else if (hex.length === 6) {
                    cr = parseInt(hex.substring(0, 2), 16);
                    cg = parseInt(hex.substring(2, 4), 16);
                    cb = parseInt(hex.substring(4, 6), 16);
                  }
                }
                ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, ${opacity / 100})`;
                ctx.shadowBlur = el.shadowBlur ?? 20;
                ctx.shadowOffsetX = el.shadowOffsetX ?? 0;
                ctx.shadowOffsetY = el.shadowOffsetY ?? 8;
                
                ctx.beginPath();
                ctx.moveTo(el.x + r, el.y);
                ctx.lineTo(el.x + el.width - r, el.y);
                ctx.quadraticCurveTo(el.x + el.width, el.y, el.x + el.width, el.y + r);
                ctx.lineTo(el.x + el.width, el.y + el.height - r);
                ctx.quadraticCurveTo(el.x + el.width, el.y + el.height, el.x + el.width - r, el.y + el.height);
                ctx.lineTo(el.x + r, el.y + el.height);
                ctx.quadraticCurveTo(el.x, el.y + el.height, el.x, el.y + el.height - r);
                ctx.lineTo(el.x, el.y + r);
                ctx.quadraticCurveTo(el.x, el.y, el.x + r, el.y);
                ctx.closePath();
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.restore();
              }

              ctx.save();
              ctx.beginPath();
              ctx.moveTo(el.x + r, el.y);
              ctx.lineTo(el.x + el.width - r, el.y);
              ctx.quadraticCurveTo(el.x + el.width, el.y, el.x + el.width, el.y + r);
              ctx.lineTo(el.x + el.width, el.y + el.height - r);
              ctx.quadraticCurveTo(el.x + el.width, el.y + el.height, el.x + el.width - r, el.y + el.height);
              ctx.lineTo(el.x + r, el.y + el.height);
              ctx.quadraticCurveTo(el.x, el.y + el.height, el.x, el.y + el.height - r);
              ctx.lineTo(el.x, el.y + r);
              ctx.quadraticCurveTo(el.x, el.y, el.x + r, el.y);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(img, el.x, el.y, el.width, el.height);
              ctx.restore();
            } else {
              if (el.shadowEnabled) {
                const opacity = el.shadowOpacity ?? 25;
                const color = el.shadowColor ?? '#000000';
                let cr = 0, cg = 0, cb = 0;
                if (color.startsWith('#')) {
                  const hex = color.replace('#', '');
                  if (hex.length === 3) {
                    cr = parseInt(hex[0] + hex[0], 16);
                    cg = parseInt(hex[1] + hex[1], 16);
                    cb = parseInt(hex[2] + hex[2], 16);
                  } else if (hex.length === 6) {
                    cr = parseInt(hex.substring(0, 2), 16);
                    cg = parseInt(hex.substring(2, 4), 16);
                    cb = parseInt(hex.substring(4, 6), 16);
                  }
                }
                ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, ${opacity / 100})`;
                ctx.shadowBlur = el.shadowBlur ?? 20;
                ctx.shadowOffsetX = el.shadowOffsetX ?? 0;
                ctx.shadowOffsetY = el.shadowOffsetY ?? 8;
              }
              ctx.drawImage(img, el.x, el.y, el.width, el.height);
            }
            resolve(null);
          };
          img.onerror = () => resolve(null);
          if (el.content.startsWith('http')) {
            img.crossOrigin = 'anonymous';
          }
          img.src = el.content;
        });
      }
      ctx.restore();
    }
  };

  const handleExport = async (onlyActive: boolean = false) => {
    setIsProcessing(true);
    try {
      const slidesToExport = onlyActive 
        ? [{ slide: slides[currentSlideIndex], originalIndex: currentSlideIndex }] 
        : slides.map((s, idx) => ({ slide: s, originalIndex: idx }));

      for (let i = 0; i < slidesToExport.length; i++) {
        const { slide, originalIndex } = slidesToExport[i];
        const canvas = document.createElement('canvas');
        canvas.width = canvasFormat.width;
        canvas.height = canvasFormat.height;
        
        await drawSlideToCanvas(slide, canvas);

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `PinkLogic-${canvasFormat.name}-${originalIndex + 1}.png`;
        link.href = dataUrl;
        link.click();
        
        // Brief delay between downloads
        if (slidesToExport.length > 1) await new Promise(r => setTimeout(r, 500));
      }
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = async () => {
    setIsProcessing(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: canvasFormat.width > canvasFormat.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvasFormat.width, canvasFormat.height]
      });

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const canvas = document.createElement('canvas');
        canvas.width = canvasFormat.width;
        canvas.height = canvasFormat.height;
        await drawSlideToCanvas(slide, canvas);

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        if (i > 0) {
          pdf.addPage([canvasFormat.width, canvasFormat.height], canvasFormat.width > canvasFormat.height ? 'landscape' : 'portrait');
        }
        pdf.addImage(dataUrl, 'PNG', 0, 0, canvasFormat.width, canvasFormat.height);
      }

      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`pinklogic-carousel-${dateStr}.pdf`);
    } catch (err) {
      console.error('PDF Export failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportZip = async () => {
    setIsProcessing(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const canvas = document.createElement('canvas');
        canvas.width = canvasFormat.width;
        canvas.height = canvasFormat.height;
        await drawSlideToCanvas(slide, canvas);

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
        });

        if (blob) {
          zip.file(`slide-${i + 1}.png`, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `pinklogic-carousel-${dateStr}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP Export failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendToPublisher = async () => {
    setIsProcessing(true);
    try {
      const slide = slides[0];
      const canvas = document.createElement('canvas');
      canvas.width = canvasFormat.width;
      canvas.height = canvasFormat.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw Background
      if (slide.background.type === 'color') {
        ctx.fillStyle = slide.background.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (slide.background.type === 'gradient') {
        const color1 = slide.background.color1 || '#FF2D8D';
        const color2 = slide.background.color2 || '#7000FF';
        const direction = slide.background.direction || 'tb';

        let grad;
        if (direction === 'lr') {
          grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        } else if (direction === 'diag') {
          grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        } else {
          grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        }
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (slide.background.type === 'image') {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(null);
          };
          img.onerror = () => resolve(null);
          if (slide.background.value.startsWith('http')) {
            img.crossOrigin = 'anonymous';
          }
          img.src = slide.background.value;
        });
      }

      // Draw Elements (Sorted by Z-Index)
      const sortedElements = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);
      for (const el of sortedElements) {
        ctx.save();
        ctx.globalAlpha = el.opacity / 100;
        if (el.rotation) {
          ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
          ctx.rotate((el.rotation * Math.PI) / 180);
          ctx.translate(-(el.x + el.width / 2), -(el.y + el.height / 2));
        }

        if (el.type === 'shape') {
          if (el.shadowEnabled) {
            const opacity = el.shadowOpacity ?? 25;
            const color = el.shadowColor ?? '#000000';
            let r = 0, g = 0, b = 0;
            if (color.startsWith('#')) {
              const hex = color.replace('#', '');
              if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
              } else if (hex.length === 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
              }
            }
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
            ctx.shadowBlur = el.shadowBlur ?? 20;
            ctx.shadowOffsetX = el.shadowOffsetX ?? 0;
            ctx.shadowOffsetY = el.shadowOffsetY ?? 8;
          }

          ctx.fillStyle = el.color || '#000';
          if (el.content === 'circle') {
            ctx.beginPath();
            ctx.arc(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            if (el.borderRadius && el.borderRadius > 0) {
              ctx.beginPath();
              ctx.roundRect(el.x, el.y, el.width, el.height, el.borderRadius);
              ctx.fill();
            } else {
              ctx.fillRect(el.x, el.y, el.width, el.height);
            }
          }
        } else if (el.type === 'text') {
          if (el.shadowEnabled) {
            const opacity = el.shadowOpacity ?? 25;
            const color = el.shadowColor ?? '#000000';
            let r = 0, g = 0, b = 0;
            if (color.startsWith('#')) {
              const hex = color.replace('#', '');
              if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
              } else if (hex.length === 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
              }
            }
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
            ctx.shadowBlur = el.shadowBlur ?? 20;
            ctx.shadowOffsetX = el.shadowOffsetX ?? 0;
            ctx.shadowOffsetY = el.shadowOffsetY ?? 8;
          }

          ctx.fillStyle = el.color || '#fff';
          ctx.font = `${el.fontWeight || 400} ${el.fontSize || 16}px ${el.fontFamily || 'Outfit'}`;
          ctx.textBaseline = 'top';
          ctx.textAlign = el.textAlign || 'center';
          
          const content = el.isUppercase ? el.content.toUpperCase() : el.content;
          const lines = content.split('\n');
          const lineHeight = (el.lineHeight || 1.2) * (el.fontSize || 16);
          const letterSpacing = el.letterSpacing || 0;
          
          lines.forEach((line, index) => {
            const y = el.y + (index * lineHeight);
            
            if (letterSpacing === 0) {
              const x = el.textAlign === 'left' ? el.x : el.textAlign === 'right' ? el.x + el.width : el.x + el.width / 2;
              ctx.fillText(line, x, y);
            } else {
              let currentX = el.x;
              if (el.textAlign === 'center') {
                const totalWidth = ctx.measureText(line).width + (line.length - 1) * letterSpacing;
                currentX = el.x + (el.width - totalWidth) / 2;
              } else if (el.textAlign === 'right') {
                const totalWidth = ctx.measureText(line).width + (line.length - 1) * letterSpacing;
                currentX = el.x + el.width - totalWidth;
              }
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                ctx.fillText(char, currentX, y);
                currentX += ctx.measureText(char).width + letterSpacing;
              }
            }
          });
        } else if (el.type === 'image') {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => {
              if (el.borderRadius && el.borderRadius > 0) {
                const r = Math.min(el.borderRadius, el.width / 2, el.height / 2);
                if (el.shadowEnabled) {
                  ctx.save();
                  const opacity = el.shadowOpacity ?? 25;
                  const color = el.shadowColor ?? '#000000';
                  let cr = 0, cg = 0, cb = 0;
                  if (color.startsWith('#')) {
                    const hex = color.replace('#', '');
                    if (hex.length === 3) {
                      cr = parseInt(hex[0] + hex[0], 16);
                      cg = parseInt(hex[1] + hex[1], 16);
                      cb = parseInt(hex[2] + hex[2], 16);
                    } else if (hex.length === 6) {
                      cr = parseInt(hex.substring(0, 2), 16);
                      cg = parseInt(hex.substring(2, 4), 16);
                      cb = parseInt(hex.substring(4, 6), 16);
                    }
                  }
                  ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, ${opacity / 100})`;
                  ctx.shadowBlur = el.shadowBlur ?? 20;
                  ctx.shadowOffsetX = el.shadowOffsetX ?? 0;
                  ctx.shadowOffsetY = el.shadowOffsetY ?? 8;
                  
                  ctx.beginPath();
                  ctx.moveTo(el.x + r, el.y);
                  ctx.lineTo(el.x + el.width - r, el.y);
                  ctx.quadraticCurveTo(el.x + el.width, el.y, el.x + el.width, el.y + r);
                  ctx.lineTo(el.x + el.width, el.y + el.height - r);
                  ctx.quadraticCurveTo(el.x + el.width, el.y + el.height, el.x + el.width - r, el.y + el.height);
                  ctx.lineTo(el.x + r, el.y + el.height);
                  ctx.quadraticCurveTo(el.x, el.y + el.height, el.x, el.y + el.height - r);
                  ctx.lineTo(el.x, el.y + r);
                  ctx.quadraticCurveTo(el.x, el.y, el.x + r, el.y);
                  ctx.closePath();
                  ctx.fillStyle = '#ffffff';
                  ctx.fill();
                  ctx.restore();
                }

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(el.x + r, el.y);
                ctx.lineTo(el.x + el.width - r, el.y);
                ctx.quadraticCurveTo(el.x + el.width, el.y, el.x + el.width, el.y + r);
                ctx.lineTo(el.x + el.width, el.y + el.height - r);
                ctx.quadraticCurveTo(el.x + el.width, el.y + el.height, el.x + el.width - r, el.y + el.height);
                ctx.lineTo(el.x + r, el.y + el.height);
                ctx.quadraticCurveTo(el.x, el.y + el.height, el.x, el.y + el.height - r);
                ctx.lineTo(el.x, el.y + r);
                ctx.quadraticCurveTo(el.x, el.y, el.x + r, el.y);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(img, el.x, el.y, el.width, el.height);
                ctx.restore();
              } else {
                if (el.shadowEnabled) {
                  const opacity = el.shadowOpacity ?? 25;
                  const color = el.shadowColor ?? '#000000';
                  let cr = 0, cg = 0, cb = 0;
                  if (color.startsWith('#')) {
                    const hex = color.replace('#', '');
                    if (hex.length === 3) {
                      cr = parseInt(hex[0] + hex[0], 16);
                      cg = parseInt(hex[1] + hex[1], 16);
                      cb = parseInt(hex[2] + hex[2], 16);
                    } else if (hex.length === 6) {
                      cr = parseInt(hex.substring(0, 2), 16);
                      cg = parseInt(hex.substring(2, 4), 16);
                      cb = parseInt(hex.substring(4, 6), 16);
                    }
                  }
                  ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, ${opacity / 100})`;
                  ctx.shadowBlur = el.shadowBlur ?? 20;
                  ctx.shadowOffsetX = el.shadowOffsetX ?? 0;
                  ctx.shadowOffsetY = el.shadowOffsetY ?? 8;
                }
                ctx.drawImage(img, el.x, el.y, el.width, el.height);
              }
              resolve(null);
            };
            img.onerror = () => resolve(null);
            if (el.content.startsWith('http')) {
              img.crossOrigin = 'anonymous';
            }
            img.src = el.content;
          });
        }
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      localStorage.setItem('pink_logic_temp_editor_media', dataUrl);
      window.location.href = '/publicador-automatico';
    } catch (err) {
      console.error('Failed to send design to publisher', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Formats are now coming from context as single source of truth
  const formats = availableFormats.map(f => ({
    ...f,
    name: t(`editor.formats.${f.id}`)
  }));

  return (
    <div className={`editor-layout ${isMobile && (mobileToolOpen || mobilePropsOpen) ? 'mobile-sheet-open' : ''}`}>
      {/* Top Header */}
      <div className="editor-header">
        <div className="editor-header-left">
          <button className="icon-btn" onClick={() => window.history.back()}><X size={20} /></button>
          <div className="format-selector">
            <select 
              value={canvasFormat.id} 
              onChange={(e) => setCanvasFormat(e.target.value)}
            >
              {formats.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.width}x{f.height})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="editor-header-center">
          <div className="zoom-controls">
            <button onClick={() => setZoom((z: number) => Math.max(0.1, z - 0.1))} title="Diminuir zoom"><Minus size={16} /></button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z: number) => Math.min(2, z + 0.1))} title="Aumentar zoom"><Plus size={16} /></button>
            <button onClick={() => {
              const container = document.querySelector('.canvas-container') as HTMLElement;
              const wrapper = document.querySelector('.editor-workspace') as HTMLElement;
              if (container && wrapper) {
                const scaleX = (wrapper.clientWidth - 40) / (canvasFormat.width + 40);
                const scaleY = (wrapper.clientHeight - 40) / (canvasFormat.height + 40);
                setZoom(Math.min(Math.min(scaleX, scaleY), 1));
              }
            }} title="Ajustar à tela"><Maximize2 size={14} /></button>
          </div>
        </div>

        <div className="editor-header-right">
          <button className="btn-ai-magic" onClick={() => setShowAIModal(true)} disabled={isProcessing}>
            <Sparkles size={18} />
            <span>Gerar Post</span>
          </button>
          {/* Mobile: as ações extras ficam num menu "⋯"; no desktop o wrapper é transparente (display: contents) */}
          <button
            className="icon-btn editor-more-btn"
            onClick={() => setMobileActionsOpen(open => !open)}
            aria-label="Mais ações"
            aria-expanded={mobileActionsOpen}
          >
            <MoreHorizontal size={20} />
          </button>
          {isMobile && mobileActionsOpen && (
            <div className="editor-more-backdrop" onClick={() => setMobileActionsOpen(false)} />
          )}
          <div className={`editor-header-more ${mobileActionsOpen ? 'open' : ''}`} onClick={() => setMobileActionsOpen(false)}>
          <div className="slide-counter">
            {canvasFormat.id === 'carousel' ? `Slide ${currentSlideIndex + 1} de ${slides.length}` : (formats.find(f => f.id === canvasFormat.id)?.name || '')}
          </div>
          <button className="btn-secondary" onClick={saveProject}><Save size={18} /> {t('common.save')}</button>
          <button className="btn-secondary" onClick={sendToPublisher} disabled={isProcessing} title="Enviar arte para o composer do Publicador Automático">
            <Sparkles size={18} />
            <span>Agendar Publicação</span>
          </button>
          {canvasFormat.id === 'carousel' ? (
            <>
              <button className="btn-secondary" onClick={() => handleExport(true)} disabled={isProcessing} title="Baixar apenas o slide ativo como PNG">
                <Download size={16} /> Baixar Slide Ativo (PNG)
              </button>
              <button className="btn-secondary" onClick={() => handleExport(false)} disabled={isProcessing} title="Baixar todos os slides gerados como arquivos PNG individuais">
                <Download size={16} /> Exportar PNGs (Todos)
              </button>
              <button className="btn-secondary" onClick={handleExportPDF} disabled={isProcessing} title="Exportar todos os slides do carrossel em um único arquivo PDF">
                <Download size={16} /> Exportar PDF
              </button>
              <button className="btn-primary" onClick={handleExportZip} disabled={isProcessing} title="Exportar todos os slides como PNG compactados em um arquivo ZIP verdadeiro">
                <Download size={16} /> Exportar ZIP Real
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => handleExport(true)} disabled={isProcessing} title="Baixar apenas o slide que você está editando no momento">
                <Download size={16} /> Baixar Slide Ativo
              </button>
              {slides.length > 1 && (
                <button className="btn-primary" onClick={() => handleExport(false)} disabled={isProcessing} title="Download sequencial de todas as páginas do carrossel">
                  <Download size={16} /> Exportar ZIP Carrossel
                </button>
              )}
            </>
          )}
          </div>
        </div>
      </div>

      <div className="editor-body">
        {/* Left Toolbar */}
        <div className={`editor-left-panel ${mobileToolOpen ? 'sheet-open' : ''}`}>
          <div className="panel-tabs">
            <button className={activeTab === 'templates' ? 'active' : ''} onClick={() => selectTab('templates')}><Sparkles size={20} /><span>Templates</span></button>
            <button className={activeTab === 'elements' ? 'active' : ''} onClick={() => selectTab('elements')}><Square size={20} /><span>{t('editor.elements')}</span></button>
            <button className={activeTab === 'text' ? 'active' : ''} onClick={() => selectTab('text')}><Type size={20} /><span>{t('editor.text')}</span></button>
            <button className={activeTab === 'uploads' ? 'active' : ''} onClick={() => selectTab('uploads')}><Upload size={20} /><span>{t('editor.uploads')}</span></button>
            <button className={activeTab === 'background' ? 'active' : ''} onClick={() => selectTab('background')}><Palette size={20} /><span>Fundo</span></button>
            <button className={activeTab === 'brand' ? 'active' : ''} onClick={() => selectTab('brand')}><Sparkles size={20} /><span>Brand Kit</span></button>
            <button className={activeTab === 'layers' ? 'active' : ''} onClick={() => selectTab('layers')}><Layers size={20} /><span>Camadas</span></button>
            <button className={activeTab === 'mockups' ? 'active' : ''} onClick={() => selectTab('mockups')}><Maximize2 size={20} /><span>Mockups</span></button>
            {/* Mobile: acesso às propriedades (painel direito) a partir da barra inferior */}
            <button className={`mobile-only ${mobilePropsOpen ? 'active' : ''}`} onClick={toggleMobileProps}><SlidersHorizontal size={20} /><span>Ajustes</span></button>
          </div>

          <div className="panel-content">
            <div className="mobile-sheet-header">
              <span className="mobile-sheet-grip" />
              <button className="mobile-sheet-close" onClick={() => setMobileToolOpen(false)} aria-label="Fechar painel">
                <X size={20} />
              </button>
            </div>
            <AnimatePresence mode="wait">
              {activeTab === 'templates' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="templates" className="tab-pane">
                  <h3>Templates Prontos</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Escolha um modelo premium para aplicar instantaneamente ao formato atual.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.keys(TEMPLATES_DATA).map(key => {
                      const tpl = TEMPLATES_DATA[key];
                      return (
                        <button 
                          key={key}
                          onClick={() => applyTemplate(key)}
                          className="text-preset"
                          style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0.75rem 1rem' }}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{tpl.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Design premium completo.</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'elements' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="elements" className="tab-pane">
                  <h3>Elementos Premium</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Adicione formas e efeitos visuais ao seu design.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                      <button onClick={() => addBasicElement('square')} className="shape-thumb square" style={{ height: '50px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }} title="Quadrado">Quadrado</button>
                      <button onClick={() => addBasicElement('circle')} className="shape-thumb circle" style={{ height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }} title="Círculo">Círculo</button>
                      <button onClick={() => addBasicElement('rect')} className="shape-thumb" style={{ height: '50px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }} title="Retângulo">Retângulo</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('gradient')}>Gradiente</button>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('glow')}>Glow Neon</button>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('glassmorphism')}>Glassmorphism</button>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('cta_button')}>Barra CTA</button>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('moldura')}>Moldura</button>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('card_premium')}>Card Premium</button>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('neon')}>Neon</button>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('linha')}>Linha</button>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('sombra')}>Sombra Layer</button>
                      <button className="btn-secondary" style={{ fontSize: '0.7rem', padding: '6px 4px', justifyContent: 'center' }} onClick={() => addBasicElement('blur_layer')}>Blur Layer</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'text' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="text" className="tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '100%', overflowY: 'auto', paddingRight: '4px' }}>
                  <h3>{t('editor.text')}</h3>
                  <div className="text-presets" style={{ flexShrink: 0 }}>
                    <button className="text-preset title" onClick={() => addText('title')}>{t('editor.add_text_title')}</button>
                    <button className="text-preset subtitle" onClick={() => addText('subtitle')}>{t('editor.add_text_subtitle')}</button>
                    <button className="text-preset body" onClick={() => addText('body')}>{t('editor.add_text_body')}</button>
                  </div>

                  {/* Font Pairing Presets */}
                  <div style={{ marginTop: '0.5rem', flexShrink: 0 }}>
                    <h4 style={{ fontSize: '0.8rem', color: '#A1A1B5', marginBottom: '0.5rem', fontWeight: 600 }}>Combinações de Fontes (Pairing)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {[
                        { title: 'Editorial Luxo', heading: 'Playfair Display', body: 'Inter' },
                        { title: 'Cyber Futurista', heading: 'Orbitron', body: 'Roboto' },
                        { title: 'Marketing Impacto', heading: 'Anton', body: 'Montserrat' },
                        { title: 'Minimalista Elegante', heading: 'Outfit', body: 'Lato' },
                        { title: 'Escrita Orgânica', heading: 'Great Vibes', body: 'Nunito' }
                      ].map((pair, idx) => (
                        <button
                          key={idx}
                          className="btn-secondary"
                          onClick={() => applyFontPair(pair.heading, pair.body)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '6px 10px',
                            height: 'auto',
                            gap: '2px',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '8px'
                          }}
                        >
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>{pair.title}</span>
                          <span style={{ fontSize: '0.64rem', color: '#aaa' }}>{pair.heading} + {pair.body}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 100+ Google Fonts Search and Categories */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.8rem', color: '#A1A1B5', marginBottom: '0.25rem', fontWeight: 600 }}>Tipografias Disponíveis</h4>
                    
                    {/* Search Input */}
                    <input 
                      type="text" 
                      placeholder="Buscar fonte Google..." 
                      value={fontSearchQuery}
                      onChange={e => setFontSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        height: '32px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        padding: '0 8px',
                        color: 'white',
                        fontSize: '0.75rem',
                        outline: 'none'
                      }}
                    />

                    {/* Tabs / Categories Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                      {[
                        { id: 'all', label: 'Todas' },
                        { id: 'Luxo', label: 'Luxo' },
                        { id: 'Minimalista', label: 'Minimal' },
                        { id: 'Bold', label: 'Bold' },
                        { id: 'Escrita', label: 'Escrita' },
                        { id: 'favoritas', label: '★ Favs' },
                        { id: 'recentes', label: '⌛ Recentes' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          className={`btn-secondary ${activeFontCategory === cat.id ? 'active' : ''}`}
                          onClick={() => setActiveFontCategory(cat.id as any)}
                          style={{
                            fontSize: '0.62rem',
                            height: '24px',
                            padding: '0 4px',
                            justifyContent: 'center',
                            borderColor: activeFontCategory === cat.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            background: activeFontCategory === cat.id ? 'rgba(255, 45, 155, 0.1)' : 'none'
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Font List */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '4px', 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      background: 'rgba(0,0,0,0.15)',
                      padding: '4px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                      {GOOGLE_FONTS_LIST.filter(font => {
                        const matchesSearch = font.name.toLowerCase().includes(fontSearchQuery.toLowerCase());
                        if (activeFontCategory === 'all') return matchesSearch;
                        if (activeFontCategory === 'favoritas') return matchesSearch && favoriteFonts.includes(font.name);
                        if (activeFontCategory === 'recentes') return matchesSearch && recentFonts.includes(font.name);
                        return matchesSearch && font.category === activeFontCategory;
                      }).map(font => {
                        const isFav = favoriteFonts.includes(font.name);
                        return (
                          <div
                            key={font.name}
                            onMouseEnter={() => lazyLoadFont(font.name)}
                            onClick={() => selectFont(font.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid transparent',
                              transition: 'background 0.2s, border-color 0.2s'
                            }}
                            className="font-list-item"
                          >
                            <span style={{ 
                              fontSize: '0.8rem', 
                              fontFamily: font.name,
                              color: 'white',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '120px'
                            }}>
                              {font.name}
                            </span>
                            <button
                              onClick={(e) => toggleFavoriteFont(font.name, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: isFav ? 'var(--primary)' : '#444',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                padding: '2px'
                              }}
                            >
                              ★
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Standard presets section */}
                  <h3 style={{ marginTop: '0.5rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Estilos Rápidos</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn-secondary w-full" style={{ justifyContent: 'left', padding: '0 10px', height: '32px', fontSize: '0.72rem' }} onClick={() => addTextPreset('white_shadow')}>
                      <span>Texto Branco com Sombra</span>
                    </button>
                    <button className="btn-secondary w-full" style={{ justifyContent: 'left', padding: '0 10px', height: '32px', fontSize: '0.72rem' }} onClick={() => addTextPreset('dark_box')}>
                      <span>Texto com Caixa Escura</span>
                    </button>
                    <button className="btn-secondary w-full" style={{ justifyContent: 'left', padding: '0 10px', height: '32px', fontSize: '0.72rem' }} onClick={() => addTextPreset('glow')}>
                      <span>Texto com Glow Neon</span>
                    </button>
                  </div>

                  <style>{`
                    .font-list-item:hover {
                      background: rgba(255, 45, 155, 0.08) !important;
                      border-color: rgba(255, 45, 155, 0.2) !important;
                    }
                  `}</style>
                </motion.div>
              )}

              {activeTab === 'uploads' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="uploads" className="tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '100%', overflowY: 'auto', paddingRight: '4px' }}>
                  <h3>{t('editor.uploads')}</h3>
                  <div className="upload-area" onClick={() => (document.getElementById('fileUpload') as any)?.click()} style={{ minHeight: '100px', flexShrink: 0 }}>
                    <Upload size={32} />
                    <p>{t('editor.upload_image_btn')}</p>
                    <input 
                      type="file" 
                      id="fileUpload" 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const base64 = ev.target?.result as string;
                            addImage(base64);
                            try {
                              const uploadsKey = `pink_logic_uploads_${activeProjectId || 'default'}`;
                              const saved = localStorage.getItem(uploadsKey);
                              const current = saved ? JSON.parse(saved) : [];
                              const updated = [base64, ...current];
                              localStorage.setItem(uploadsKey, JSON.stringify(updated));
                              setLocalUploads(updated);
                            } catch (err) {
                              console.error('Failed to save file upload in localStorage', err);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>

                  {/* 1. Brand Logo */}
                  {activeBrandKit?.logo && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.75rem', color: '#A1A1B5', marginBottom: '0.5rem', fontWeight: 600 }}>Logotipo da Marca</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => addImage(activeBrandKit.logo!)}
                          style={{ 
                            padding: '6px', 
                            height: '64px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <img src={activeBrandKit.logo} alt="Brand Logo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Local Uploads */}
                  {localUploads.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.75rem', color: '#A1A1B5', marginBottom: '0.5rem', fontWeight: 600 }}>Uploads Recentes</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {localUploads.map((url, idx) => (
                          <button
                            key={idx}
                            className="btn-secondary"
                            onClick={() => addImage(url)}
                            style={{ 
                              padding: '4px', 
                              height: '64px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <img src={url} alt={`Upload ${idx}`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. AI Cutout Models */}
                  {customModels.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.75rem', color: '#A1A1B5', marginBottom: '0.5rem', fontWeight: 600 }}>Modelos de Recorte IA</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {customModels.map((url, idx) => (
                          <button
                            key={idx}
                            className="btn-secondary"
                            onClick={() => addImage(url)}
                            style={{ 
                              padding: '4px', 
                              height: '64px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <img src={url} alt={`Model ${idx}`} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Stickers */}
                  {projectStickers.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.75rem', color: '#A1A1B5', marginBottom: '0.5rem', fontWeight: 600 }}>Adesivos do Projeto</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {projectStickers.map(st => {
                          const src = st.generatedUrl || st.imageUrl;
                          if (!src) return null;
                          return (
                            <button
                              key={st.id}
                              className="btn-secondary"
                              onClick={() => addImage(src)}
                              title={st.text}
                              style={{ 
                                padding: '4px', 
                                height: '64px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                            >
                              <img src={src} alt={st.text} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'background' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="background" className="tab-pane">
                  <h3>Fundo do Post</h3>

                  <div className="settings-section">
                    <label>Tipo de Fundo</label>
                    <div className="alignment-toolbar mb-4">
                      <button 
                        className={background.type === 'color' ? 'active' : ''} 
                        onClick={() => updateCurrentSlide({ 
                          background: { 
                            ...background, 
                            type: 'color', 
                            value: background.color1 || '#FF2D8D' 
                          } 
                        })}
                      >Sólido</button>
                      <button 
                        className={background.type === 'gradient' ? 'active' : ''} 
                        onClick={() => {
                          const c1 = background.color1 || '#FF2D8D';
                          const c2 = background.color2 || '#7000FF';
                          const dir = background.direction || 'tb';
                          updateCurrentSlide({ 
                            background: { 
                              ...background, 
                              type: 'gradient', 
                              color1: c1,
                              color2: c2,
                              direction: dir,
                              value: getGradientCss(c1, c2, dir)
                            } 
                          });
                        }}
                      >Gradiente</button>
                    </div>
                  </div>

                  {background.type === 'color' && (
                    <div className="settings-section">
                      <label>Cor de Fundo</label>
                      <div className="color-picker-container">
                        <ColorPicker 
                          color={background.value} 
                          onChange={(c) => {
                            updateCurrentSlide({ 
                              background: { 
                                ...background, 
                                type: 'color', 
                                value: c,
                                color1: c
                              } 
                            });
                            addToHistory(c);
                          }}
                          brandColors={getBrandColorsArray(projectBranding)}
                          history={colorHistory}
                        />
                      </div>
                    </div>
                  )}

                  {background.type === 'gradient' && (
                    <>
                      <div className="settings-section">
                        <label>Cor 1 (Inicial)</label>
                        <ColorPicker 
                          color={background.color1 || '#FF2D8D'} 
                          onChange={(c) => {
                            const c2 = background.color2 || '#7000FF';
                            const dir = background.direction || 'tb';
                            updateCurrentSlide({ 
                              background: { 
                                ...background, 
                                color1: c,
                                value: getGradientCss(c, c2, dir)
                              } 
                            });
                          }}
                          brandColors={getBrandColorsArray(projectBranding)}
                          history={colorHistory}
                        />
                      </div>

                      <div className="settings-section">
                        <label>Cor 2 (Final)</label>
                        <ColorPicker 
                          color={background.color2 || '#7000FF'} 
                          onChange={(c) => {
                            const c1 = background.color1 || '#FF2D8D';
                            const dir = background.direction || 'tb';
                            updateCurrentSlide({ 
                              background: { 
                                ...background, 
                                color2: c,
                                value: getGradientCss(c1, c, dir)
                              } 
                            });
                          }}
                          brandColors={getBrandColorsArray(projectBranding)}
                          history={colorHistory}
                        />
                      </div>

                      <div className="settings-section">
                        <label>Direção do Gradiente</label>
                        <div className="alignment-toolbar">
                          <button 
                            className={background.direction === 'tb' ? 'active' : ''} 
                            onClick={() => {
                              const c1 = background.color1 || '#FF2D8D';
                              const c2 = background.color2 || '#7000FF';
                              updateCurrentSlide({ 
                                background: { 
                                  ...background, 
                                  direction: 'tb', 
                                  value: getGradientCss(c1, c2, 'tb') 
                                } 
                              });
                            }}
                            title="Cima para Baixo"
                          >↓</button>
                          <button 
                            className={background.direction === 'lr' ? 'active' : ''} 
                            onClick={() => {
                              const c1 = background.color1 || '#FF2D8D';
                              const c2 = background.color2 || '#7000FF';
                              updateCurrentSlide({ 
                                  background: { 
                                  ...background, 
                                  direction: 'lr', 
                                  value: getGradientCss(c1, c2, 'lr') 
                                } 
                              });
                            }}
                            title="Esquerda para Direita"
                          >→</button>
                          <button 
                            className={background.direction === 'diag' ? 'active' : ''} 
                            onClick={() => {
                              const c1 = background.color1 || '#FF2D8D';
                              const c2 = background.color2 || '#7000FF';
                              updateCurrentSlide({ 
                                background: { 
                                  ...background, 
                                  direction: 'diag', 
                                  value: getGradientCss(c1, c2, 'diag') 
                                } 
                              });
                            }}
                            title="Diagonal"
                          >↘</button>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="settings-section" style={{ marginTop: '2rem' }}>
                    <label>{t('editor.bg_image')}</label>
                    <button className="btn-secondary w-full" onClick={() => (document.getElementById('bgUpload') as any)?.click()}>
                      <ImageIcon size={18} /> {t('editor.upload_image_btn')}
                    </button>
                    <input 
                      type="file" 
                      id="bgUpload" 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => updateCurrentSlide({ background: { ...background, type: 'image', value: ev.target?.result as string } });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>

                  <div className="settings-section" style={{ marginTop: '1.5rem' }}>
                    <label>Filtros & Overlays de Fundo</label>
                    <select 
                      className="w-full mb-3 select-field"
                      value={background.overlayType || 'none'}
                      onChange={(e) => updateCurrentSlide({ 
                        background: { ...background, overlayType: e.target.value } 
                      })}
                    >
                      <option value="none">Nenhum Overlay</option>
                      <option value="linear">Cinematic Linear Escuro</option>
                      <option value="radial">Radial Glow Ambient</option>
                      <option value="blur">Blur Layer Overlay</option>
                    </select>

                    {background.overlayType && background.overlayType !== 'none' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                          <span>Opacidade do Filtro</span>
                          <span>{background.overlayOpacity ?? 30}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={background.overlayOpacity ?? 30} 
                          onChange={(e) => updateCurrentSlide({ 
                            background: { ...background, overlayOpacity: parseInt(e.target.value) } 
                          })}
                          style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'brand' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="brand" className="tab-pane">
                  <h3>Brand Kit Sincronizado</h3>
                  
                  {activeBrandKit ? (
                    <>
                      <div className="brand-kit-card active" style={{ cursor: 'default', marginBottom: '1rem' }}>
                        <span className="kit-name">{activeBrandKit.name}</span>
                        <div className="kit-colors">
                          {activeBrandKit.colors.map(c => <div key={c} style={{ background: c }}></div>)}
                        </div>
                      </div>

                      {/* Logo do Brand Kit Section */}
                      <div className="brand-kit-logo-section" style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        marginBottom: '1rem' 
                      }}>
                        <h4 style={{ fontSize: '0.78rem', color: '#A1A1B5', margin: '0 0 8px 0', fontWeight: 600 }}>Logo da Identidade</h4>
                        
                        {activeBrandKit.logo ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{
                              height: '80px',
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              padding: '8px'
                            }}>
                              <img 
                                src={activeBrandKit.logo} 
                                alt="Logo Brand Kit" 
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                              />
                              <button 
                                onClick={() => {
                                  updateBrand(activeBrandKit.id, { logo: '' });
                                  alert('Logotipo removido do Brand Kit!');
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  background: 'rgba(255, 68, 68, 0.8)',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '22px',
                                  height: '22px',
                                  color: '#FFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '10px'
                                }}
                                title="Remover logotipo"
                              >
                                ✕
                              </button>
                            </div>
                            <button 
                              className="btn-secondary w-full" 
                              style={{ fontSize: '0.72rem', height: '30px', justifyContent: 'center' }}
                              onClick={() => (document.getElementById('brandLogoUploadInput') as any)?.click()}
                            >
                              Trocar Logo
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{
                              height: '80px',
                              border: '1px dashed rgba(255,255,255,0.15)',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-muted)',
                              fontSize: '0.72rem'
                            }}>
                              Nenhum logotipo inserido
                            </div>
                            <button 
                              className="btn-secondary w-full" 
                              style={{ fontSize: '0.72rem', height: '30px', justifyContent: 'center' }}
                              onClick={() => (document.getElementById('brandLogoUploadInput') as any)?.click()}
                            >
                              <Upload size={12} /> Enviar Logo
                            </button>
                          </div>
                        )}

                        <input 
                          type="file" 
                          id="brandLogoUploadInput" 
                          style={{ display: 'none' }} 
                          accept=".png, .jpg, .jpeg, .webp, .svg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const base64 = ev.target?.result as string;
                                updateBrand(activeBrandKit.id, { logo: base64 });
                                alert('Logotipo enviado e salvo no Brand Kit!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />

                        <div style={{ marginTop: '10px' }}>
                          <label style={{ fontSize: '0.68rem', color: '#A1A1B5', display: 'block', marginBottom: '4px' }}>Ou URL do Logotipo:</label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input 
                              type="text" 
                              placeholder="https://exemplo.com/logo.png" 
                              value={logoUrlInputValue}
                              onChange={(e) => setLogoUrlInputValue(e.target.value)}
                              style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                color: '#FFF'
                              }}
                            />
                            <button 
                              className="btn-primary"
                              style={{ padding: '0 8px', fontSize: '0.72rem', height: '26px' }}
                              onClick={() => {
                                if (logoUrlInputValue.trim()) {
                                  updateBrand(activeBrandKit.id, { logo: logoUrlInputValue.trim() });
                                  alert('Logo atualizada com URL com sucesso!');
                                }
                              }}
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Nenhum kit de marca ativo selecionado.
                    </p>
                  )}

                  <button 
                    className="btn-primary w-full mb-4" 
                    style={{ fontSize: '0.75rem', justifyContent: 'center', height: '36px' }} 
                    onClick={() => {
                      if (!activeBrandKit) return;
                      const titleEl = elements.find(e => e.type === 'text');
                      const colors = [
                        background.color1 || background.value || '#FF2D8D',
                        background.color2 || '#7000FF',
                        titleEl?.color || '#FFFFFF'
                      ].filter((v, i, a) => a.indexOf(v) === i);
                      
                      const updatedColors = colors.slice(0, 6);
                      updateBrand(activeBrandKit.id, {
                        colors: updatedColors,
                        palette: {
                          primary: updatedColors[0] || activeBrandKit.palette.primary,
                          secondary: updatedColors[1] || activeBrandKit.palette.secondary,
                          accent: updatedColors[2] || activeBrandKit.palette.accent,
                          background: background.value || activeBrandKit.palette.background,
                          text: titleEl?.color || activeBrandKit.palette.text,
                        }
                      });
                      alert('Brand Kit sincronizado reativamente com as cores da arte atual!');
                    }}
                    disabled={!activeBrandKit}
                  >
                    Sincronizar Cores Atuais
                  </button>

                  <h4 style={{ fontSize: '0.8rem', color: '#A1A1B5', margin: '1rem 0 0.5rem', fontWeight: 600 }}>Logotipos Favoritos</h4>
                  <button 
                    className="btn-secondary w-full mb-3" 
                    style={{ fontSize: '0.75rem', justifyContent: 'center', height: '34px' }} 
                    onClick={() => (document.getElementById('brandLogoUpload') as any)?.click()}
                  >
                    <Upload size={14} /> Enviar Logo da Marca
                  </button>
                  <input 
                    type="file" 
                    id="brandLogoUpload" 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const base64 = ev.target?.result as string;
                          const newLogos = [base64, ...logoList];
                          setLogoList(newLogos);
                          localStorage.setItem('pink_logic_brand_logos', JSON.stringify(newLogos));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {logoList.map((logo, idx) => (
                      <button
                        key={idx}
                        onClick={() => addLogoToCanvas(logo)}
                        style={{
                          height: '60px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <img src={logo} alt="Logo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </button>
                    ))}
                  </div>

                  <h4 style={{ fontSize: '0.8rem', color: '#A1A1B5', margin: '1.5rem 0 0.5rem', fontWeight: 600 }}>Kits Disponíveis</h4>
                  <div className="brand-kits-list">
                    {brandKits.map(kit => (
                      <button 
                        key={kit.id} 
                        className={`brand-kit-card ${activeBrandKit?.id === kit.id ? 'active' : ''}`}
                        onClick={() => {
                          setActiveBrandKit(kit);
                          applyBrandKitToSlide(kit);
                        }}
                      >
                        <span className="kit-name">{kit.name}</span>
                        <div className="kit-colors">
                          {kit.colors.map(c => <div key={c} style={{ background: c }}></div>)}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'layers' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="layers" className="tab-pane">
                  <h3>Painel de Camadas</h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Bloqueie, oculte ou ordene elementos estilo Canva.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {elements.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Nenhum elemento adicionado.
                      </div>
                    ) : (
                      [...elements]
                        .sort((a, b) => b.zIndex - a.zIndex) // Top layers first
                        .map(el => (
                          <div 
                            key={el.id}
                            className={`brand-kit-card ${selectedElementId === el.id ? 'active' : ''}`}
                            onClick={() => setSelectedElementId(el.id)}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '6px 10px',
                              cursor: 'pointer',
                              background: selectedElementId === el.id ? 'rgba(255, 47, 191, 0.05)' : 'rgba(255,255,255,0.01)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                              {el.type === 'text' && <Type size={13} style={{ color: 'var(--primary)' }} />}
                              {el.type === 'image' && <ImageIcon size={13} style={{ color: '#7B4DFF' }} />}
                              {el.type === 'shape' && <Square size={13} style={{ color: '#00E0FF' }} />}
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                                {el.type === 'text' ? (el.content.substring(0, 15) || 'Texto') : el.type === 'image' ? 'Imagem' : `Forma (${el.content})`}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => updateElement(el.id, { isHidden: !el.isHidden })}
                                style={{ color: el.isHidden ? 'var(--text-muted)' : 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                                title={el.isHidden ? 'Mostrar camada' : 'Ocultar camada'}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  {el.isHidden ? (
                                    <>
                                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                      <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </>
                                  ) : (
                                    <>
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </>
                                  )}
                                </svg>
                              </button>

                              <button 
                                onClick={() => updateElement(el.id, { isLocked: !el.isLocked })}
                                style={{ color: el.isLocked ? 'var(--primary)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                                title={el.isLocked ? 'Desbloquear' : 'Bloquear'}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  {el.isLocked ? (
                                    <>
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </>
                                  ) : (
                                    <>
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                                    </>
                                  )}
                                </svg>
                              </button>

                              <button onClick={() => moveLayerUp(el.id)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }} title="Trazer para cima"><ChevronUp size={12} /></button>
                              <button onClick={() => moveLayerDown(el.id)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }} title="Enviar para baixo"><ChevronDown size={12} /></button>
                              <button onClick={() => removeElement(el.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Excluir"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'mockups' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="mockups" className="tab-pane">
                  <h3>Mockups Premium</h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Veja sua arte aplicada em mockups realistas instantaneamente.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { id: 'iphone', name: 'iPhone 15 Pro', desc: 'Smartphone vertical' },
                      { id: 'ipad', name: 'iPad Pro', desc: 'Tablet luxuoso' },
                      { id: 'notebook', name: 'MacBook Air', desc: 'Computador premium' },
                      { id: 'ebook', name: 'Ebook 3D', desc: 'Livro digital com spine shadow' },
                      { id: 'holo_screen', name: 'Cyber Hologram', desc: 'Holografia futurista neon' }
                    ].map(mock => (
                      <button
                        key={mock.id}
                        onClick={() => setSelectedMockup(selectedMockup === mock.id ? null : mock.id)}
                        className={`brand-kit-card ${selectedMockup === mock.id ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          padding: '0.75rem',
                          textAlign: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          background: selectedMockup === mock.id ? 'rgba(255, 47, 191, 0.05)' : 'rgba(255,255,255,0.01)',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{mock.name}</span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{mock.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Workspace Center */}
        <div className="editor-workspace" style={{ position: 'relative', paddingTop: '44px' }} onClick={() => setSelectedElementId(null)}>
          {selectedElement ? (
            <div 
              className="property-bar"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                minHeight: '44px',
                background: 'rgba(21, 21, 21, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 45, 155, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                color: 'white',
                fontSize: '0.8rem',
                flexWrap: 'wrap'
              }}
            >
              {/* Type indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '12px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>
                {selectedElement.type === 'text' && <span>Texto</span>}
                {selectedElement.type === 'image' && <span>Imagem</span>}
                {selectedElement.type === 'shape' && <span>Forma</span>}
              </div>

              {/* Text specific controls */}
              {selectedElement.type === 'text' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#aaa', fontSize: '0.72rem' }}>Fonte:</span>
                    <select 
                      value={selectedElement.fontFamily || 'Outfit'} 
                      onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        color: 'white',
                        outline: 'none',
                        fontSize: '0.78rem'
                      }}
                    >
                      {['Outfit', 'Inter', 'Playfair Display', 'Poppins', 'Montserrat', 'Roboto', 'Nunito', 'Lato', 'Bebas Neue', 'Oswald', 'DM Sans', 'Anton', 'Cormorant Garamond', 'Great Vibes', 'Sacramento', 'Parisienne', 'Alex Brush'].map(f => (
                        <option key={f} value={f} style={{ background: '#151515' }}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button 
                      className="btn-secondary" 
                      onClick={(e) => { e.stopPropagation(); updateElement(selectedElement.id, { fontSize: Math.max(1, (selectedElement.fontSize || 16) - 2) }); }}
                      style={{ padding: 0, height: '28px', width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >-</button>
                    <input 
                      type="number" 
                      value={selectedElement.fontSize || 16}
                      onChange={(e) => updateElement(selectedElement.id, { fontSize: Math.max(1, parseInt(e.target.value) || 16) })}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '44px',
                        height: '28px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '0.78rem',
                        outline: 'none'
                      }}
                    />
                    <button 
                      className="btn-secondary" 
                      onClick={(e) => { e.stopPropagation(); updateElement(selectedElement.id, { fontSize: (selectedElement.fontSize || 16) + 2 }); }}
                      style={{ padding: 0, height: '28px', width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >+</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#aaa', fontSize: '0.72rem' }}>Cor:</span>
                    <input 
                      type="color" 
                      value={selectedElement.color || '#ffffff'} 
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        padding: 0,
                        background: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 800 ? 400 : 800 }); }}
                      className={`btn-secondary ${selectedElement.fontWeight === 800 ? 'active' : ''}`}
                      style={{ height: '28px', padding: '0 8px', fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                      B
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateElement(selectedElement.id, { isUppercase: !selectedElement.isUppercase }); }}
                      className={`btn-secondary ${selectedElement.isUppercase ? 'active' : ''}`}
                      style={{ height: '28px', padding: '0 8px', fontSize: '0.75rem' }}
                    >
                      aA
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '6px' }}>
                    {['left', 'center', 'right'].map(align => (
                      <button
                        key={align}
                        onClick={(e) => { e.stopPropagation(); updateElement(selectedElement.id, { textAlign: align as any }); }}
                        className={`btn-secondary ${selectedElement.textAlign === align ? 'active' : ''}`}
                        style={{ height: '24px', width: '24px', padding: 0, border: 'none', background: selectedElement.textAlign === align ? 'var(--primary)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase' }}>{align[0]}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                      <input 
                        type="checkbox" 
                        checked={!!selectedElement.textGradientEnabled}
                        onChange={(e) => updateElement(selectedElement.id, { textGradientEnabled: e.target.checked, textGradientColor1: selectedElement.textGradientColor1 || '#FF2D9B', textGradientColor2: selectedElement.textGradientColor2 || '#FF4DB2' })} 
                      />
                      <span>Gradiente</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                      <input 
                        type="checkbox" 
                        checked={!!selectedElement.textGlowEnabled}
                        onChange={(e) => updateElement(selectedElement.id, { textGlowEnabled: e.target.checked, textGlowColor: selectedElement.textGlowColor || '#FF2D9B', textGlowBlur: selectedElement.textGlowBlur || 15 })} 
                      />
                      <span>Glow</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Image specific controls */}
              {selectedElement.type === 'image' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, maxWidth: '200px' }}>
                    <span style={{ color: '#aaa', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>Opacidade:</span>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={selectedElement.opacity !== undefined ? selectedElement.opacity : 100}
                      onChange={(e) => updateElement(selectedElement.id, { opacity: parseInt(e.target.value) })}
                      onClick={(e) => e.stopPropagation()}
                      style={{ flex: 1, accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.75rem', width: '28px', textAlign: 'right' }}>{selectedElement.opacity !== undefined ? selectedElement.opacity : 100}%</span>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span style={{ color: '#aaa', fontSize: '0.72rem' }}>Enquadrar:</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateElement(selectedElement.id, { objectFit: 'cover' }); }}
                      className={`btn-secondary ${selectedElement.objectFit === 'cover' ? 'active' : ''}`}
                      style={{ height: '28px', padding: '0 8px', fontSize: '0.72rem' }}
                    >
                      Cover
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateElement(selectedElement.id, { objectFit: 'contain' }); }}
                      className={`btn-secondary ${selectedElement.objectFit === 'contain' ? 'active' : ''}`}
                      style={{ height: '28px', padding: '0 8px', fontSize: '0.72rem' }}
                    >
                      Contain
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
                    <button 
                      className="btn-primary" 
                      onClick={(e) => { e.stopPropagation(); handleRemoveBackground(); }}
                      disabled={isProcessing}
                      style={{ height: '28px', padding: '0 10px', fontSize: '0.72rem', gap: '4px' }}
                    >
                      <Sparkles size={12} /> Remover Fundo
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={(e) => { e.stopPropagation(); handleIAVariation(); }}
                      disabled={isProcessing}
                      style={{ height: '28px', padding: '0 10px', fontSize: '0.72rem', gap: '4px' }}
                    >
                      <Sparkles size={12} style={{ color: 'var(--primary)' }} /> Gerar Variação IA
                    </button>
                  </div>
                </div>
              )}

              {/* Shape specific controls */}
              {selectedElement.type === 'shape' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#aaa', fontSize: '0.72rem' }}>Cor:</span>
                    <input 
                      type="color" 
                      value={selectedElement.color || '#FF2D9B'} 
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        padding: 0,
                        background: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, maxWidth: '200px' }}>
                    <span style={{ color: '#aaa', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>Arredondar:</span>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={selectedElement.borderRadius || 0}
                      onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                      onClick={(e) => e.stopPropagation()}
                      style={{ flex: 1, accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.75rem', width: '28px', textAlign: 'right' }}>{selectedElement.borderRadius || 0}px</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#aaa', fontSize: '0.72rem' }}>Borda:</span>
                    <select 
                      value={selectedElement.borderStyle || 'none'} 
                      onChange={(e) => updateElement(selectedElement.id, { borderStyle: e.target.value === 'none' ? undefined : e.target.value })}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        color: 'white',
                        outline: 'none',
                        fontSize: '0.78rem'
                      }}
                    >
                      <option value="none">Nenhuma</option>
                      <option value="solid">Sólida</option>
                      <option value="dashed">Tracejada</option>
                      <option value="dotted">Pontilhada</option>
                    </select>
                  </div>

                  {selectedElement.borderStyle && selectedElement.borderStyle !== 'none' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#aaa', fontSize: '0.72rem' }}>Largura:</span>
                        <input 
                          type="number" 
                          min="1" max="20"
                          value={selectedElement.borderWidth || 2}
                          onChange={(e) => updateElement(selectedElement.id, { borderWidth: Math.max(1, parseInt(e.target.value) || 2) })}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '40px',
                            height: '28px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            color: 'white',
                            textAlign: 'center',
                            fontSize: '0.78rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#aaa', fontSize: '0.72rem' }}>Cor Borda:</span>
                        <input 
                          type="color" 
                          value={selectedElement.borderColor || '#ffffff'} 
                          onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '24px',
                            height: '24px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: 0,
                            background: 'none'
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Delete Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); removeElement(selectedElement.id); }}
                style={{
                  background: 'rgba(255, 45, 155, 0.1)',
                  border: '1px solid rgba(255, 45, 155, 0.3)',
                  color: '#FF2D9B',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginLeft: 'auto'
                }}
              >
                <Trash2 size={12} /> Excluir
              </button>
            </div>
          ) : (
            /* Slide Controls Bar (rendered when no element is selected) */
            <div 
              className="property-bar slide-controls-bar"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                height: '44px',
                background: 'rgba(15, 15, 15, 0.9)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '0 16px',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                color: 'white',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 600 }}>Modo Carrossel</span>
                <span style={{ 
                  background: 'var(--primary)', 
                  fontSize: '0.7rem', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontWeight: 700
                }}>
                  Slide {currentSlideIndex + 1} de {slides.length}
                </span>
              </div>

              {/* Slideshow Player */}
              <button 
                onClick={(e) => { e.stopPropagation(); setIsPlayingSlideshow(!isPlayingSlideshow); }}
                className={`btn-secondary ${isPlayingSlideshow ? 'active' : ''}`}
                style={{ 
                  height: '28px', 
                  fontSize: '0.75rem', 
                  gap: '6px',
                  borderColor: isPlayingSlideshow ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  background: isPlayingSlideshow ? 'rgba(255, 45, 155, 0.1)' : 'none'
                }}
              >
                <Sparkles size={12} style={{ color: isPlayingSlideshow ? 'var(--primary)' : 'white' }} />
                <span>{isPlayingSlideshow ? 'Pausar Apresentação (2s)' : 'Apresentação Slide (2s)'}</span>
              </button>

              <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); addSlide(); }}
                  style={{ height: '28px', fontSize: '0.72rem', gap: '4px' }}
                >
                  <Plus size={12} /> Adicionar Slide
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); duplicateSlide(currentSlideIndex); }}
                  style={{ height: '28px', fontSize: '0.72rem', gap: '4px' }}
                >
                  Duplicar
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); removeSlide(currentSlideIndex); }}
                  disabled={slides.length <= 1}
                  style={{ height: '28px', fontSize: '0.72rem', gap: '4px', color: slides.length <= 1 ? '#444' : '#ff4d4d' }}
                >
                  Excluir Slide
                </button>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                <button 
                  className="btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); reorderSlides(currentSlideIndex, currentSlideIndex - 1); }}
                  disabled={currentSlideIndex === 0}
                  style={{ height: '28px', fontSize: '0.72rem', gap: '4px', opacity: currentSlideIndex === 0 ? 0.5 : 1 }}
                  title="Mover slide para a esquerda"
                >
                  ⬅️ esquerda
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); reorderSlides(currentSlideIndex, currentSlideIndex + 1); }}
                  disabled={currentSlideIndex === slides.length - 1}
                  style={{ height: '28px', fontSize: '0.72rem', gap: '4px', opacity: currentSlideIndex === slides.length - 1 ? 0.5 : 1 }}
                  title="Mover slide para a direita"
                >
                  ➡️ direita
                </button>
              </div>
            </div>
          )}

          {/* Flanking navigation arrows */}
          {slides.length > 1 && (
            <>
              <button 
                className="flanking-arrow arrow-left" 
                onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1)); }}
                disabled={currentSlideIndex === 0}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(15, 15, 15, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentSlideIndex === 0 ? 0.3 : 0.8,
                  zIndex: 99,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  transition: 'opacity 0.2s, background 0.2s'
                }}
                onMouseEnter={(e) => { if (currentSlideIndex !== 0) e.currentTarget.style.background = 'rgba(255, 45, 155, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 15, 15, 0.8)'; }}
              >
                ←
              </button>
              <button 
                className="flanking-arrow arrow-right" 
                onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1)); }}
                disabled={currentSlideIndex === slides.length - 1}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(15, 15, 15, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: currentSlideIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentSlideIndex === slides.length - 1 ? 0.3 : 0.8,
                  zIndex: 99,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  transition: 'opacity 0.2s, background 0.2s'
                }}
                onMouseEnter={(e) => { if (currentSlideIndex !== slides.length - 1) e.currentTarget.style.background = 'rgba(255, 45, 155, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 15, 15, 0.8)'; }}
              >
                →
              </button>
            </>
          )}

          <div 
            className="canvas-wrapper" 
            style={{
              width: `${canvasFormat.width * zoom}px`,
              height: `${canvasFormat.height * zoom}px`,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto',
              flexShrink: 0,
              transition: 'width 0.2s ease, height 0.2s ease',
            }}
          >
            <div 
              className="canvas-container"
              style={{ 
                width: `${canvasFormat.width}px`, 
                height: `${canvasFormat.height}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                // Mobile: alças visuais com tamanho legível ao toque, independente do zoom
                ['--handle-scale' as any]: isMobile ? 1.8 / Math.max(zoom, 0.05) : 1,
                position: 'absolute',
                background: 'white',
                overflow: 'hidden',
                ...getCanvasMockupStyles(),
              }}
              ref={canvasRef}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(null);
              }}
            >
            {/* Background Layer */}
            <div className="canvas-bg" style={{
              position: 'absolute', inset: 0,
              background: background.value,
              filter: `blur(${background.blur || 0}px) brightness(${background.brightness || 100}%)`
            }} />

            {/* Background Overlay */}
            {background.overlayType && background.overlayType !== 'none' && (
              <div 
                className="canvas-bg-overlay" 
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 0,
                  opacity: (background.overlayOpacity ?? 30) / 100,
                  background: background.overlayType === 'linear' 
                    ? 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9))'
                    : background.overlayType === 'radial'
                    ? 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.95))'
                    : 'rgba(0,0,0,0.25)',
                  backdropFilter: background.overlayType === 'blur' ? 'blur(10px)' : 'none',
                }}
              />
            )}

            {/* Canvas Label Overlay */}
            <div className="canvas-dimension-label">
              <span>{formats.find(f => f.id === canvasFormat.id)?.name || canvasFormat.id}</span>
              <span className="dim-tag">{canvasFormat.width} x {canvasFormat.height}</span>
            </div>

            {/* Guidelines */}
            {snapLines.x !== null && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${snapLines.x}px`,
                  width: '1px',
                  borderLeft: '1px dashed var(--primary)',
                  zIndex: 99999,
                  pointerEvents: 'none'
                }}
              />
            )}
            {snapLines.y !== null && (
              <div 
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${snapLines.y}px`,
                  height: '1px',
                  borderTop: '1px dashed var(--primary)',
                  zIndex: 99999,
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Mockup Overlays inside screen */}
            {selectedMockup === 'iphone' && (
              <>
                {/* Dynamic Island */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '110px',
                  height: '28px',
                  background: '#000000',
                  borderRadius: '14px',
                  zIndex: 999999,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a1a1a' }} />
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0a0a20' }} />
                </div>
                {/* Bottom Home Indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '130px',
                  height: '4px',
                  background: '#ffffff',
                  opacity: 0.8,
                  borderRadius: '2px',
                  zIndex: 999999,
                  pointerEvents: 'none'
                }} />
              </>
            )}

            {selectedMockup === 'ipad' && (
              /* Camera dot */
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#1a1a1a',
                zIndex: 999999,
                pointerEvents: 'none'
              }} />
            )}

            {selectedMockup === 'notebook' && (
              /* Camera dot */
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#0a0a0a',
                zIndex: 999999,
                pointerEvents: 'none'
              }} />
            )}

            {selectedMockup === 'ebook' && (
              <>
                {/* Spine Shadow */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '28px',
                  background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.05) 70%, transparent 100%)',
                  zIndex: 999999,
                  pointerEvents: 'none'
                }} />
                {/* Book Page Stack Highlights */}
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: 'linear-gradient(to left, rgba(255,255,255,0.15), transparent)',
                  zIndex: 999999,
                  pointerEvents: 'none'
                }} />
              </>
            )}

            {selectedMockup === 'holo_screen' && (
              /* Scanlines / Neon overlay */
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 224, 255, 0.08) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))',
                backgroundSize: '100% 4px, 6px 100%',
                pointerEvents: 'none',
                zIndex: 999999,
                opacity: 0.7
              }} />
            )}

            {/* Elements */}
            {[...elements].sort((a, b) => a.zIndex - b.zIndex).map(el => {
              if (el.isHidden) return null;

              return (
                <Rnd
                  key={el.id}
                  size={{ 
                    width: el.width, 
                    height: el.type === 'text' ? 'auto' : el.height 
                  }}
                  position={{ x: el.x, y: el.y }}
                  scale={zoom}
                  resizeHandleStyles={mobileResizeHandles}
                  disableDragging={el.isLocked}
                  enableResizing={
                    !el.isLocked && selectedElementId === el.id
                      ? {
                          top: false,
                          right: true,
                          bottom: el.type !== 'text',
                          left: true,
                          topRight: true,
                          bottomRight: el.type !== 'text',
                          bottomLeft: el.type !== 'text',
                          topLeft: true,
                        }
                      : false
                  }
                  onDragStop={(e, d) => {
                    updateElement(el.id, { x: Math.round(d.x), y: Math.round(d.y) });
                    setSnapLines({ x: null, y: null });
                  }}
                  onDrag={(e, d) => {
                    const textH = canvasRef.current?.querySelector(`#text-content-${el.id}`)?.clientHeight || el.height;
                    handleDrag(el.id, d, el.width, el.type === 'text' ? textH : el.height);
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    updateElement(el.id, {
                      width: Math.round(ref.offsetWidth),
                      height: Math.round(ref.offsetHeight),
                      ...position,
                    });
                  }}
                  bounds="parent"
                  style={{
                    zIndex: el.zIndex,
                  }}
                >
                  <div
                    className={`element ${selectedElementId === el.id ? 'selected' : ''}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      transform: `rotate(${el.rotation || 0}deg)`,
                      opacity: (el.opacity ?? 100) / 100,
                      boxShadow: el.glow || 'none',
                      filter: getShadowStyle(el),
                      overflow: 'visible',
                      background: el.type === 'shape' ? (el.backgroundStyle || el.color || 'none') : 'none',
                      borderRadius: el.type === 'shape' && el.content === 'circle' ? '50%' : `${el.borderRadius || 0}px`,
                      border: el.borderStyle || 'none',
                      backdropFilter: el.backdropFilter || 'none',
                      position: 'relative',
                    }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setSelectedElementId(el.id); 
                    }}
                  >
                    {el.isLocked && (
                      <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '4px', zIndex: 20, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </div>
                    )}
                    
                    {el.type === 'text' && (
                      <div
                        id={`text-content-${el.id}`}
                        contentEditable={selectedElementId === el.id && !el.isLocked}
                        suppressContentEditableWarning
                        style={{
                          display: 'block',
                          width: '100%',
                          height: 'auto',
                          minHeight: `${(el.fontSize || 16) * (el.lineHeight || 1.2)}px`,
                          color: el.color || '#ffffff',
                          fontFamily: el.fontFamily || 'Outfit',
                          fontSize: `${el.fontSize || 16}px`,
                          fontWeight: el.fontWeight || 400,
                          textAlign: el.textAlign || 'left',
                          lineHeight: el.lineHeight || 1.2,
                          letterSpacing: `${el.letterSpacing || 0}px`,
                          textTransform: el.isUppercase ? 'uppercase' : 'none',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          outline: selectedElementId === el.id ? '1px dashed rgba(255,45,141,0.5)' : 'none',
                          border: 'none',
                          padding: '4px',
                          margin: 0,
                          cursor: el.isLocked ? 'not-allowed' : (selectedElementId === el.id ? 'text' : 'move'),
                          userSelect: selectedElementId === el.id ? 'text' : 'none',
                          boxSizing: 'border-box',
                          background: el.textGradientEnabled 
                            ? `linear-gradient(135deg, ${el.textGradientColor1 || '#FF2D8D'}, ${el.textGradientColor2 || '#00E0FF'})`
                            : 'none',
                          WebkitBackgroundClip: el.textGradientEnabled ? 'text' : 'unset',
                          WebkitTextFillColor: el.textGradientEnabled ? 'transparent' : 'unset',
                          textShadow: el.shadowEnabled 
                            ? `${el.shadowOffsetX ?? 0}px ${el.shadowOffsetY ?? 6}px ${el.shadowBlur ?? 15}px ${el.shadowColor || '#000000'}`
                            : el.textGlowEnabled
                            ? `0 0 ${el.textGlowBlur || 15}px ${el.textGlowColor || '#FF2D8D'}`
                            : 'none',
                          WebkitTextStroke: el.textStrokeWidth ? `${el.textStrokeWidth}px ${el.textStrokeColor || '#000000'}` : 'none',
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onInput={(e) => {
                          if (selectedElementId === el.id) {
                            const target = e.target as HTMLDivElement;
                            updateElement(el.id, { content: target.innerText });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {(el.isUppercase ? el.content.toUpperCase() : el.content)
                          .split('\n')
                          .map((line, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <br />}
                              {line || '\u200B'}
                            </React.Fragment>
                          ))}
                      </div>
                    )}
                    
                    {el.type === 'shape' && (
                      <div className={`shape ${el.content}`} style={{ width: '100%', height: '100%', borderRadius: el.content === 'circle' ? '50%' : `${el.borderRadius || 0}px` }}></div>
                    )}
                    
                    {el.type === 'image' && (
                      <img 
                        src={el.content} 
                        alt="Design Element" 
                        style={{ 
                          width: '100%', height: '100%', objectFit: el.objectFit || 'cover', 
                          filter: el.isBackgroundRemoved ? 'drop-shadow(0 0 15px rgba(255,45,141,0.6))' : 'none',
                          borderRadius: el.borderRadius || 0
                        }} 
                        onDragStart={(e) => e.preventDefault()}
                      />
                    )}
                    {selectedElementId === el.id && !el.isLocked && (
                      <div className="resize-overlay">
                        <div className="resize-handle nw" />
                        <div className="resize-handle ne" />
                        <div className="resize-handle sw" />
                        <div className="resize-handle se" />
                      </div>
                    )}
                  </div>
                </Rnd>
              );
            })}
            </div>
            
            {/* Keyboard base mockup rendered in the wrapper */}
            {selectedMockup === 'notebook' && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '-10%',
                  width: '120%',
                  height: '20px',
                  background: 'linear-gradient(to bottom, #d1d1d6 0%, #a1a1a5 100%)',
                  borderBottomLeftRadius: '10px',
                  borderBottomRightRadius: '10px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                  zIndex: 999999,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}
              >
                <div style={{ width: '80px', height: '4px', background: '#8e8e93', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}></div>
              </div>
            )}
          </div>

          {/* Slide Manager Bar */}
          {canvasFormat.name === 'carousel' && (
            <div className="slide-manager-bar">
              <div className="slides-strip">
                {slides.map((slide: any, idx: number) => (
                  <div 
                    key={slide.id} 
                    className={`slide-thumb ${currentSlideIndex === idx ? 'active' : ''}`}
                    onClick={() => setCurrentSlideIndex(idx)}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', idx.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      if (!isNaN(fromIndex) && fromIndex !== idx) {
                        reorderSlides(fromIndex, idx);
                      }
                    }}
                  >
                    <div className="thumb-preview" style={{ background: slide.background?.type === 'color' ? slide.background.value : 'none' }}>
                      <span>{idx + 1}</span>
                    </div>
                    <div className="thumb-actions">
                      <button onClick={(e) => { e.stopPropagation(); duplicateSlide(idx); }} title={t('common.duplicate')}><Plus size={12} /></button>
                      <button onClick={(e) => { e.stopPropagation(); removeSlide(idx); }} title={t('common.delete')}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                <button className="add-slide-btn" onClick={addSlide}>
                  <Plus size={20} />
                  <span>{t('editor.add_slide')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Settings */}
        <div className={`editor-right-panel ${mobilePropsOpen ? 'sheet-open' : ''}`}>
          <div className="mobile-sheet-header">
            <span className="mobile-sheet-grip" />
            <button className="mobile-sheet-close" onClick={() => setMobilePropsOpen(false)} aria-label="Fechar propriedades">
              <X size={20} />
            </button>
          </div>
          {selectedElement ? (
            <div className="settings-pane">
              <div className="settings-panel-header">
                <h3>{selectedElement.type === 'image' ? t('editor.image') : selectedElement.type === 'text' ? t('editor.text') : t('editor.shape')}</h3>
                <button className="icon-btn-sm" onClick={() => removeElement(selectedElement.id)}><Trash2 size={16} /></button>
              </div>

              {/* Position & Size */}
              <div className="settings-section">
                <label>{t('editor.position_size')}</label>
                <div className="settings-grid-2">
                  <div className="input-group">
                    <span className="label-xs">{t('editor.width')}</span>
                    <input type="number" value={Math.round(selectedElement.width)} onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} />
                  </div>
                  <div className="input-group">
                    <span className="label-xs">{t('editor.height')}</span>
                    <input type="number" value={Math.round(selectedElement.height)} onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} />
                  </div>
                </div>
              </div>

              {/* Opacidade */}
              <div className="settings-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <label style={{ margin: 0 }}>Opacidade</label>
                  <span>{selectedElement.opacity ?? 100}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={selectedElement.opacity ?? 100} 
                  onChange={(e) => updateElement(selectedElement.id, { opacity: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              {/* Canto Arredondado */}
              {(selectedElement.type === 'image' || selectedElement.type === 'shape') && (
                <div className="settings-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <label style={{ margin: 0 }}>Arredondamento</label>
                    <span>{selectedElement.borderRadius || 0}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={selectedElement.borderRadius || 0} 
                    onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>
              )}

              {/* Typography */}
              {selectedElement.type === 'text' && (
                <>
                  <div className="settings-section">
                    <label>{t('editor.typography')}</label>
                     <select 
                      className="w-full mb-2"
                      value={selectedElement.fontFamily} 
                      onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                    >
                      <optgroup label="Elegant (Serif)">
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Cormorant Garamond">Cormorant Garamond</option>
                      </optgroup>
                      <optgroup label="Strong Headlines">
                        <option value="Anton">Anton</option>
                        <option value="Archivo Black">Archivo Black</option>
                      </optgroup>
                      <optgroup label="Premium Caligrafia (Cursive)">
                        <option value="Great Vibes">Great Vibes</option>
                        <option value="Sacramento">Sacramento</option>
                        <option value="Parisienne">Parisienne</option>
                        <option value="Alex Brush">Alex Brush</option>
                      </optgroup>
                      <optgroup label="Modern Clean">
                        <option value="Outfit">Outfit</option>
                        <option value="Inter">Inter</option>
                        <option value="Readex Pro">Readex Pro</option>
                      </optgroup>
                      <optgroup label="Minimal Body">
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                      </optgroup>
                    </select>
                    <div className="settings-grid-2">
                      <div className="input-group">
                        <span className="label-xs">PT</span>
                        <input type="number" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} />
                      </div>
                      <div className="toolbar-btns">
                        <button 
                          className={selectedElement.fontWeight === 800 || selectedElement.fontWeight === 'bold' ? 'active' : ''} 
                          onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 800 ? 400 : 800 })}
                        ><Bold size={16} /></button>
                        <button 
                          className={selectedElement.isUppercase ? 'active' : ''} 
                          onClick={() => updateElement(selectedElement.id, { isUppercase: !selectedElement.isUppercase })}
                          style={{ fontWeight: 800, fontSize: '0.7rem' }}
                        >TT</button>
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <label>{t('editor.spacing_line')}</label>
                    <div className="settings-grid-2">
                      <div className="input-group">
                        <span className="label-xs">Entrelinha</span>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={selectedElement.lineHeight || 1.2} 
                          onChange={(e) => updateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) })} 
                        />
                      </div>
                      <div className="input-group">
                        <span className="label-xs">Espaçamento</span>
                        <input 
                          type="number" 
                          value={selectedElement.letterSpacing || 0} 
                          onChange={(e) => updateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) })} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <label>{t('editor.alignment')}</label>
                    <div className="alignment-toolbar">
                      <button className={selectedElement.textAlign === 'left' ? 'active' : ''} onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}><AlignLeft size={16} /></button>
                      <button className={selectedElement.textAlign === 'center' ? 'active' : ''} onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}><AlignCenter size={16} /></button>
                      <button className={selectedElement.textAlign === 'right' ? 'active' : ''} onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}><AlignRight size={16} /></button>
                    </div>
                  </div>

                  {/* Efeitos de Texto Premium */}
                  <div className="settings-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ margin: 0 }}>Gradiente no Texto</label>
                      <label className="switch" style={{ margin: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={!!selectedElement.textGradientEnabled} 
                          onChange={(e) => updateElement(selectedElement.id, { textGradientEnabled: e.target.checked })} 
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    {selectedElement.textGradientEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div>
                          <span className="label-xs">Cor Inicial</span>
                          <ColorPicker 
                            color={selectedElement.textGradientColor1 || '#FF2D8D'} 
                            onChange={(c) => updateElement(selectedElement.id, { textGradientColor1: c })}
                            brandColors={getBrandColorsArray(projectBranding)}
                            history={colorHistory}
                          />
                        </div>
                        <div>
                          <span className="label-xs">Cor Final</span>
                          <ColorPicker 
                            color={selectedElement.textGradientColor2 || '#00E0FF'} 
                            onChange={(c) => updateElement(selectedElement.id, { textGradientColor2: c })}
                            brandColors={getBrandColorsArray(projectBranding)}
                            history={colorHistory}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="settings-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ margin: 0 }}>Glow Neon no Texto</label>
                      <label className="switch" style={{ margin: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={!!selectedElement.textGlowEnabled} 
                          onChange={(e) => updateElement(selectedElement.id, { textGlowEnabled: e.target.checked })} 
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    {selectedElement.textGlowEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div>
                          <span className="label-xs">Cor do Glow</span>
                          <ColorPicker 
                            color={selectedElement.textGlowColor || '#FF2D8D'} 
                            onChange={(c) => updateElement(selectedElement.id, { textGlowColor: c })}
                            brandColors={getBrandColorsArray(projectBranding)}
                            history={colorHistory}
                          />
                        </div>
                        <div className="input-group-slider">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span>Intensidade (Blur)</span>
                            <span>{selectedElement.textGlowBlur || 15}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="5" 
                            max="50" 
                            value={selectedElement.textGlowBlur || 15} 
                            onChange={(e) => updateElement(selectedElement.id, { textGlowBlur: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="settings-section">
                    <label>Contorno do Texto (Stroke)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div className="input-group-slider">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span>Espessura</span>
                          <span>{selectedElement.textStrokeWidth || 0}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          value={selectedElement.textStrokeWidth || 0} 
                          onChange={(e) => updateElement(selectedElement.id, { textStrokeWidth: parseInt(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                      </div>
                      {!!selectedElement.textStrokeWidth && (
                        <div>
                          <span className="label-xs">Cor do Contorno</span>
                          <ColorPicker 
                            color={selectedElement.textStrokeColor || '#000000'} 
                            onChange={(c) => updateElement(selectedElement.id, { textStrokeColor: c })}
                            brandColors={getBrandColorsArray(projectBranding)}
                            history={colorHistory}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Image Layout Controls */}
              {selectedElement.type === 'image' && (
                <>
                  <div className="settings-section">
                    <label>Ajuste de Imagem (Preencher/Ajustar)</label>
                    <div className="settings-grid-2">
                      <button className="btn-secondary text-xs" style={{ fontSize: '0.75rem', padding: '0.5rem' }} onClick={() => handleFillCanvas(selectedElement)}>Preencher Canvas</button>
                      <button className="btn-secondary text-xs" style={{ fontSize: '0.75rem', padding: '0.5rem' }} onClick={() => handleFitToCanvas(selectedElement)}>Ajustar no Canvas</button>
                    </div>
                  </div>

                  <div className="settings-section">
                    <label>Enquadramento da Imagem (Object-Fit)</label>
                    <div className="alignment-toolbar">
                      <button 
                        className={selectedElement.objectFit === 'cover' || !selectedElement.objectFit ? 'active' : ''} 
                        onClick={() => updateElement(selectedElement.id, { objectFit: 'cover' })}
                        style={{ fontSize: '0.75rem', flex: 1 }}
                      >
                        Cover (Cortar)
                      </button>
                      <button 
                        className={selectedElement.objectFit === 'contain' ? 'active' : ''} 
                        onClick={() => updateElement(selectedElement.id, { objectFit: 'contain' })}
                        style={{ fontSize: '0.75rem', flex: 1 }}
                      >
                        Contain (Inteira)
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Shape-specific styling */}
              {selectedElement.type === 'shape' && (
                <>
                  <div className="settings-section">
                    <label>Efeito de Forma</label>
                    <select 
                      className="w-full mb-3 select-field"
                      value={selectedElement.backgroundStyle ? 'gradient' : 'solid'}
                      onChange={(e) => {
                        if (e.target.value === 'gradient') {
                          updateElement(selectedElement.id, {
                            backgroundStyle: `linear-gradient(135deg, ${selectedElement.color || '#FF2D8D'}, #7B4DFF)`
                          });
                        } else {
                          updateElement(selectedElement.id, {
                            backgroundStyle: undefined
                          });
                        }
                      }}
                    >
                      <option value="solid">Cor Sólida</option>
                      <option value="gradient">Gradiente Linear</option>
                    </select>
                  </div>

                  {selectedElement.backgroundStyle && (
                    <div className="settings-section">
                      <label>Estilo do Gradiente (CSS)</label>
                      <input 
                        type="text" 
                        className="input-field w-full" 
                        value={selectedElement.backgroundStyle} 
                        onChange={(e) => updateElement(selectedElement.id, { backgroundStyle: e.target.value })} 
                      />
                    </div>
                  )}

                  <div className="settings-section">
                    <label>Efeito de Vidro (Glassmorphism)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        className="btn-secondary w-full" 
                        style={{
                          background: selectedElement.backdropFilter ? 'rgba(255, 45, 141, 0.15)' : '',
                          borderColor: selectedElement.backdropFilter ? 'var(--primary)' : '',
                          justifyContent: 'center'
                        }}
                        onClick={() => {
                          if (selectedElement.backdropFilter) {
                            updateElement(selectedElement.id, {
                              backdropFilter: undefined,
                              borderStyle: undefined,
                              color: '#FF2D8D'
                            });
                          } else {
                            updateElement(selectedElement.id, {
                              color: 'rgba(255, 255, 255, 0.08)',
                              borderRadius: 16,
                              borderStyle: '1px solid rgba(255, 255, 255, 0.15)',
                              backdropFilter: 'blur(16px)'
                            });
                          }
                        }}
                      >
                        {selectedElement.backdropFilter ? 'Remover Efeito Vidro' : 'Aplicar Efeito Vidro'}
                      </button>
                    </div>
                  </div>

                  <div className="settings-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <label style={{ margin: 0 }}>Glow Neon Blur</label>
                      <span>{selectedElement.glow ? 'Ativo' : 'Inativo'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={!!selectedElement.glow} 
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateElement(selectedElement.id, { glow: `0 0 25px ${selectedElement.color || '#FF2D8D'}` });
                          } else {
                            updateElement(selectedElement.id, { glow: undefined });
                          }
                        }} 
                      />
                      <span style={{ fontSize: '0.75rem' }}>Habilitar Glow Neon</span>
                    </div>
                    {selectedElement.glow && (
                      <input 
                        type="text" 
                        className="input-field w-full mt-2" 
                        value={selectedElement.glow} 
                        onChange={(e) => updateElement(selectedElement.id, { glow: e.target.value })} 
                      />
                    )}
                  </div>

                  <div className="settings-section">
                    <label>Borda / Outline</label>
                    <input 
                      type="text" 
                      className="input-field w-full" 
                      placeholder="Ex: 2px solid #ffffff"
                      value={selectedElement.borderStyle || ''} 
                      onChange={(e) => updateElement(selectedElement.id, { borderStyle: e.target.value || undefined })} 
                    />
                  </div>
                </>
              )}

              {/* Organizar & Camadas */}
              <div className="settings-section">
                <label>Organizar & Camadas</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="alignment-toolbar">
                    <button 
                      onClick={() => moveLayerUp(selectedElement.id)} 
                      title="Subir Camada"
                    >
                      <ChevronUp size={16} /> <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>Subir</span>
                    </button>
                    <button 
                      onClick={() => moveLayerDown(selectedElement.id)} 
                      title="Descer Camada"
                    >
                      <ChevronDown size={16} /> <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>Descer</span>
                    </button>
                  </div>
                  
                  <div className="alignment-toolbar">
                    <button 
                      onClick={() => bringToFront(selectedElement.id)} 
                      title="Trazer para Frente"
                    >
                      <span style={{ fontSize: '0.75rem' }}>Trazer p/ Frente</span>
                    </button>
                    <button 
                      onClick={() => sendToBack(selectedElement.id)} 
                      title="Enviar para Trás"
                    >
                      <span style={{ fontSize: '0.75rem' }}>Enviar p/ Trás</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.5rem' }} 
                      onClick={() => duplicateElement(selectedElement)}
                    >
                      Duplicar
                    </button>
                    <button 
                      className="btn-secondary"
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.5rem',
                        background: selectedElement.isLocked ? 'rgba(255, 45, 141, 0.15)' : '',
                        borderColor: selectedElement.isLocked ? 'var(--primary)' : ''
                      }} 
                      onClick={() => updateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}
                    >
                      {selectedElement.isLocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </div>

                  <button 
                    className="btn-secondary w-full"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.5rem',
                      color: '#ff4d4d',
                      borderColor: 'rgba(255, 77, 77, 0.2)',
                      background: 'rgba(255, 77, 77, 0.05)'
                    }} 
                    onClick={() => removeElement(selectedElement.id)}
                  >
                    Excluir Camada
                  </button>
                </div>
              </div>

              {/* Sombra */}
              <div className="settings-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ margin: 0 }}>Sombra</label>
                  <label className="switch" style={{ margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={!!selectedElement.shadowEnabled} 
                      onChange={(e) => updateElement(selectedElement.id, { shadowEnabled: e.target.checked })} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {selectedElement.shadowEnabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="label-xs" style={{ textTransform: 'none' }}>Predefinição</span>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '2px 8px', fontSize: '0.7rem' }} 
                        onClick={() => updateElement(selectedElement.id, {
                          shadowColor: '#000000',
                          shadowBlur: 20,
                          shadowOffsetX: 0,
                          shadowOffsetY: 8,
                          shadowOpacity: 25
                        })}
                      >Sombra Suave</button>
                    </div>

                    <div className="input-group-slider">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span>Cor</span>
                        <span>{selectedElement.shadowColor || '#000000'}</span>
                      </div>
                      <ColorPicker 
                        color={selectedElement.shadowColor || '#000000'} 
                        onChange={(c) => updateElement(selectedElement.id, { shadowColor: c })}
                        brandColors={getBrandColorsArray(projectBranding)}
                        history={colorHistory}
                      />
                    </div>

                    <div className="input-group-slider">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span>Desfoque (Blur)</span>
                        <span>{selectedElement.shadowBlur ?? 20}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={selectedElement.shadowBlur ?? 20} 
                        onChange={(e) => updateElement(selectedElement.id, { shadowBlur: parseInt(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="input-group-slider">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span>Opacidade</span>
                        <span>{selectedElement.shadowOpacity ?? 25}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={selectedElement.shadowOpacity ?? 25} 
                        onChange={(e) => updateElement(selectedElement.id, { shadowOpacity: parseInt(e.target.value) })}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="settings-grid-2">
                      <div className="input-group-slider">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                          <span>Desloc. X ({selectedElement.shadowOffsetX ?? 0}px)</span>
                        </div>
                        <input 
                          type="range" 
                          min="-50" 
                          max="50" 
                          value={selectedElement.shadowOffsetX ?? 0} 
                          onChange={(e) => updateElement(selectedElement.id, { shadowOffsetX: parseInt(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="input-group-slider">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                          <span>Desloc. Y ({selectedElement.shadowOffsetY ?? 8}px)</span>
                        </div>
                        <input 
                          type="range" 
                          min="-50" 
                          max="50" 
                          value={selectedElement.shadowOffsetY ?? 8} 
                          onChange={(e) => updateElement(selectedElement.id, { shadowOffsetY: parseInt(e.target.value) })}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedElement.type !== 'image' && (
                <div className="settings-section">
                  <label>{t('editor.item_color')}</label>
                  <ColorPicker 
                    color={selectedElement.color || '#ffffff'} 
                    onChange={(c) => {
                      updateElement(selectedElement.id, { color: c });
                      if (!c.includes('gradient')) addToHistory(c);
                    }}
                    brandColors={getBrandColorsArray(projectBranding)}
                    history={colorHistory}
                  />
                </div>
              )}

              {selectedElement.type === 'image' && (
                <button className="btn-sparkle" style={{ width: '100%' }} onClick={handleRemoveBackground} disabled={isProcessing}>
                  <Sparkles size={18} /> {isProcessing ? t('common.processing') : t('editor.remove_bg')}
                </button>
              )}
            </div>
          ) : canvasFormat.id === 'carousel' ? (
            <div className="settings-pane">
              <div className="settings-panel-header">
                <h3>Configurações do Carrossel</h3>
              </div>
              <div className="settings-section">
                <label>Quantidade de slides</label>
                <select 
                  className="input-field select-field w-full" 
                  value={slideCount} 
                  onChange={e => setSlideCount(Number(e.target.value))}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    color: '#ffffff',
                    padding: '8px',
                    borderRadius: '6px',
                    width: '100%',
                    marginTop: '8px'
                  }}
                >
                  <option value={3}>3 slides</option>
                  <option value={5}>5 slides</option>
                  <option value={8}>8 slides</option>
                  <option value={10}>10 slides</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                  Escolha quantos slides serão criados automaticamente ao gerar com Inteligência Artificial.
                </p>
              </div>
            </div>
          ) : (
            <div className="empty-settings">
              <Layers size={40} opacity={0.2} />
              <p>{t('editor.select_element')}</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showFormatModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="format-modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="format-modal"
            >
              <h2>{t('editor.canvas_settings')}</h2>
              <p>{t('editor.modal_instruction')}</p>
              <div className="format-options-grid">
                {formats.map(f => (
                  <button 
                    key={f.id} 
                    className="format-option-card"
                    onClick={() => {
                      setCanvasFormat(f.id);
                      setShowFormatModal(false);
                    }}
                  >
                    <div className={`format-icon-preview ${f.width > f.height ? 'horizontal' : f.width < f.height ? 'vertical' : 'square'}`}></div>
                    <span className="format-name">{f.name}</span>
                    <span className="format-dims">{f.width} x {f.height}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAIModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="format-modal-overlay">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="format-modal ai-gen-modal">
              <div className="ai-modal-header">
                <Sparkles size={24} color="var(--primary)" />
                <h2>Gerador de Conteúdo AI</h2>
              </div>
              <p>O <span className="notranslate" translate="no">PinkLogic</span> criará a estrutura ideal para o seu post.</p>
              
              <div className="ai-form">
                <div className="form-group">
                  <label>Nicho</label>
                  <input type="text" className="input-field" placeholder="Ex: Fitness, Marketing, Lifestyle" value={aiInputs.niche} onChange={e => setAiInputs({...aiInputs, niche: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tópico Central</label>
                  <input type="text" className="input-field" placeholder="Sobre o que é o post?" value={aiInputs.topic} onChange={e => setAiInputs({...aiInputs, topic: e.target.value})} />
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: canvasFormat.id === 'carousel' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Tom de Voz</label>
                    <select className="input-field" value={aiInputs.tone} onChange={e => setAiInputs({...aiInputs, tone: e.target.value})}>
                      <option value="motivational">Motivacional</option>
                      <option value="aggressive">Agressivo/Forte</option>
                      <option value="emotional">Emocional</option>
                    </select>
                  </div>
                  {canvasFormat.id === 'carousel' && (
                    <div className="form-group">
                      <label>Quantidade de slides</label>
                      <select className="input-field" value={slideCount} onChange={e => setSlideCount(Number(e.target.value))}>
                        <option value={3}>3 slides</option>
                        <option value={5}>5 slides</option>
                        <option value={8}>8 slides</option>
                        <option value={10}>10 slides</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                  <button className="btn-secondary" onClick={() => setShowAIModal(false)}>Cancelar</button>
                  <button className="btn-primary" onClick={handleGenerateAI} disabled={!aiInputs.niche}>
                    {isProcessing ? 'Gerando...' : 'Criar Design'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* High Contrast & UX Professional Enhancements */
        .editor-layout .btn-secondary {
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.28) !important;
          color: #FFFFFF !important;
          opacity: 1 !important;
        }
        .editor-layout .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.16) !important;
          border-color: rgba(255, 255, 255, 0.45) !important;
          color: #FFFFFF !important;
        }
        .editor-layout .btn-secondary:disabled {
          opacity: 0.45 !important;
          background: rgba(255, 255, 255, 0.02) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
          color: rgba(255, 255, 255, 0.45) !important;
          cursor: not-allowed !important;
        }
        .editor-layout .btn-primary {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%) !important;
          border: none !important;
          color: #FFFFFF !important;
          opacity: 1 !important;
        }
        .editor-layout .btn-primary:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 15px rgba(255, 47, 191, 0.35) !important;
        }
        .editor-layout .btn-primary:disabled {
          opacity: 0.45 !important;
          background: rgba(255, 255, 255, 0.05) !important;
          color: rgba(255, 255, 255, 0.45) !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }
        .editor-layout input, 
        .editor-layout select, 
        .editor-layout textarea, 
        .editor-layout .input-field, 
        .editor-layout .select-field {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.22) !important;
          color: #FFFFFF !important;
          opacity: 1 !important;
        }
        .editor-layout input:focus, 
        .editor-layout select:focus, 
        .editor-layout textarea:focus, 
        .editor-layout .input-field:focus, 
        .editor-layout .select-field:focus {
          border-color: var(--primary) !important;
          background: rgba(255, 255, 255, 0.09) !important;
          box-shadow: 0 0 0 2px rgba(255, 47, 191, 0.15) !important;
        }
        .editor-layout label, 
        .editor-layout .settings-section label, 
        .editor-layout .ai-form label {
          color: #FFFFFF !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
        }
        .editor-layout input::placeholder, 
        .editor-layout textarea::placeholder, 
        .editor-layout .input-field::placeholder {
          color: rgba(255, 255, 255, 0.75) !important;
          opacity: 1 !important;
        }
        .flanking-arrow {
          background: rgba(15, 15, 15, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: #FFFFFF !important;
          opacity: 0.85 !important;
          transition: var(--transition) !important;
        }
        .flanking-arrow:hover:not(:disabled) {
          opacity: 1 !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
        }
        .flanking-arrow:disabled {
          opacity: 0.3 !important;
          cursor: not-allowed !important;
        }
        button svg, .editor-header svg, .property-bar svg {
          opacity: 1 !important;
        }

        .btn-ai-magic {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%);
          color: white;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 4px 15px rgba(255, 47, 191, 0.25);
        }

        .btn-ai-magic:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 47, 191, 0.4);
          background: linear-gradient(135deg, #956DFF 0%, #FF5CCF 100%);
        }

        .ai-gen-modal {
          width: 450px;
          padding: 2.5rem;
        }

        .ai-modal-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .ai-modal-header h2 {
          margin: 0;
        }

        .ai-form {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .ai-form label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .editor-layout {
          height: calc(100vh - var(--header-height));
          display: flex;
          flex-direction: column;
          background: var(--background);
          overflow: hidden;
          position: fixed;
          top: var(--header-height);
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
        }

        .editor-header {
          height: 60px;
          background: #09090D;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
        }

        .editor-header-left, .editor-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .format-selector select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: white;
          padding: 0.4rem 2rem 0.4rem 0.8rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFFFFF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.6rem center;
          background-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .format-selector select:hover {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-md);
          color: #FFFFFF;
        }

        .zoom-controls button {
          color: #FFFFFF;
          opacity: 0.9;
          transition: var(--transition);
          background: none;
          border: none;
          cursor: pointer;
        }

        .zoom-controls button:hover {
          opacity: 1;
          color: var(--primary);
        }

        .editor-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .editor-left-panel, .editor-right-panel {
          background: #09090D;
          border-color: rgba(255, 255, 255, 0.08);
        }

        .editor-left-panel {
          width: 360px;
          display: flex;
          border-right: 1px solid var(--border);
        }

        .editor-right-panel {
          width: 320px;
          border-left: 1px solid var(--border);
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-tabs {
          width: 80px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem 0;
        }

        .panel-tabs button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          color: #A1A1B5;
          font-size: 0.65rem;
          padding: 0.75rem 0;
          transition: var(--transition);
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.85;
        }

        .panel-tabs button:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.03);
          opacity: 1;
        }

        .panel-tabs button.active {
          color: var(--primary);
          background: rgba(255, 47, 191, 0.08);
          font-weight: 700;
          opacity: 1;
        }

        .panel-content {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .tab-pane h3 {
          font-size: 0.95rem;
          font-family: var(--font-heading);
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: white;
        }

        .elements-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .shape-thumb {
          height: 80px;
          background: rgba(255, 255, 255, 0.01);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          transition: var(--transition);
          cursor: pointer;
        }

        .shape-thumb.circle { border-radius: 50%; }
        
        .shape-thumb:hover { 
          border-color: var(--primary); 
          background: rgba(255, 47, 191, 0.03);
          box-shadow: 0 0 10px rgba(255, 47, 191, 0.1);
        }

        .text-presets {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .text-preset {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          text-align: left;
          transition: var(--transition);
          color: white;
          cursor: pointer;
        }

        .text-preset.title { font-size: 1.2rem; font-weight: 700; font-family: var(--font-heading); }
        .text-preset.subtitle { font-size: 0.95rem; font-weight: 500; }
        .text-preset:hover { 
          border-color: var(--primary); 
          background: rgba(255, 47, 191, 0.02);
        }

        .editor-workspace {
          flex: 1;
          background: #07070A;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: auto;
          position: relative;
          padding: 2rem 1rem;
        }

        .canvas-wrapper {
          box-shadow: var(--shadow-lg);
          transition: width 0.2s ease, height 0.2s ease;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .canvas-container {
          position: relative;
          background-size: cover;
          background-position: center;
          transition: transform 0.15s ease;
          overflow: hidden;
          background: white;
          flex-shrink: 0;
          transform-origin: center center;
        }

        .upload-area {
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          padding: 3rem 1.5rem;
          text-align: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.005);
        }

        .upload-area:hover {
          border-color: var(--primary);
          background: rgba(255, 47, 191, 0.03);
          color: var(--primary);
        }

        .settings-section {
          margin-bottom: 1.5rem;
        }

        .settings-section label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .format-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(5, 5, 8, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.15s ease-out;
        }

        .format-modal {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          max-width: 800px;
          width: 100%;
          text-align: center;
          box-shadow: var(--shadow-lg), var(--shadow-glow-purple);
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .format-modal h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .format-modal p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .format-options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        .format-option-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          transition: var(--transition);
          cursor: pointer;
        }

        .format-option-card:hover {
          border-color: var(--primary);
          background: rgba(255, 47, 191, 0.04);
          transform: translateY(-4px);
          box-shadow: 0 4px 15px rgba(255, 47, 191, 0.1);
        }

        .format-icon-preview {
          width: 40px;
          height: 40px;
          border: 1.5px solid var(--text-secondary);
          opacity: 0.5;
          border-radius: var(--radius-xs);
          transition: var(--transition);
        }

        .format-option-card:hover .format-icon-preview {
          border-color: var(--primary);
          opacity: 1;
        }

        .format-icon-preview.vertical { height: 60px; }
        .format-icon-preview.horizontal { width: 60px; }
        .format-icon-preview.square { width: 50px; height: 50px; }

        .format-name {
          font-weight: var(--font-weight-semibold);
          font-size: 0.9rem;
          color: white;
        }

        .format-dims {
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-family: monospace;
        }

        .brand-colors-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .canvas-dimension-label {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          background: rgba(17, 17, 24, 0.85);
          padding: 6px 12px;
          border-radius: var(--radius-pill);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border);
          z-index: 10;
        }

        .dim-tag {
          color: var(--primary);
          font-weight: 700;
          font-family: monospace;
          font-size: 0.72rem;
          background: rgba(255, 47, 191, 0.1);
          padding: 2px 8px;
          border-radius: var(--radius-xs);
        }

        .gradient-presets {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .gradient-thumb {
          height: 60px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: var(--transition);
        }

        .gradient-thumb:hover { 
          transform: scale(1.04);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .settings-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .input-group {
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          padding: 0 0.5rem;
          transition: var(--transition);
        }

        .input-group:focus-within {
          border-color: var(--primary);
        }

        .label-xs { font-size: 0.6rem; color: var(--text-secondary); font-weight: 800; text-transform: uppercase; }
        
        .input-group input {
          width: 100%;
          background: none;
          border: none;
          color: white;
          padding: 0.5rem;
          font-size: 0.8rem;
          outline: none;
          text-align: right;
        }

        .alignment-toolbar, .toolbar-btns {
          display: flex;
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .alignment-toolbar button, .toolbar-btns button {
          flex: 1;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: var(--transition);
          background: none;
          border: none;
          cursor: pointer;
        }

        .alignment-toolbar button.active, .toolbar-btns button.active {
          background: var(--primary);
          color: white;
        }

        .alignment-toolbar button:hover { background: rgba(255,255,255,0.03); }

        .settings-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .resize-overlay {
          position: absolute;
          inset: -4px;
          border: 2px solid var(--primary);
          pointer-events: none;
          z-index: 10;
          box-shadow: 0 0 10px rgba(255, 47, 191, 0.3);
        }

        .resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: white;
          border: 2px solid var(--primary);
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
          z-index: 15;
          transition: transform 0.15s;
        }

        .resize-handle:hover {
          transform: scale(1.3);
        }

        .resize-handle.nw { top: -5px; left: -5px; }
        .resize-handle.ne { top: -5px; right: -5px; }
        .resize-handle.sw { bottom: -5px; left: -5px; }
        .resize-handle.se { bottom: -5px; right: -5px; }

        .color-circle.active {
          border: 2px solid white;
          transform: scale(1.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-color-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 2px dashed var(--border);
          overflow: hidden;
          position: relative;
        }

        .custom-color-btn input {
          position: absolute;
          inset: -10px;
          cursor: pointer;
        }

        .slide-manager-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: #09090D;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1.5rem;
          display: flex;
          align-items: center;
          overflow-x: auto;
          z-index: 10;
        }

        .slides-strip {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .slide-thumb {
          width: 60px;
          height: 80px;
          border-radius: var(--radius-sm);
          border: 2px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
          position: relative;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .slide-thumb.active {
          border-color: var(--primary);
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(255, 47, 191, 0.45);
        }

        .thumb-preview {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          opacity: 1;
          color: #FFFFFF;
        }

        .thumb-actions {
          position: absolute;
          top: -10px;
          right: -10px;
          display: none;
          gap: 4px;
        }

        .slide-thumb:hover .thumb-actions {
          display: flex;
        }

        .thumb-actions button {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #09090D;
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.7rem;
        }

        .thumb-actions button:hover {
          background: var(--primary);
          border-color: var(--primary);
        }

        .add-slide-btn {
          width: 60px;
          height: 80px;
          border: 2px dashed rgba(255, 255, 255, 0.25);
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          color: #A1A1B5;
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.6rem;
          background: none;
        }

        .add-slide-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(255, 47, 191, 0.05);
        }

        .slide-counter {
          font-size: 0.8rem;
          color: #FFFFFF;
          margin-right: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-md);
        }

        /* Toggle Switch styling */
        .switch {
          position: relative;
          display: inline-block;
          width: 38px;
          height: 20px;
        }

        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider.round {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .4s;
          border-radius: 34px;
        }

        .slider.round:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider.round {
          background-color: var(--primary);
        }

        input:checked + .slider.round:before {
          transform: translateX(18px);
        }
        
        .resize-handle {
          cursor: nwse-resize;
        }
        .resize-handle.ne, .resize-handle.sw {
          cursor: nesw-resize;
        }

        /* ───────────── Mobile (≤768px): canvas no centro, ferramentas em barra inferior + bottom sheets ───────────── */
        .mobile-only,
        .mobile-sheet-header,
        .editor-more-btn {
          display: none;
        }

        .editor-header-more {
          display: contents;
        }

        @media (max-width: 768px) {
          .editor-layout {
            --editor-tabbar-h: calc(64px + env(safe-area-inset-bottom, 0px));
            height: auto;
            bottom: var(--editor-tabbar-h);
          }

          /* Header do editor: compacto, sem overflow */
          .editor-header {
            height: 56px;
            padding: 0 0.5rem;
            gap: 0.4rem;
          }
          .editor-header-left,
          .editor-header-right {
            gap: 0.4rem;
            min-width: 0;
          }
          .editor-header-left {
            flex: 1;
          }
          .editor-header-left .icon-btn {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
          }
          .format-selector {
            min-width: 0;
            flex: 1;
          }
          .format-selector select {
            width: 100%;
            max-width: 160px;
            min-height: 40px;
            font-size: 0.75rem;
            padding-left: 0.6rem;
            text-overflow: ellipsis;
          }
          .zoom-controls {
            gap: 0.1rem;
            padding: 0.1rem 0.2rem;
          }
          .zoom-controls span {
            font-size: 0.7rem;
            min-width: 34px;
            text-align: center;
          }
          .zoom-controls button {
            width: 34px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          }
          .btn-ai-magic {
            width: 40px;
            height: 40px;
            padding: 0 !important;
            justify-content: center;
          }
          .btn-ai-magic span {
            display: none;
          }
          .editor-more-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            flex-shrink: 0;
          }
          .editor-header-more {
            display: none;
          }
          .editor-header-more.open {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
            position: fixed;
            top: calc(var(--header-height) + 60px);
            right: 0.5rem;
            width: min(320px, calc(100vw - 1rem));
            max-height: 70vh;
            overflow-y: auto;
            padding: 0.75rem;
            background: #101016;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 14px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
            z-index: 1400;
          }
          .editor-header-more.open button {
            width: 100%;
            min-height: 44px;
            justify-content: flex-start;
          }
          .editor-header-more .slide-counter {
            font-size: 0.75rem;
            color: var(--text-secondary);
            padding: 0 0.25rem;
          }
          .editor-more-backdrop {
            position: fixed;
            inset: 0;
            z-index: 1350;
          }

          /* Canvas é o elemento principal */
          .editor-workspace {
            padding: 12px !important;
          }
          /* Sheet aberto: o canvas encolhe para o espaço livre acima dele (continua visível) */
          .editor-layout.mobile-sheet-open .editor-workspace {
            padding-bottom: calc(50vh + 12px) !important;
          }
          .property-bar {
            display: none !important;
          }
          .slide-manager-bar {
            height: 84px;
            padding: 0.5rem 0.75rem;
          }
          .canvas-container .resize-handle {
            transform: scale(var(--handle-scale, 1));
          }

          /* Ferramentas: barra inferior fixa */
          .editor-left-panel {
            width: 0;
            border: none;
          }
          .panel-tabs {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            width: auto;
            height: var(--editor-tabbar-h);
            padding: 0 4px env(safe-area-inset-bottom, 0px);
            flex-direction: row;
            align-items: center;
            gap: 0;
            overflow-x: auto;
            border-right: none;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: #09090D;
            z-index: 1200;
            scrollbar-width: none;
          }
          .panel-tabs::-webkit-scrollbar {
            display: none;
          }
          .panel-tabs button {
            flex: 0 0 auto;
            min-width: 64px;
            min-height: 56px;
            padding: 6px 4px;
            font-size: 0.62rem;
            justify-content: center;
          }
          .panel-tabs button.mobile-only {
            display: flex;
          }

          /* Conteúdo das ferramentas e propriedades: bottom sheets sobre o canvas */
          .panel-content,
          .editor-right-panel {
            display: none;
          }
          .editor-left-panel.sheet-open .panel-content,
          .editor-right-panel.sheet-open {
            display: block;
            position: fixed;
            left: 0;
            right: 0;
            bottom: var(--editor-tabbar-h);
            width: auto;
            max-height: 50vh;
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            padding: 0 1rem 1.25rem;
            background: #0D0D12;
            border: none;
            border-top: 1px solid rgba(255, 47, 191, 0.25);
            border-radius: 18px 18px 0 0;
            box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.6);
            z-index: 1150;
          }
          .editor-right-panel.sheet-open {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            z-index: 1160;
          }
          .mobile-sheet-header {
            display: flex;
            align-items: center;
            justify-content: center;
            position: sticky;
            top: 0;
            z-index: 2;
            min-height: 48px;
            margin: 0 -1rem;
            padding: 0 1rem;
            background: #0D0D12;
          }
          .mobile-sheet-grip {
            width: 40px;
            height: 4px;
            border-radius: 2px;
            background: rgba(255, 255, 255, 0.25);
          }
          .mobile-sheet-close {
            position: absolute;
            right: 0.5rem;
            top: 2px;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: #FFFFFF;
            cursor: pointer;
          }

          /* Modais do editor */
          .format-modal-overlay {
            padding: 1rem;
          }
          .format-modal {
            padding: 1.5rem 1rem;
            max-height: calc(100vh - 2rem);
            overflow-y: auto;
          }
          .format-modal h2 {
            font-size: 1.35rem;
          }
          .format-options-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Editor;
