// src/lib/sanitize.ts

/**
 * HTML és CSS sanitizálási utility XSS támadások megelőzésére.
 * Egyszerűsített verzió regex alapú tisztítással.
 * 
 * @module sanitize
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SanitizationLevel = 'strict' | 'moderate' | 'permissive';

export interface HtmlSanitizeOptions {
  level?: SanitizationLevel;
  additionalTags?: string[];
  allowSvg?: boolean;
  allowStyleAttr?: boolean;
}

export interface CssSanitizeOptions {
  allowDataUri?: boolean;
  allowImports?: boolean;
  preserveComments?: boolean;
}

export interface SanitizeResult {
  clean: string;
  modified: boolean;
  removedCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ALLOWED_TAGS_BY_LEVEL: Record<SanitizationLevel, string[]> = {
  strict: ['div', 'span', 'p', 'br', 'strong', 'em', 'b', 'i', 'u'],
  moderate: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'b', 'i', 'u', 's', 'br', 'hr',
    'ul', 'ol', 'li', 'a', 'img', 'button',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  permissive: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'b', 'i', 'u', 's', 'br', 'hr',
    'ul', 'ol', 'li', 'a', 'img', 'button',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
    'form', 'input', 'label', 'textarea', 'select', 'option',
    'blockquote', 'code', 'pre', 'abbr', 'cite', 'small', 'mark',
    'details', 'summary', 'figure', 'figcaption'
  ]
};

const SVG_TAGS = [
  'svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 
  'ellipse', 'g', 'text', 'tspan', 'defs', 'linearGradient', 
  'radialGradient', 'stop', 'use', 'symbol'
];

const FORBIDDEN_TAGS = [
  'script', 'iframe', 'object', 'embed', 'applet', 'link',
  'meta', 'base', 'style', 'head', 'body', 'html', 'frame', 'frameset'
];

const DANGEROUS_ATTRS = [
  'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
  'onfocus', 'onblur', 'onchange', 'onsubmit', 'ondblclick',
  'onkeydown', 'onkeyup', 'onkeypress', 'onmousedown', 'onmouseup',
  'onmousemove', 'onscroll', 'onresize', 'onwheel', 'ondrag',
  'ondrop', 'onpaste', 'oncopy', 'oncut', 'formaction'
];

const DANGEROUS_CSS_PATTERNS = [
  /expression\s*\(/gi,
  /javascript\s*:/gi,
  /behavior\s*:/gi,
  /vbscript\s*:/gi,
  /@import/gi,
  /@-moz-binding/gi,
  /-moz-binding/gi,
  /url\s*\(\s*["']?\s*javascript/gi,
  /url\s*\(\s*["']?\s*vbscript/gi,
  /url\s*\(\s*["']?\s*data\s*:text\/html/gi,
  /url\s*\(\s*["']?\s*data\s*:text\/javascript/gi,
  /eval\s*\(/gi,
];

// ============================================================================
// LRU CACHE
// ============================================================================

class SanitizeCache {
  private cache = new Map<string, string>();
  private readonly maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): string | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

const htmlCache = new SanitizeCache(50);
const cssCache = new SanitizeCache(50);

// ============================================================================
// HTML SANITIZATION
// ============================================================================

function generateCacheKey(content: string, options?: HtmlSanitizeOptions): string {
  const optionsStr = options ? JSON.stringify(options) : '';
  return `${content.substring(0, 100)}_${optionsStr}`;
}

/**
 * Sanitizálja a HTML tartalmat XSS támadások megelőzésére.
 * Egyszerűsített regex-alapú megközelítés.
 */
export function sanitizeHtml(
  dirty: string, 
  options: HtmlSanitizeOptions = {}
): string {
  if (!dirty || dirty.trim().length === 0) {
    return '';
  }

  const cacheKey = generateCacheKey(dirty, options);
  const cached = htmlCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const {
    level = 'moderate',
    additionalTags = [],
    allowSvg = false,
    allowStyleAttr = true
  } = options;

  let allowedTags = [...ALLOWED_TAGS_BY_LEVEL[level], ...additionalTags];
  if (allowSvg) {
    allowedTags = [...allowedTags, ...SVG_TAGS];
  }

  let clean = dirty;

  // Remove forbidden tags completely
  FORBIDDEN_TAGS.forEach(tag => {
    const tagRegex = new RegExp(`<${tag}[^>]*>.*?</${tag}>|<${tag}[^>]*>`, 'gis');
    clean = clean.replace(tagRegex, '');
  });

  // Remove dangerous event handlers
  DANGEROUS_ATTRS.forEach(attr => {
    const attrRegex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    clean = clean.replace(attrRegex, '');
  });

  // Remove javascript: and vbscript: from href/src
  clean = clean.replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');
  clean = clean.replace(/src\s*=\s*["']\s*javascript:[^"']*["']/gi, 'src=""');

  // Remove style attribute if not allowed
  if (!allowStyleAttr) {
    clean = clean.replace(/\sstyle\s*=\s*["'][^"']*["']/gi, '');
  }

  htmlCache.set(cacheKey, clean);

  return clean;
}

export function sanitizeHtmlDetailed(
  dirty: string,
  options: HtmlSanitizeOptions = {}
): SanitizeResult {
  const clean = sanitizeHtml(dirty, options);
  
  return {
    clean,
    modified: clean !== dirty,
    removedCount: (dirty.match(/<script|<iframe|onclick|onerror/gi) || []).length
  };
}

// ============================================================================
// CSS SANITIZATION
// ============================================================================

/**
 * Sanitizálja a CSS tartalmat injection támadások megelőzésére.
 */
export function sanitizeCss(
  dirty: string,
  options: CssSanitizeOptions = {}
): string {
  if (!dirty || dirty.trim().length === 0) {
    return '';
  }

  const cacheKey = `${dirty.substring(0, 100)}_${JSON.stringify(options)}`;
  const cached = cssCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const {
    allowDataUri = true,
    allowImports = false,
    preserveComments = false
  } = options;

  let clean = dirty;

  // Remove dangerous CSS patterns
  DANGEROUS_CSS_PATTERNS.forEach(pattern => {
    clean = clean.replace(pattern, '/* [REMOVED] */');
  });

  // URL sanitization
  if (!allowDataUri) {
    clean = clean.replace(
      /url\s*\(\s*["']?\s*(?!https?:\/\/)[^"'\)]+["']?\s*\)/gi,
      'url("")'
    );
  } else {
    clean = clean.replace(
      /url\s*\(\s*["']?\s*data:(?!image\/|font\/)[^"'\)]+["']?\s*\)/gi,
      'url("")'
    );
  }

  // Handle imports
  if (!allowImports) {
    clean = clean.replace(/@import[^;]+;/gi, '/* @import removed */');
  }

  // Remove comments if not preserving
  if (!preserveComments) {
    clean = clean.replace(/\/\*.*?\*\//gs, '');
  }

  // Clean up whitespace
  clean = clean.replace(/\s+/g, ' ').trim();

  // Remove empty rules
  clean = clean.replace(/[^}]*\{\s*\}/g, '');

  cssCache.set(cacheKey, clean);

  return clean;
}

export function sanitizeCssDetailed(
  dirty: string,
  options: CssSanitizeOptions = {}
): SanitizeResult {
  const clean = sanitizeCss(dirty, options);
  
  return {
    clean,
    modified: clean !== dirty,
    removedCount: DANGEROUS_CSS_PATTERNS.reduce((count, pattern) => {
      return count + (dirty.match(pattern) || []).length;
    }, 0)
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function clearSanitizeCache(): void {
  htmlCache.clear();
  cssCache.clear();
}

/**
 * Escapes HTML special characters
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates if a string is a safe URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim().length === 0) return false;
  
  const sanitizedUrl = url.trim().toLowerCase();
  if (sanitizedUrl.startsWith('javascript:') || sanitizedUrl.startsWith('vbscript:')) {
    return false;
  }
  
  return true;
}

/**
 * Sanitizes a URL
 */
export function sanitizeUrl(url: string): string {
  if (!isValidUrl(url)) {
    return '#';
  }
  return url;
}
