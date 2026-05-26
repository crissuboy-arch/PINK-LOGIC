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
  Image as ImageIcon
} from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { useProjectDesign } from '../../hooks/useProjectDesign';
import { useBrand } from '../../providers/BrandProvider';
import { applyResolvedDesign, getBrandColorsArray } from '../../hooks/applyResolvedDesign';
import { ColorPicker } from '../../components/Editor/ColorPicker';
import type { EditorElement } from '../../contexts/EditorContext';
import { useLanguage } from '../../contexts/LanguageContext';

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

const Editor = () => {
  const { t } = useLanguage();
  const { 
    slides, currentSlideIndex, setCurrentSlideIndex,
    selectedElementId, setSelectedElementId,
    canvasFormat, setCanvasFormat, availableFormats,
    saveProject,
    addSlide, duplicateSlide, removeSlide, updateCurrentSlide,
    colorHistory, addToHistory
  } = useEditor();

  const { projectBranding, cssVariables } = useProjectDesign();
  const { brands: brandKits, activeBrand: activeBrandKit, setActiveBrand: setActiveBrandKit } = useBrand();

  const currentSlide = slides[currentSlideIndex];
  const elements = currentSlide.elements;
  const background = currentSlide.background;

  const [activeTab, setActiveTab] = useState<'elements' | 'text' | 'uploads' | 'background' | 'brand'>('elements');
  const [zoom, setZoom] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const designApplied = useRef(false);

  if (typeof document !== 'undefined' && !designApplied.current) {
    applyResolvedDesign(document.documentElement, { cssVariables });
    designApplied.current = true;
  }

  // Auto-calculate scale/zoom to fit canvas perfectly in the workspace
  useEffect(() => {
    const fitToScreen = () => {
      const workspace = document.querySelector('.editor-workspace') as HTMLElement;
      if (workspace) {
        // Safe area margins: 80px horizontal, 180px vertical (to account for header and slide strip)
        const safeWidth = workspace.clientWidth - 80;
        const safeHeight = workspace.clientHeight - 180;
        
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
  }, [canvasFormat]);

  const [showFormatModal, setShowFormatModal] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInputs, setAiInputs] = useState({ niche: '', topic: '', tone: 'motivational' });

  const selectedElement = elements.find(el => el.id === selectedElementId);

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
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
        }
      } else if (handle === 'sw') {
        if (maintainRatio) {
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = startLeft + (startWidth - newWidth);
        } else {
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          newX = startLeft + (startWidth - newWidth);
        }
      } else if (handle === 'ne') {
        if (maintainRatio) {
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = newWidth / aspectRatio;
          newY = startTop + (startHeight - newHeight);
        } else {
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newY = startTop + (startHeight - newHeight);
        }
      } else if (handle === 'nw') {
        if (maintainRatio) {
          newWidth = Math.max(20, startWidth - deltaX);
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
    setTimeout(() => {
      updateElement(selectedElement.id, { isBackgroundRemoved: true, glow: '0 0 20px rgba(255, 45, 141, 0.5)' });
      setIsProcessing(false);
    }, 2000);
  };

  const handleGenerateAI = () => {
    setIsProcessing(true);
    setShowAIModal(false);
    
    setTimeout(() => {
      // Mock AI Logic based on language
      const samples: any = {
        pt: {
          title: "Domine seu Destino",
          subtitle: "Como a constância vence o talento todos os dias no nicho de {topic}.",
          cta: "Comece sua jornada hoje!"
        },
        en: {
          title: "Master Your Destiny",
          subtitle: "How consistency beats talent every single day in the {topic} niche.",
          cta: "Start your journey today!"
        },
        es: {
          title: "Domina tu Destino",
          subtitle: "Cómo la constancia vence al talento todos los días en el nicho de {topic}.",
          cta: "¡Empieza tu viaje hoy!"
        }
      };

      const lang = localStorage.getItem('language') || 'pt';
      const content = samples[lang as keyof typeof samples] || samples.pt;
      const finalSubtitle = content.subtitle.replace('{topic}', aiInputs.topic || aiInputs.niche);

      const titleEl: EditorElement = {
        id: 'ai-title-' + Date.now(),
        type: 'text',
        content: content.title,
        x: (canvasFormat.width / 2) - 400,
        y: (canvasFormat.height * 0.2),
        width: 800,
        height: 150,
        rotation: 0,
        opacity: 100,
        zIndex: 10,
        fontSize: 84,
        color: '#ffffff',
        fontFamily: 'Anton',
        fontWeight: 800,
        textAlign: 'center',
        lineHeight: 1.1,
        isUppercase: true
      };

      const subtitleEl: EditorElement = {
        id: 'ai-sub-' + Date.now(),
        type: 'text',
        content: finalSubtitle,
        x: (canvasFormat.width / 2) - 450,
        y: titleEl.y + 180,
        width: 900,
        height: 200,
        rotation: 0,
        opacity: 100,
        zIndex: 11,
        fontSize: 42,
        color: '#ff2d8d',
        fontFamily: 'Outfit',
        fontWeight: 600,
        textAlign: 'center',
        lineHeight: 1.3
      };

      const ctaEl: EditorElement = {
        id: 'ai-cta-' + Date.now(),
        type: 'text',
        content: content.cta,
        x: (canvasFormat.width / 2) - 300,
        y: subtitleEl.y + 250,
        width: 600,
        height: 80,
        rotation: 0,
        opacity: 100,
        zIndex: 12,
        fontSize: 28,
        color: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 400,
        textAlign: 'center',
        isUppercase: true,
        letterSpacing: 2
      };

      updateCurrentSlide({ elements: [titleEl, subtitleEl, ctaEl] });
      setIsProcessing(false);
    }, 1500);
  };

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      // Loop through all slides for carousel
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const canvas = document.createElement('canvas');
        canvas.width = canvasFormat.width;
        canvas.height = canvasFormat.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

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
              ctx.fillRect(el.x, el.y, el.width, el.height);
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
        const link = document.createElement('a');
        link.download = `PinkLogic-${canvasFormat.name}-${i + 1}.png`;
        link.href = dataUrl;
        link.click();
        
        // Brief delay between downloads
        if (slides.length > 1) await new Promise(r => setTimeout(r, 500));
      }
    } catch (err) {
      console.error('Export failed', err);
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
            ctx.fillRect(el.x, el.y, el.width, el.height);
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
    <div className="editor-layout">
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
          <div className="slide-counter">
            {canvasFormat.id === 'carousel' ? `Slide ${currentSlideIndex + 1} / ${slides.length}` : (formats.find(f => f.id === canvasFormat.id)?.name || '')}
          </div>
          <button className="btn-secondary" onClick={saveProject}><Save size={18} /> {t('common.save')}</button>
          <button className="btn-secondary" onClick={sendToPublisher} disabled={isProcessing} title="Enviar arte para o composer do Publicador Automático">
            <Sparkles size={18} />
            <span>Agendar Publicação</span>
          </button>
          <button className="btn-primary" onClick={handleExport} disabled={isProcessing}>
            <Download size={18} /> {slides.length > 1 ? t('editor.export_all') : t('common.export')}
          </button>
        </div>
      </div>

      <div className="editor-body">
        {/* Left Toolbar */}
        <div className="editor-left-panel">
          <div className="panel-tabs">
            <button className={activeTab === 'elements' ? 'active' : ''} onClick={() => setActiveTab('elements')}><Square size={20} /><span>{t('editor.elements')}</span></button>
            <button className={activeTab === 'text' ? 'active' : ''} onClick={() => setActiveTab('text')}><Type size={20} /><span>{t('editor.text')}</span></button>
            <button className={activeTab === 'uploads' ? 'active' : ''} onClick={() => setActiveTab('uploads')}><Upload size={20} /><span>{t('editor.uploads')}</span></button>
            <button className={activeTab === 'background' ? 'active' : ''} onClick={() => setActiveTab('background')}><Palette size={20} /><span>{t('editor.background')}</span></button>
            <button className={activeTab === 'brand' ? 'active' : ''} onClick={() => setActiveTab('brand')}><Sparkles size={20} /><span>{t('editor.brand_kit')}</span></button>
          </div>

          <div className="panel-content">
            <AnimatePresence mode="wait">
              {activeTab === 'elements' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="elements" className="tab-pane">
                  <h3>{t('editor.elements')}</h3>
                  <div className="elements-grid">
                    <button onClick={() => addShape('square')} className="shape-thumb square"></button>
                    <button onClick={() => addShape('circle')} className="shape-thumb circle"></button>
                  </div>
                </motion.div>
              )}
              {activeTab === 'text' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="text" className="tab-pane">
                  <h3>{t('editor.text')}</h3>
                  <div className="text-presets">
                    <button className="text-preset title" onClick={() => addText('title')}>{t('editor.add_text_title')}</button>
                    <button className="text-preset subtitle" onClick={() => addText('subtitle')}>{t('editor.add_text_subtitle')}</button>
                    <button className="text-preset body" onClick={() => addText('body')}>{t('editor.add_text_body')}</button>
                  </div>
                </motion.div>
              )}
              {activeTab === 'uploads' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="uploads" className="tab-pane">
                  <h3>{t('editor.uploads')}</h3>
                  <div className="upload-area" onClick={() => (document.getElementById('fileUpload') as any)?.click()}>
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
                          reader.onload = (ev) => addImage(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
              {activeTab === 'background' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="background" className="tab-pane">
                  <h3>{t('editor.background')}</h3>

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
                </motion.div>
              )}
              {activeTab === 'brand' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="brand" className="tab-pane">
                  <h3>{t('editor.brand_kit')}</h3>
                  <div className="brand-kits-list">
                    {brandKits.map(kit => (
                      <button 
                        key={kit.id} 
                        className={`brand-kit-card ${activeBrandKit?.id === kit.id ? 'active' : ''}`}
                        onClick={() => setActiveBrandKit(kit)}
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
            </AnimatePresence>
          </div>
        </div>

        {/* Workspace Center */}
        <div className="editor-workspace" onClick={() => setSelectedElementId(null)}>
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
                position: 'absolute',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                background: 'white',
                border: '1px solid var(--border)',
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
            {/* Canvas Label Overlay */}
            <div className="canvas-dimension-label">
              <span>{formats.find(f => f.id === canvasFormat.id)?.name || canvasFormat.id}</span>
              <span className="dim-tag">{canvasFormat.width} x {canvasFormat.height}</span>
            </div>
              {[...elements].sort((a, b) => a.zIndex - b.zIndex).map(el => (
                <motion.div
                  key={el.id}
                  className={`element ${selectedElementId === el.id ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.type === 'text' ? 'auto' : el.height,
                    rotate: el.rotation,
                    opacity: el.opacity / 100,
                    zIndex: el.zIndex,
                    boxShadow: el.glow,
                    filter: getShadowStyle(el),
                    overflow: 'visible',
                    background: el.type === 'shape' ? el.color : 'none',
                    padding: 0,
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                  drag={!el.isLocked && (selectedElementId !== el.id || el.type !== 'text')}
                  dragMomentum={false}
                  onDragEnd={(_e, info) => {
                    updateElement(el.id, { x: el.x + info.offset.x, y: el.y + info.offset.y });
                  }}
                >
                  {el.isLocked && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '4px', zIndex: 20, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                  )}
                  {el.type === 'text' && (
                    <div
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
                        ))}</div>
                    )}
                    {el.type === 'shape' && (
                  <div className={`shape ${el.content}`} style={{ width: '100%', height: '100%', borderRadius: el.content === 'circle' ? '50%' : '0' }}></div>
                )}
                {el.type === 'image' && (
                  <img 
                    src={el.content} 
                    alt="Design Element" 
                    style={{ 
                      width: '100%', height: '100%', objectFit: 'cover', 
                      filter: el.isBackgroundRemoved ? 'drop-shadow(0 0 15px rgba(255,45,141,0.6))' : 'none',
                      borderRadius: el.borderRadius || 0
                    }} 
                    onDragStart={(e) => e.preventDefault()}
                  />
                )}
                {selectedElementId === el.id && !el.isLocked && (
                  <div className="resize-overlay">
                    <div className="resize-handle nw" onMouseDown={(e) => handleResizeStart(e, el, 'nw')} />
                    <div className="resize-handle ne" onMouseDown={(e) => handleResizeStart(e, el, 'ne')} />
                    <div className="resize-handle sw" onMouseDown={(e) => handleResizeStart(e, el, 'sw')} />
                    <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, el, 'se')} />
                  </div>
                )}
              </motion.div>
              ))}
            </div>
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
        <div className="editor-right-panel">
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
                </>
              )}

              {/* Image Layout Controls */}
              {selectedElement.type === 'image' && (
                <div className="settings-section">
                  <label>Ajuste de Imagem</label>
                  <div className="settings-grid-2">
                    <button className="btn-secondary text-xs" style={{ fontSize: '0.75rem', padding: '0.5rem' }} onClick={() => handleFillCanvas(selectedElement)}>Preencher</button>
                    <button className="btn-secondary text-xs" style={{ fontSize: '0.75rem', padding: '0.5rem' }} onClick={() => handleFitToCanvas(selectedElement)}>Ajustar</button>
                  </div>
                </div>
              )}

              {/* Organizar & Camadas */}
              <div className="settings-section">
                <label>Organizar & Camadas</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="alignment-toolbar">
                    <button 
                      onClick={() => updateElement(selectedElement.id, { zIndex: selectedElement.zIndex + 1 })} 
                      title="Subir Camada"
                    >
                      <ChevronUp size={16} /> <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>Subir</span>
                    </button>
                    <button 
                      onClick={() => updateElement(selectedElement.id, { zIndex: selectedElement.zIndex - 1 })} 
                      title="Descer Camada"
                    >
                      <ChevronDown size={16} /> <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>Descer</span>
                    </button>
                  </div>
                  
                  <div className="alignment-toolbar">
                    <button 
                      onClick={() => {
                        const maxZ = elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) : 0;
                        updateElement(selectedElement.id, { zIndex: maxZ + 1 });
                      }} 
                      title="Trazer para Frente"
                    >
                      <span style={{ fontSize: '0.75rem' }}>Trazer p/ Frente</span>
                    </button>
                    <button 
                      onClick={() => {
                        const minZ = Math.min(...elements.map(e => e.zIndex), 0);
                        updateElement(selectedElement.id, { zIndex: minZ - 1 });
                      }} 
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
              <p>O Pink Logic criará a estrutura ideal para o seu post.</p>
              
              <div className="ai-form">
                <div className="form-group">
                  <label>Nicho</label>
                  <input type="text" className="input-field" placeholder="Ex: Fitness, Marketing, Lifestyle" value={aiInputs.niche} onChange={e => setAiInputs({...aiInputs, niche: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tópico Central</label>
                  <input type="text" className="input-field" placeholder="Sobre o que é o post?" value={aiInputs.topic} onChange={e => setAiInputs({...aiInputs, topic: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tom de Voz</label>
                    <select className="input-field" value={aiInputs.tone} onChange={e => setAiInputs({...aiInputs, tone: e.target.value})}>
                      <option value="motivational">Motivacional</option>
                      <option value="aggressive">Agressivo/Forte</option>
                      <option value="emotional">Emocional</option>
                    </select>
                  </div>
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
        .btn-ai-magic {
          background: linear-gradient(135deg, #7000FF 0%, #FF2D8D 100%);
          color: white;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 4px 15px rgba(112, 0, 255, 0.3);
        }

        .btn-ai-magic:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(112, 0, 255, 0.5);
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
          background: #050508;
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
          background: #0d0d12;
          border-bottom: 1px solid var(--border);
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
          background: var(--input);
          border: 1px solid var(--border);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--input);
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          color: var(--text-secondary);
        }

        .zoom-controls button {
          color: white;
          opacity: 0.7;
          transition: var(--transition);
        }

        .zoom-controls button:hover {
          opacity: 1;
        }

        .editor-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .editor-left-panel {
          width: 360px;
          display: flex;
          background: #0d0d12;
          border-right: 1px solid var(--border);
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
          color: var(--text-secondary);
          font-size: 0.65rem;
          padding: 0.75rem 0;
          transition: var(--transition);
          background: none;
          border: none;
        }

        .panel-tabs button.active {
          color: var(--primary);
          background: rgba(255, 45, 141, 0.05);
        }

        .panel-content {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .tab-pane h3 {
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }

        .elements-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .shape-thumb {
          height: 80px;
          background: var(--input);
          border: 2px solid var(--border);
          border-radius: 12px;
          transition: var(--transition);
        }

        .shape-thumb.circle { border-radius: 50%; }
        .shape-thumb:hover { border-color: var(--primary); }

        .text-presets {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .text-preset {
          padding: 1rem;
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 8px;
          text-align: left;
          transition: var(--transition);
          color: white;
        }

        .text-preset.title { font-size: 1.25rem; font-weight: 700; }
        .text-preset.subtitle { font-size: 1rem; font-weight: 500; }
        .text-preset:hover { border-color: var(--primary); }

        .editor-workspace {
          flex: 1;
          background: #050508;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: auto;
          position: relative;
          padding: 2rem 1rem;
        }

        .canvas-wrapper {
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          transition: width 0.2s ease, height 0.2s ease;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: var(--radius-md);
        }

        .canvas-container {
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
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
          border-radius: 12px;
          padding: 3rem 1.5rem;
          text-align: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .upload-area:hover {
          border-color: var(--primary);
          background: rgba(255, 45, 141, 0.05);
          color: var(--primary);
        }

        .settings-section {
          margin-bottom: 2rem;
        }

        .settings-section label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .format-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(10px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .format-modal {
          background: #0d0d12;
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 800px;
          width: 100%;
          text-align: center;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        .format-modal h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #FF2D8D 0%, #7000FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .format-modal p {
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
        }

        .format-options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .format-option-card {
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          transition: 0.3s;
          cursor: pointer;
        }

        .format-option-card:hover {
          border-color: var(--primary);
          background: rgba(255, 45, 141, 0.05);
          transform: translateY(-5px);
        }

        .format-icon-preview {
          width: 40px;
          height: 40px;
          border: 2px solid var(--text-secondary);
          opacity: 0.5;
          border-radius: 4px;
        }

        .format-icon-preview.vertical { height: 60px; }
        .format-icon-preview.horizontal { width: 60px; }
        .format-icon-preview.square { width: 50px; height: 50px; }

        .format-name {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .format-dims {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-family: 'JetBrains Mono', monospace;
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
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
          background: rgba(13, 13, 18, 0.8);
          padding: 6px 12px;
          border-radius: 20px;
          backdrop-filter: blur(8px);
          border: 1px solid var(--border);
          z-index: 10;
        }

        .dim-tag {
          color: var(--primary);
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          background: rgba(255, 45, 141, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .gradient-presets {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .gradient-thumb {
          height: 60px;
          border-radius: 8px;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: 0.3s;
        }

        .gradient-thumb:hover { transform: scale(1.05); }

        .settings-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .input-group {
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 0.5rem;
        }

        .label-xs { font-size: 0.6rem; color: var(--text-secondary); font-weight: 800; }
        .input-group input {
          width: 100%;
          background: none;
          border: none;
          color: white;
          padding: 0.5rem;
          font-size: 0.85rem;
          outline: none;
          text-align: right;
        }

        .alignment-toolbar, .toolbar-btns {
          display: flex;
          background: var(--input);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .alignment-toolbar button, .toolbar-btns button {
          flex: 1;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: 0.3s;
          background: none;
          border: none;
        }

        .alignment-toolbar button.active, .toolbar-btns button.active {
          background: var(--primary);
          color: white;
        }

        .alignment-toolbar button:hover { background: rgba(255,255,255,0.05); }

        .settings-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .resize-overlay {
          position: absolute;
          inset: -4px;
          border: 2px solid var(--primary);
          pointer-events: none;
          z-index: 10;
        }

        .resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: white;
          border: 1px solid var(--primary);
          border-radius: 50%;
        }

        .resize-handle.nw { top: -4px; left: -4px; }
        .resize-handle.ne { top: -4px; right: -4px; }
        .resize-handle.sw { bottom: -4px; left: -4px; }
        .resize-handle.se { bottom: -4px; right: -4px; }

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
          background: #0d0d12;
          border-top: 1px solid var(--border);
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
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: pointer;
          position: relative;
          transition: 0.3s;
          flex-shrink: 0;
        }

        .slide-thumb.active {
          border-color: var(--primary);
          transform: translateY(-5px);
        }

        .thumb-preview {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          opacity: 0.8;
          color: white;
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
          background: var(--card);
          border: 1px solid var(--border);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .thumb-actions button:hover {
          background: var(--primary);
        }

        .add-slide-btn {
          width: 60px;
          height: 80px;
          border: 2px dashed var(--border);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: 0.3s;
          font-size: 0.6rem;
          background: none;
        }

        .add-slide-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(255, 45, 141, 0.05);
        }

        .slide-counter {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-right: 1rem;
          background: var(--input);
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
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
          background-color: var(--border);
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
      `}</style>
    </div>
  );
};

export default Editor;
