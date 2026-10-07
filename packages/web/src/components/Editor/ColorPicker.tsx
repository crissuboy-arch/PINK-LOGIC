import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  Sparkles
} from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  brandColors?: string[];
  history?: string[];
}

// Utility to convert HEX to HSVA
const hexToHsva = (hex: string) => {
  let r = 0, g = 0, b = 0, a = 1;
  if (hex.startsWith('#')) {
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
  } else if (hex.startsWith('rgba')) {
    const parts = hex.match(/[\d.]+/g);
    if (parts) {
      r = parseInt(parts[0]);
      g = parseInt(parts[1]);
      b = parseInt(parts[2]);
      a = parseFloat(parts[3]);
    }
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, v: v * 100, a };
};

// Utility to convert HSVA to RGBA/HEX
const hsvaToRgba = (h: number, s: number, v: number, a: number) => {
  h /= 360; s /= 100; v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  
  const ri = Math.round(r * 255);
  const gi = Math.round(g * 255);
  const bi = Math.round(b * 255);

  if (a === 1) {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(ri)}${toHex(gi)}${toHex(bi)}`.toUpperCase();
  }
  return `rgba(${ri}, ${gi}, ${bi}, ${a.toFixed(2)})`;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  brandColors = [], 
  history = [] 
}) => {
  const [hsva, setHsva] = useState(() => hexToHsva(color.includes('gradient') ? '#FF2D8D' : color));
  const [mode, setMode] = useState<'solid' | 'gradient'>(color.includes('gradient') ? 'gradient' : 'solid');
  
  // Gradient state
  const [gradientAngle, setGradientAngle] = useState(135);
  const [gradientStart, setGradientStart] = useState('#FF2D8D');
  const [gradientEnd, setGradientEnd] = useState('#7000FF');

  const satBoxRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const alphaSliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!color.includes('gradient')) {
      const newHsva = hexToHsva(color);
      setHsva(newHsva);
    }
  }, [color]);

  const updateColor = (updates: Partial<{ h: number, s: number, v: number, a: number }>) => {
    const next = { ...hsva, ...updates };
    setHsva(next);
    onChange(hsvaToRgba(next.h, next.s, next.v, next.a));
  };

  const handleSatMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (event: any) => {
      if (!satBoxRef.current) return;
      const rect = satBoxRef.current.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      
      updateColor({ s: x * 100, v: (1 - y) * 100 });
    };

    const stop = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', stop);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', stop);
    move(e);
  };

  const handleHueMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (event: any) => {
      if (!hueSliderRef.current) return;
      const rect = hueSliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      updateColor({ h: x * 360 });
    };

    const stop = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    move(e);
  };

  const handleAlphaMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (event: any) => {
      if (!alphaSliderRef.current) return;
      const rect = alphaSliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      updateColor({ a: x });
    };

    const stop = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    move(e);
  };

  const applyGradient = () => {
    const grad = `linear-gradient(${gradientAngle}deg, ${gradientStart} 0%, ${gradientEnd} 100%)`;
    onChange(grad);
  };

  return (
    <div className="advanced-color-picker">
      <div className="picker-tabs">
        <button className={mode === 'solid' ? 'active' : ''} onClick={() => setMode('solid')}>Sólida</button>
        <button className={mode === 'gradient' ? 'active' : ''} onClick={() => setMode('gradient')}>Gradiente</button>
      </div>

      <div className="picker-content">
        {mode === 'solid' ? (
          <>
            <div 
              ref={satBoxRef}
              className="sat-val-box" 
              style={{ background: `hsl(${hsva.h}, 100%, 50%)` }}
              onMouseDown={handleSatMouseDown}
            >
              <div className="sat-val-white">
                <div className="sat-val-black">
                  <div 
                    className="sat-val-pointer" 
                    style={{ left: `${hsva.s}%`, top: `${100 - hsva.v}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="sliders">
              <div 
                ref={hueSliderRef}
                className="hue-slider" 
                onMouseDown={handleHueMouseDown}
              >
                <div className="hue-pointer" style={{ left: `${(hsva.h / 360) * 100}%` }} />
              </div>

              <div 
                ref={alphaSliderRef}
                className="alpha-slider" 
                style={{ background: `linear-gradient(to right, transparent, ${hsvaToRgba(hsva.h, hsva.s, hsva.v, 1)})` }}
                onMouseDown={handleAlphaMouseDown}
              >
                <div className="alpha-pointer" style={{ left: `${hsva.a * 100}%` }} />
              </div>
            </div>

            <div className="input-row">
              <div className="color-preview" style={{ background: hsvaToRgba(hsva.h, hsva.s, hsva.v, hsva.a) }} />
              <div className="hex-input">
                <span>HEX</span>
                <input 
                  type="text" 
                  value={hsvaToRgba(hsva.h, hsva.s, hsva.v, hsva.a)} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val)) {
                      onChange(val);
                    }
                  }}
                />
              </div>
            </div>

            <div className="swatch-section">
              <label><History size={12} /> Histórico</label>
              <div className="swatches-grid">
                {history.slice(0, 5).map((c, i) => (
                  <button key={i} className="swatch-btn" style={{ background: c }} onClick={() => onChange(c)} />
                ))}
              </div>
            </div>

            <div className="swatch-section">
              <label><Sparkles size={12} /> Brand Kit</label>
              <div className="swatches-grid">
                {brandColors.map((c, i) => (
                  <button key={i} className="swatch-btn" style={{ background: c }} onClick={() => onChange(c)} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="gradient-pane">
            <div className="grad-preview-large" style={{ background: `linear-gradient(${gradientAngle}deg, ${gradientStart} 0%, ${gradientEnd} 100%)` }} />
            
            <div className="grad-inputs">
              <div className="grad-input-group">
                <input type="color" value={gradientStart} onChange={(e) => { setGradientStart(e.target.value); applyGradient(); }} />
                <input type="text" value={gradientStart} onChange={(e) => { setGradientStart(e.target.value); applyGradient(); }} />
              </div>
              <div className="grad-input-group">
                <input type="color" value={gradientEnd} onChange={(e) => { setGradientEnd(e.target.value); applyGradient(); }} />
                <input type="text" value={gradientEnd} onChange={(e) => { setGradientEnd(e.target.value); applyGradient(); }} />
              </div>
            </div>

            <div className="angle-picker">
              <div className="angle-label"><span>Ângulo</span> <span>{gradientAngle}°</span></div>
              <input type="range" min="0" max="360" value={gradientAngle} onChange={(e) => { setGradientAngle(parseInt(e.target.value)); applyGradient(); }} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        .advanced-color-picker { background: #15151e; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; width: 100%; }
        .picker-tabs { display: flex; border-bottom: 1px solid var(--border); }
        .picker-tabs button { flex: 1; padding: 0.6rem; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); background: none; border: none; cursor: pointer; transition: 0.2s; }
        .picker-tabs button.active { color: var(--primary); background: rgba(255, 45, 141, 0.05); }
        .picker-content { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
        
        .sat-val-box { height: 150px; position: relative; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); cursor: crosshair; overflow: hidden; }
        .sat-val-white { position: absolute; inset: 0; background: linear-gradient(to right, #fff, transparent); }
        .sat-val-black { position: absolute; inset: 0; background: linear-gradient(to top, #000, transparent); }
        .sat-val-pointer { width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; position: absolute; transform: translate(-50%, -50%); box-shadow: 0 0 5px rgba(0,0,0,0.5); pointer-events: none; }
        
        .sliders { display: flex; flex-direction: column; gap: 0.75rem; }
        .hue-slider { height: 12px; border-radius: 6px; position: relative; cursor: pointer; background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%); }
        .alpha-slider { height: 12px; border-radius: 6px; position: relative; cursor: pointer; background-image: linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px; }
        .hue-pointer, .alpha-pointer { width: 16px; height: 16px; background: white; border-radius: 50%; border: 2px solid #1a1a24; position: absolute; top: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 4px rgba(0,0,0,0.3); pointer-events: none; }
        
        .input-row { display: flex; gap: 0.75rem; align-items: center; }
        .color-preview { width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border); }
        .hex-input { flex: 1; display: flex; align-items: center; gap: 0.5rem; background: var(--input); border: 1px solid var(--border); border-radius: 6px; padding: 0 0.6rem; height: 32px; }
        .hex-input span { font-size: 0.6rem; font-weight: 800; color: var(--text-secondary); }
        .hex-input input { background: none; border: none; color: white; font-size: 0.75rem; font-family: monospace; outline: none; width: 100%; }
        
        .swatch-section { display: flex; flex-direction: column; gap: 0.5rem; }
        .swatch-section label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.65rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
        .swatches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(24px, 1fr)); gap: 0.5rem; }
        .swatch-btn { aspect-ratio: 1; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.2s; }
        .swatch-btn:hover { transform: scale(1.1); border-color: white; }
        
        .grad-preview-large { height: 60px; border-radius: 6px; margin-bottom: 1rem; border: 1px solid var(--border); }
        .grad-inputs { display: flex; flex-direction: column; gap: 0.75rem; }
        .grad-input-group { display: flex; gap: 0.5rem; background: var(--input); border-radius: 6px; padding: 0.2rem 0.5rem; border: 1px solid var(--border); align-items: center; }
        .grad-input-group input[type="color"] { width: 20px; height: 20px; border: none; background: none; padding: 0; }
        .grad-input-group input[type="text"] { background: none; border: none; color: white; font-size: 0.75rem; font-family: monospace; flex: 1; outline: none; }
        
        .angle-picker { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 1rem; }
        .angle-label { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-secondary); }
        .angle-picker input[type="range"] { accent-color: var(--primary); }
      `}</style>
    </div>
  );
};
