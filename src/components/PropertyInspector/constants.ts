// PropertyInspector Constants and Default Values

import type { InspectorState, Breakpoint, SectionKey } from './types';

export const DEFAULT_INSPECTOR_STATE: InspectorState = {
  elementId: '',
  tag: 'div',
  textContent: '',
  link: '',
  
  padding: { l: '0', t: '0', r: '0', b: '0' },
  margin: { x: '0', y: '0' },
  
  position: { 
    type: 'relative', 
    l: '', 
    t: '', 
    r: '', 
    b: '',
    zIndex: ''
  },
  
  size: { 
    width: '', 
    height: '', 
    maxWidth: '', 
    maxHeight: '',
    minWidth: '',
    minHeight: ''
  },
  
  typography: {
    fontFamily: 'inter',
    fontSize: '',
    fontWeight: 'normal',
    lineHeight: '',
    letterSpacing: 'normal',
    textAlign: 'left',
    textColor: null
  },
  
  transforms: {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    scale: 100,
    skewX: 0,
    skewY: 0
  },
  
  transforms3D: {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    perspective: 0
  },
  
  border: {
    color: null,
    width: '0',
    style: 'solid',
    ringColor: null,
    radius: { all: 0, tl: 0, tr: 0, br: 0, bl: 0 }
  },
  
  effects: {
    shadow: 'none',
    opacity: 100,
    blur: 0,
    backdropBlur: 0,
    hueRotate: 0,
    saturation: 100,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    invert: 0,
    sepia: 0
  },
  
  appearance: {
    backgroundColor: null,
    backgroundImage: '',
    blendMode: 'normal'
  },
  
  inlineCSS: '',
  tailwindClasses: []
};

export const BREAKPOINTS: { value: Breakpoint; label: string; icon?: string }[] = [
  { value: 'base', label: '*' },
  { value: 'sm', label: 'SM' },
  { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' },
  { value: 'xl', label: 'XL' },
  { value: '2xl', label: '2XL' }
];

export const DEFAULT_OPEN_SECTIONS: SectionKey[] = ['text', 'padding', 'transforms'];

export const TAG_OPTIONS = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 'a', 'button'];

export const FONT_FAMILY_OPTIONS = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'mono', label: 'Monospace' },
  { value: 'serif', label: 'Serif' },
  { value: 'sans', label: 'Sans' }
];

export const FONT_WEIGHT_OPTIONS = [
  { value: 'thin', label: 'Thin (100)' },
  { value: 'extralight', label: 'Extra Light (200)' },
  { value: 'light', label: 'Light (300)' },
  { value: 'normal', label: 'Normal (400)' },
  { value: 'medium', label: 'Medium (500)' },
  { value: 'semibold', label: 'Semibold (600)' },
  { value: 'bold', label: 'Bold (700)' },
  { value: 'extrabold', label: 'Extra Bold (800)' },
  { value: 'black', label: 'Black (900)' }
];

export const LETTER_SPACING_OPTIONS = [
  { value: 'tighter', label: 'Tighter' },
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'wider', label: 'Wider' },
  { value: 'widest', label: 'Widest' }
];

export const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'justify', label: 'Justify' }
];

export const POSITION_OPTIONS = [
  { value: 'static', label: 'Static' },
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'sticky', label: 'Sticky' }
];

export const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
  { value: '2xl', label: '2XL' },
  { value: 'inner', label: 'Inner' }
];

export const BORDER_STYLE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' }
];

export const BLEND_MODE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' }
];
