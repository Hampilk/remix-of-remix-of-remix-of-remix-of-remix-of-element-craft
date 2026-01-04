import React, { useState } from 'react';
import { Search, Layers, Square, Type, Navigation, Layout, MousePointer, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { InspectorState } from './types';
import { DEFAULT_INSPECTOR_STATE } from './constants';

export type TemplateCategory = 'all' | 'buttons' | 'cards' | 'inputs' | 'navigation' | 'layout';

export interface ComponentTemplate {
  id: string;
  name: string;
  nameHu: string;
  description: string;
  descriptionHu: string;
  category: TemplateCategory;
  previewHtml: string;
  previewCss?: string;
  state: Partial<InspectorState>;
  icon: React.ReactNode;
}

// Built-in templates
const builtInTemplates: ComponentTemplate[] = [
  // Buttons
  {
    id: 'btn-primary',
    name: 'Primary Button',
    nameHu: 'Elsődleges Gomb',
    description: 'A solid primary action button',
    descriptionHu: 'Tömör elsődleges akciógomb',
    category: 'buttons',
    previewHtml: '<button class="template-btn-primary">Click me</button>',
    previewCss: `.template-btn-primary { 
      padding: 0.5rem 1rem; 
      background: hsl(217 91% 60%); 
      color: white; 
      border-radius: 0.5rem; 
      font-weight: 500;
      border: none;
      cursor: pointer;
    }`,
    state: {
      tag: 'button',
      textContent: 'Click me',
      padding: { l: '16', t: '8', r: '16', b: '8' },
      border: { ...DEFAULT_INSPECTOR_STATE.border, radius: { all: 8, tl: 8, tr: 8, br: 8, bl: 8 } },
      typography: { ...DEFAULT_INSPECTOR_STATE.typography, fontWeight: 'medium' },
      appearance: { ...DEFAULT_INSPECTOR_STATE.appearance, backgroundColor: '217 91% 60%' },
    },
    icon: <MousePointer className="w-4 h-4" />,
  },
  {
    id: 'btn-outline',
    name: 'Outline Button',
    nameHu: 'Körvonal Gomb',
    description: 'A bordered outline button',
    descriptionHu: 'Szegélyes körvonal gomb',
    category: 'buttons',
    previewHtml: '<button class="template-btn-outline">Learn More</button>',
    previewCss: `.template-btn-outline { 
      padding: 0.5rem 1rem; 
      background: transparent; 
      color: hsl(217 91% 60%); 
      border: 2px solid hsl(217 91% 60%); 
      border-radius: 0.5rem; 
      font-weight: 500;
      cursor: pointer;
    }`,
    state: {
      tag: 'button',
      textContent: 'Learn More',
      padding: { l: '16', t: '8', r: '16', b: '8' },
      border: { 
        color: '217 91% 60%', 
        width: '2', 
        style: 'solid',
        ringColor: null,
        radius: { all: 8, tl: 8, tr: 8, br: 8, bl: 8 } 
      },
      typography: { ...DEFAULT_INSPECTOR_STATE.typography, fontWeight: 'medium', textColor: '217 91% 60%' },
    },
    icon: <MousePointer className="w-4 h-4" />,
  },
  {
    id: 'btn-ghost',
    name: 'Ghost Button',
    nameHu: 'Áttetsző Gomb',
    description: 'A subtle ghost button',
    descriptionHu: 'Finom áttetsző gomb',
    category: 'buttons',
    previewHtml: '<button class="template-btn-ghost">Cancel</button>',
    previewCss: `.template-btn-ghost { 
      padding: 0.5rem 1rem; 
      background: transparent; 
      color: hsl(215 20% 65%); 
      border: none; 
      border-radius: 0.5rem; 
      font-weight: 400;
      cursor: pointer;
    }`,
    state: {
      tag: 'button',
      textContent: 'Cancel',
      padding: { l: '16', t: '8', r: '16', b: '8' },
      border: { ...DEFAULT_INSPECTOR_STATE.border, radius: { all: 8, tl: 8, tr: 8, br: 8, bl: 8 } },
      typography: { ...DEFAULT_INSPECTOR_STATE.typography, textColor: '215 20% 65%' },
    },
    icon: <MousePointer className="w-4 h-4" />,
  },
  // Cards
  {
    id: 'card-basic',
    name: 'Basic Card',
    nameHu: 'Alap Kártya',
    description: 'A simple card with shadow',
    descriptionHu: 'Egyszerű kártya árnyékkal',
    category: 'cards',
    previewHtml: '<div class="template-card-basic">Card Content</div>',
    previewCss: `.template-card-basic { 
      padding: 1.5rem; 
      background: hsl(222 47% 11%); 
      border: 1px solid hsl(217 33% 17%);
      border-radius: 0.75rem; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      color: white;
    }`,
    state: {
      tag: 'div',
      textContent: 'Card Content',
      padding: { l: '24', t: '24', r: '24', b: '24' },
      border: { 
        color: '217 33% 17%', 
        width: '1', 
        style: 'solid',
        ringColor: null,
        radius: { all: 12, tl: 12, tr: 12, br: 12, bl: 12 } 
      },
      effects: { ...DEFAULT_INSPECTOR_STATE.effects, shadow: 'md' },
      appearance: { ...DEFAULT_INSPECTOR_STATE.appearance, backgroundColor: '222 47% 11%' },
    },
    icon: <Square className="w-4 h-4" />,
  },
  {
    id: 'card-elevated',
    name: 'Elevated Card',
    nameHu: 'Emelt Kártya',
    description: 'Card with stronger elevation',
    descriptionHu: 'Kártya erősebb árnyékkal',
    category: 'cards',
    previewHtml: '<div class="template-card-elevated">Featured</div>',
    previewCss: `.template-card-elevated { 
      padding: 2rem; 
      background: hsl(222 47% 14%); 
      border-radius: 1rem; 
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.25);
      color: white;
    }`,
    state: {
      tag: 'div',
      textContent: 'Featured',
      padding: { l: '32', t: '32', r: '32', b: '32' },
      border: { ...DEFAULT_INSPECTOR_STATE.border, radius: { all: 16, tl: 16, tr: 16, br: 16, bl: 16 } },
      effects: { ...DEFAULT_INSPECTOR_STATE.effects, shadow: 'xl' },
      appearance: { ...DEFAULT_INSPECTOR_STATE.appearance, backgroundColor: '222 47% 14%' },
    },
    icon: <Square className="w-4 h-4" />,
  },
  // Inputs
  {
    id: 'input-default',
    name: 'Text Input',
    nameHu: 'Szöveges bevitel',
    description: 'Standard text input field',
    descriptionHu: 'Szabványos szöveges beviteli mező',
    category: 'inputs',
    previewHtml: '<input class="template-input" placeholder="Enter text..." />',
    previewCss: `.template-input { 
      padding: 0.5rem 0.75rem; 
      background: hsl(222 47% 11%); 
      border: 1px solid hsl(217 33% 25%);
      border-radius: 0.5rem; 
      color: white;
      width: 100%;
    }`,
    state: {
      tag: 'div',
      textContent: 'Enter text...',
      padding: { l: '12', t: '8', r: '12', b: '8' },
      border: { 
        color: '217 33% 25%', 
        width: '1', 
        style: 'solid',
        ringColor: null,
        radius: { all: 8, tl: 8, tr: 8, br: 8, bl: 8 } 
      },
      appearance: { ...DEFAULT_INSPECTOR_STATE.appearance, backgroundColor: '222 47% 11%' },
    },
    icon: <Type className="w-4 h-4" />,
  },
  // Navigation
  {
    id: 'nav-link',
    name: 'Nav Link',
    nameHu: 'Navigációs link',
    description: 'Navigation menu link',
    descriptionHu: 'Navigációs menü link',
    category: 'navigation',
    previewHtml: '<a class="template-nav-link">Home</a>',
    previewCss: `.template-nav-link { 
      padding: 0.5rem 1rem; 
      color: hsl(215 20% 65%);
      font-weight: 500;
      text-decoration: none;
      border-radius: 0.375rem;
    }`,
    state: {
      tag: 'a',
      textContent: 'Home',
      padding: { l: '16', t: '8', r: '16', b: '8' },
      border: { ...DEFAULT_INSPECTOR_STATE.border, radius: { all: 6, tl: 6, tr: 6, br: 6, bl: 6 } },
      typography: { ...DEFAULT_INSPECTOR_STATE.typography, fontWeight: 'medium', textColor: '215 20% 65%' },
    },
    icon: <Navigation className="w-4 h-4" />,
  },
  // Layout
  {
    id: 'layout-section',
    name: 'Section Container',
    nameHu: 'Szekció konténer',
    description: 'Content section wrapper',
    descriptionHu: 'Tartalom szekció burkoló',
    category: 'layout',
    previewHtml: '<section class="template-section">Section</section>',
    previewCss: `.template-section { 
      padding: 3rem 2rem; 
      max-width: 1200px;
      margin: 0 auto;
      color: white;
    }`,
    state: {
      tag: 'section',
      textContent: 'Section Content',
      padding: { l: '32', t: '48', r: '32', b: '48' },
      size: { ...DEFAULT_INSPECTOR_STATE.size, maxWidth: '1200px' },
      margin: { x: 'auto', y: '0' },
    },
    icon: <Layout className="w-4 h-4" />,
  },
];

const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  all: <Layers className="w-3 h-3" />,
  buttons: <MousePointer className="w-3 h-3" />,
  cards: <Square className="w-3 h-3" />,
  inputs: <Type className="w-3 h-3" />,
  navigation: <Navigation className="w-3 h-3" />,
  layout: <Layout className="w-3 h-3" />,
};

interface ComponentTemplatesProps {
  onApplyTemplate: (state: Partial<InspectorState>) => void;
  onClose: () => void;
}

export const ComponentTemplates: React.FC<ComponentTemplatesProps> = ({ onApplyTemplate, onClose }) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');

  const filteredTemplates = builtInTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const name = language === 'hu' ? template.nameHu : template.name;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: TemplateCategory[] = ['all', 'buttons', 'cards', 'inputs', 'navigation', 'layout'];

  return (
    <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-panel)] w-72 max-h-[80vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border py-2 px-4 bg-secondary/50 flex-shrink-0">
        <h3 className="text-xs uppercase font-bold text-primary">{t('templates.title')}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder={t('templates.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs pl-7"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-3 py-2 border-b border-border">
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TemplateCategory)}>
          <TabsList className="h-7 w-full grid grid-cols-6 gap-0.5">
            {categories.map(cat => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="h-6 px-1.5 text-[9px] data-[state=active]:bg-primary/20"
                title={t(`templates.categories.${cat}`)}
              >
                {categoryIcons[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Templates List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              {t('templates.noResults')}
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border border-border rounded-lg p-3 hover:border-primary/50 transition-colors group"
              >
                {/* Preview */}
                <div className="bg-secondary/30 rounded-md p-3 mb-2 min-h-[50px] flex items-center justify-center">
                  <style>{template.previewCss}</style>
                  <div dangerouslySetInnerHTML={{ __html: template.previewHtml }} />
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {template.icon}
                      <span className="text-xs font-medium truncate">
                        {language === 'hu' ? template.nameHu : template.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {language === 'hu' ? template.descriptionHu : template.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-6 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onApplyTemplate(template.state)}
                  >
                    {t('templates.apply')}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
