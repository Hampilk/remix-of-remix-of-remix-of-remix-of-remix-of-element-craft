// PropertyInspector Type Definitions

export type TabMode = 'EDIT' | 'PROMPT' | 'CODE';
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BorderRadiusTab = 'all' | 'tl' | 'tr' | 'br' | 'bl';

export interface SpacingValue {
  l: string;
  t: string;
  r: string;
  b: string;
}

export interface MarginValue {
  x: string;
  y: string;
}

export interface PositionValue {
  type: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  l: string;
  t: string;
  r: string;
  b: string;
  zIndex: string;
}

export interface SizeValue {
  width: string;
  height: string;
  maxWidth: string;
  maxHeight: string;
  minWidth: string;
  minHeight: string;
}

export interface TypographyValue {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string | null;
}

export interface TransformValue {
  translateX: number;
  translateY: number;
  rotate: number;
  scale: number;
  skewX: number;
  skewY: number;
}

export interface Transform3DValue {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  perspective: number;
}

export interface BorderValue {
  color: string | null;
  width: string;
  style: 'none' | 'solid' | 'dashed' | 'dotted';
  ringColor: string | null;
  radius: {
    all: number;
    tl: number;
    tr: number;
    br: number;
    bl: number;
  };
}

export interface EffectsValue {
  shadow: string;
  opacity: number;
  blur: number;
  backdropBlur: number;
  hueRotate: number;
  saturation: number;
  brightness: number;
  contrast: number;
  grayscale: number;
  invert: number;
  sepia: number;
}

export interface AppearanceValue {
  backgroundColor: string | null;
  backgroundImage: string;
  blendMode: string;
}

export interface InspectorState {
  // Element info
  elementId: string;
  tag: string;
  textContent: string;
  link: string;
  
  // Spacing
  padding: SpacingValue;
  margin: MarginValue;
  
  // Layout
  position: PositionValue;
  size: SizeValue;
  
  // Typography
  typography: TypographyValue;
  
  // Transforms
  transforms: TransformValue;
  transforms3D: Transform3DValue;
  
  // Border
  border: BorderValue;
  
  // Effects
  effects: EffectsValue;
  
  // Appearance
  appearance: AppearanceValue;
  
  // Custom
  inlineCSS: string;
  tailwindClasses: string[];
}

// For export/import functionality
export interface ElementData {
  id: string;
  tagName: string;
  textContent: string;
  tailwindClasses: string[];
  inlineStyles: Record<string, string>;
  link?: string;
}

// Section keys for accordion
export type SectionKey = 
  | 'element'
  | 'text'
  | 'tailwind'
  | 'inline-css'
  | 'margin'
  | 'padding'
  | 'position'
  | 'size'
  | 'typography'
  | 'appearance'
  | 'border'
  | 'effects'
  | 'transforms'
  | 'transforms3d';
