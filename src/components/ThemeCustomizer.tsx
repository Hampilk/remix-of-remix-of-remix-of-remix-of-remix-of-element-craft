import React, { useState, useCallback, useMemo } from 'react';
import { 
  Sun, Moon, Monitor, Square, Circle, RectangleHorizontal, Palette, 
  Settings2, Sparkles, Layers, Download, Upload, RotateCcw, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useTheme, 
  ThemeMode, 
  ShapePreset, 
  SolidStyle, 
  EffectStyle, 
  SurfaceStyle, 
  DataStyle, 
  TransitionStyle 
} from '@/contexts/ThemeContext';

// ============================================================================
// Segédfüggvények - HSL ↔ HEX konverzió
// ============================================================================

/**
 * Konvertál HSL színt HEX formátumba.
 * @param hsl - HSL string formátum: "H S% L%" vagy "H S L"
 * @returns HEX string formátum: "#RRGGBB"
 */
const hslToHex = (hsl: string): string => {
  try {
    const parts = hsl.replace(/%/g, '').split(' ').map(parseFloat);
    if (parts.some(isNaN) || parts.length !== 3) {
      console.warn('Invalid HSL input:', hsl);
      return '#3b82f6'; // Alapértelmezett kék
    }

    const [h, s, l] = parts;
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    
    return `#${f(0)}${f(8)}${f(4)}`;
  } catch (error) {
    console.error('HSL to HEX conversion error:', error);
    return '#3b82f6';
  }
};

/**
 * Konvertál HEX színt HSL formátumba.
 * @param hex - HEX string: "#RRGGBB" vagy "RRGGBB"
 * @returns HSL string formátum: "H S% L%"
 */
const hexToHsl = (hex: string): string => {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      console.warn('Invalid HEX input:', hex);
      return '217 91% 60%'; // Alapértelmezett kék
    }

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch (error) {
    console.error('HEX to HSL conversion error:', error);
    return '217 91% 60%';
  }
};

// ============================================================================
// ColorSwatch - Színválasztó komponens
// ============================================================================

interface ColorSwatchProps {
  color: string;
  label: string;
  onChange: (val: string) => void;
  'aria-label'?: string;
}

const ColorSwatch = React.memo<ColorSwatchProps>(({ 
  color, 
  label, 
  onChange, 
  'aria-label': ariaLabel 
}) => {
  const handleColorChange = useCallback((hex: string) => {
    onChange(hexToHsl(hex));
  }, [onChange]);

  const hexColor = useMemo(() => hslToHex(color), [color]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="flex flex-col items-center gap-1.5 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
          aria-label={ariaLabel || `Válassz ${label} színt`}
        >
          <div 
            className="w-10 h-10 rounded-lg border-2 border-border shadow-sm group-hover:ring-2 ring-primary/50 transition-all group-hover:scale-105"
            style={{ backgroundColor: `hsl(${color})` }}
          />
          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <HexColorPicker color={hexColor} onChange={handleColorChange} />
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-[10px] text-muted-foreground space-y-1">
            <div>HEX: <span className="font-mono text-foreground">{hexColor}</span></div>
            <div>HSL: <span className="font-mono text-foreground">{color}</span></div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

ColorSwatch.displayName = 'ColorSwatch';

// ============================================================================
// ToggleGroup - Opciógomb csoport komponens
// ============================================================================

interface ToggleGroupProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (val: T) => void;
  renderOption?: (opt: T) => React.ReactNode;
  'aria-label'?: string;
}

function ToggleGroupComponent<T extends string>({ 
  options, 
  value, 
  onChange,
  renderOption,
  'aria-label': ariaLabel
}: ToggleGroupProps<T>) {
  return (
    <div 
      className="inline-flex border border-border rounded-lg overflow-hidden w-full" 
      role="radiogroup" 
      aria-label={ariaLabel}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 px-3 py-2 text-[11px] font-medium transition-all ${
            value === opt 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
          role="radio"
          aria-checked={value === opt}
          aria-label={renderOption ? undefined : opt.charAt(0).toUpperCase() + opt.slice(1)}
        >
          {renderOption ? renderOption(opt) : opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}

const ToggleGroup = React.memo(ToggleGroupComponent) as typeof ToggleGroupComponent;

// ============================================================================
// ThemeCustomizer - Fő komponens
// ============================================================================

export const ThemeCustomizer: React.FC = () => {
  const { theme, updateTheme, resetTheme } = useTheme();
  const [openAccordions, setOpenAccordions] = useState<string[]>([
    'theme', 'shape', 'color', 'solid', 'effects', 'advanced', 'sizes'
  ]);
  const [error, setError] = useState<string | null>(null);

  // Téma exportálása JSON fájlként
  const exportTheme = useCallback(() => {
    try {
      const themeData = JSON.stringify(theme, null, 2);
      const blob = new Blob([themeData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `theme-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setError(null);
    } catch (err) {
      console.error('Theme export failed:', err);
      setError('Nem sikerült exportálni a témát. Kérlek próbáld újra.');
    }
  }, [theme]);

  // Téma importálása JSON fájlból
  const importTheme = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      
      reader.onload = (ev) => {
        try {
          const result = ev.target?.result;
          if (typeof result !== 'string') {
            throw new Error('Invalid file content');
          }

          const imported = JSON.parse(result);
          
          // Alapvető validáció
          if (!imported || typeof imported !== 'object') {
            throw new Error('Invalid theme format');
          }

          updateTheme(imported);
          setError(null);
        } catch (err) {
          console.error('Theme import failed:', err);
          setError('Érvénytelen téma fájl. Kérlek ellenőrizd, hogy helyes JSON formátumú-e.');
        }
      };

      reader.onerror = () => {
        setError('Nem sikerült beolvasni a fájlt. Kérlek próbáld újra.');
      };

      reader.readAsText(file);
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [updateTheme]);

  // Téma visszaállítása alapértelmezettre
  const handleResetTheme = useCallback(() => {
    if (window.confirm('Biztosan visszaállítod a témát az alapértelmezett értékekre?')) {
      resetTheme();
      setError(null);
    }
  }, [resetTheme]);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg w-80 max-h-[650px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border py-3 px-4 bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Téma Testreszabás</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-secondary" 
            onClick={importTheme} 
            title="Téma importálása"
            aria-label="Téma importálása JSON fájlból"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-secondary" 
            onClick={exportTheme} 
            title="Téma exportálása"
            aria-label="Téma exportálása JSON fájlba"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" 
            onClick={handleResetTheme} 
            title="Alapértelmezett visszaállítása"
            aria-label="Téma visszaállítása alapértelmezettre"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 flex-shrink-0">
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs ml-2">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Content - Scrollable */}
      <div className="p-4 overflow-y-auto flex-1 space-y-2">
        <Accordion type="multiple" value={openAccordions} onValueChange={setOpenAccordions} className="space-y-2">
          
          {/* Téma Mód */}
          <AccordionItem value="theme" className="border border-border rounded-xl px-4 bg-card/50">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-primary" />
                Megjelenés
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Válassz téma módot">
                {[
                  { mode: 'light' as ThemeMode, icon: Sun, label: 'Világos' },
                  { mode: 'dark' as ThemeMode, icon: Moon, label: 'Sötét' },
                  { mode: 'system' as ThemeMode, icon: Monitor, label: 'Rendszer' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => updateTheme({ mode })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      theme.mode === mode 
                        ? 'border-primary bg-primary/10 shadow-sm' 
                        : 'border-border hover:bg-secondary hover:border-secondary'
                    }`}
                    role="radio"
                    aria-checked={theme.mode === mode}
                    aria-label={label}
                  >
                    <Icon className={`w-5 h-5 ${theme.mode === mode ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-[11px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Forma Stílus */}
          <AccordionItem value="shape" className="border border-border rounded-xl px-4 bg-card/50">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4 text-primary" />
                Forma
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Válassz forma stílust">
                {[
                  { shape: 'sharp' as ShapePreset, icon: Square, label: 'Éles' },
                  { shape: 'rounded' as ShapePreset, icon: RectangleHorizontal, label: 'Lekerekített' },
                  { shape: 'full' as ShapePreset, icon: Circle, label: 'Teljes' },
                ].map(({ shape, icon: Icon, label }) => (
                  <button
                    key={shape}
                    onClick={() => updateTheme({ shape })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      theme.shape === shape 
                        ? 'border-primary bg-primary/10 shadow-sm' 
                        : 'border-border hover:bg-secondary hover:border-secondary'
                    }`}
                    role="radio"
                    aria-checked={theme.shape === shape}
                    aria-label={label}
                  >
                    <Icon className={`w-5 h-5 ${theme.shape === shape ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-[11px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Színpaletta */}
          <AccordionItem value="color" className="border border-border rounded-xl px-4 bg-card/50">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Színek
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-3 block font-medium">Brand Színek</label>
                <div className="flex justify-center gap-6">
                  <ColorSwatch 
                    color={theme.colors.primary} 
                    label="Elsődleges" 
                    onChange={(val) => updateTheme({ colors: { ...theme.colors, primary: val } })}
                    aria-label="Elsődleges brand szín kiválasztása"
                  />
                  <ColorSwatch 
                    color={theme.colors.accent} 
                    label="Kiemelő" 
                    onChange={(val) => updateTheme({ colors: { ...theme.colors, accent: val } })}
                    aria-label="Kiemelő brand szín kiválasztása"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">Semleges Tónus</label>
                <ToggleGroup 
                  options={['slate', 'gray', 'zinc'] as const}
                  value={theme.colors.neutral}
                  onChange={(val) => updateTheme({ colors: { ...theme.colors, neutral: val } })}
                  aria-label="Válassz semleges színtónust"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Solid Stílus */}
          <AccordionItem value="solid" className="border border-border rounded-xl px-4 bg-card/50">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Solid Elemek
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">Gomb/Bemenet Stílus</label>
                <ToggleGroup 
                  options={['color', 'inverse', 'contrast'] as SolidStyle[]}
                  value={theme.solidStyle}
                  onChange={(val) => updateTheme({ solidStyle: val })}
                  aria-label="Válassz solid stílust az interaktív elemekhez"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">Felületi Effekt</label>
                <ToggleGroup 
                  options={['flat', 'plastic'] as EffectStyle[]}
                  value={theme.effectStyle}
                  onChange={(val) => updateTheme({ effectStyle: val })}
                  aria-label="Válassz effekt stílust"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Vizuális Effektek */}
          <AccordionItem value="effects" className="border border-border rounded-xl px-4 bg-card/50">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Effektek
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs font-medium block mb-0.5">Mélység Effekt</span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    3D mélység hozzáadása a beviteli mezőkhöz
                  </p>
                </div>
                <Switch 
                  checked={theme.depthEffect} 
                  onCheckedChange={(val) => updateTheme({ depthEffect: val })}
                  aria-label="Mélység effekt ki/be kapcsolása"
                />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs font-medium block mb-0.5">Zaj Effekt</span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Finom zajminta hozzáadása a mezőkhöz
                  </p>
                </div>
                <Switch 
                  checked={theme.noiseEffect} 
                  onCheckedChange={(val) => updateTheme({ noiseEffect: val })}
                  aria-label="Zaj effekt ki/be kapcsolása"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Haladó Beállítások */}
          <AccordionItem value="advanced" className="border border-border rounded-xl px-4 bg-card/50">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Haladó
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-5">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">Felület Típusa</label>
                <ToggleGroup 
                  options={['filled', 'translucent'] as SurfaceStyle[]}
                  value={theme.surface}
                  onChange={(val) => updateTheme({ surface: val })}
                  aria-label="Válassz felület típust"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground font-medium">UI Méretezés</label>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary" id="scaling-value">
                    {theme.scaling}%
                  </span>
                </div>
                <Slider 
                  value={[theme.scaling]} 
                  onValueChange={([val]) => updateTheme({ scaling: val })}
                  min={90}
                  max={110}
                  step={5}
                  className="w-full"
                  aria-labelledby="scaling-value"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">Adat Vizualizáció</label>
                <ToggleGroup 
                  options={['categorical', 'divergent', 'sequential'] as DataStyle[]}
                  value={theme.dataStyle}
                  onChange={(val) => updateTheme({ dataStyle: val })}
                  renderOption={(opt) => opt.slice(0, 3).toUpperCase()}
                  aria-label="Válassz adat vizualizációs stílust"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">Átmenetek</label>
                <ToggleGroup 
                  options={['all', 'micro', 'macro', 'none'] as TransitionStyle[]}
                  value={theme.transition}
                  onChange={(val) => updateTheme({ transition: val })}
                  aria-label="Válassz átmenet típust"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground font-medium">Keret Vastagság</label>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary" id="border-width-value">
                    {theme.borderWidth}px
                  </span>
                </div>
                <Slider 
                  value={[theme.borderWidth]} 
                  onValueChange={([val]) => updateTheme({ borderWidth: val })}
                  min={0}
                  max={4}
                  step={1}
                  className="w-full"
                  aria-labelledby="border-width-value"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Méretezés */}
          <AccordionItem value="sizes" className="border border-border rounded-xl px-4 bg-card/50">
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <RectangleHorizontal className="w-4 h-4 text-primary" />
                Komponens Méretek
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-5">
              {/* Mezők */}
              <div>
                <label className="text-xs text-muted-foreground mb-3 block font-medium">
                  Mezők <span className="text-[10px]">(gomb, bemenet, select, tab)</span>
                </label>
                <div className="grid grid-cols-5 gap-1 mb-3 p-2 bg-secondary/30 rounded-lg">
                  {['xs', 'sm', 'md', 'lg', 'xl'].map((size, i) => (
                    <div key={size} className="text-center">
                      <div className="text-[10px] text-muted-foreground font-semibold mb-1">{size}</div>
                      <div className="text-xs font-mono text-foreground">{24 + i * 8}px</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">Alap Méret</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary" id="field-base-size-value">
                    {theme.fieldBaseSize.toFixed(1)}px
                  </span>
                </div>
                <Slider 
                  value={[theme.fieldBaseSize]} 
                  onValueChange={([val]) => updateTheme({ fieldBaseSize: val })}
                  min={2}
                  max={8}
                  step={0.5}
                  className="w-full"
                  aria-labelledby="field-base-size-value"
                />
              </div>

              {/* Választók */}
              <div>
                <label className="text-xs text-muted-foreground mb-3 block font-medium">
                  Választók <span className="text-[10px]">(checkbox, toggle, jelvény)</span>
                </label>
                <div className="grid grid-cols-5 gap-1 mb-3 p-2 bg-secondary/30 rounded-lg">
                  {['xs', 'sm', 'md', 'lg', 'xl'].map((size, i) => (
                    <div key={size} className="text-center">
                      <div className="text-[10px] text-muted-foreground font-semibold mb-1">{size}</div>
                      <div className="text-xs font-mono text-foreground">{16 + i * 4}px</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">Alap Méret</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary" id="selector-base-size-value">
                    {theme.selectorBaseSize.toFixed(1)}px
                  </span>
                </div>
                <Slider 
                  value={[theme.selectorBaseSize]} 
                  onValueChange={([val]) => updateTheme({ selectorBaseSize: val })}
                  min={2}
                  max={8}
                  step={0.5}
                  className="w-full"
                  aria-labelledby="selector-base-size-value"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-2 px-4 bg-secondary/20 rounded-b-2xl flex-shrink-0">
        <p className="text-[10px] text-muted-foreground text-center">
          Személyre szabd a teljes felhasználói élményt
        </p>
      </div>
    </div>
  );
};
