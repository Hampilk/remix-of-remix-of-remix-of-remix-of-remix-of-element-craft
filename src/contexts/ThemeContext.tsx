import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ShapePreset = 'sharp' | 'rounded' | 'full';
export type SolidStyle = 'color' | 'inverse' | 'contrast';
export type EffectStyle = 'flat' | 'plastic';
export type SurfaceStyle = 'filled' | 'translucent';
export type DataStyle = 'categorical' | 'divergent' | 'sequential';
export type TransitionStyle = 'all' | 'micro' | 'macro' | 'none';

interface ColorPalette {
  primary: string;
  accent: string;
  neutral: 'slate' | 'gray' | 'zinc';
}

interface ThemeState {
  mode: ThemeMode;
  shape: ShapePreset;
  colors: ColorPalette;
  solidStyle: SolidStyle;
  effectStyle: EffectStyle;
  surface: SurfaceStyle;
  scaling: number;
  dataStyle: DataStyle;
  transition: TransitionStyle;
  depthEffect: boolean;
  noiseEffect: boolean;
  borderWidth: number;
  fieldBaseSize: number;
  selectorBaseSize: number;
}

interface ThemeContextType {
  theme: ThemeState;
  setTheme: React.Dispatch<React.SetStateAction<ThemeState>>;
  updateTheme: (updates: Partial<ThemeState>) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeState = {
  mode: 'system',
  shape: 'rounded',
  colors: {
    primary: '217 91% 60%',
    accent: '142 76% 36%',
    neutral: 'slate',
  },
  solidStyle: 'color',
  effectStyle: 'flat',
  surface: 'translucent',
  scaling: 100,
  dataStyle: 'categorical',
  transition: 'all',
  depthEffect: false,
  noiseEffect: false,
  borderWidth: 1,
  fieldBaseSize: 4,
  selectorBaseSize: 4,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeState>(() => {
    const stored = localStorage.getItem('theme-customizer');
    return stored ? { ...defaultTheme, ...JSON.parse(stored) } : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('theme-customizer', JSON.stringify(theme));
    
    // Apply theme mode
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme.mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme.mode);
    }

    // Apply CSS variables
    const radiusMap = { sharp: '0', rounded: '0.5rem', full: '9999px' };
    root.style.setProperty('--radius', radiusMap[theme.shape]);
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--theme-scaling', `${theme.scaling}%`);
    root.style.setProperty('--border-width', `${theme.borderWidth}px`);
  }, [theme]);

  const updateTheme = (updates: Partial<ThemeState>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => setTheme(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
