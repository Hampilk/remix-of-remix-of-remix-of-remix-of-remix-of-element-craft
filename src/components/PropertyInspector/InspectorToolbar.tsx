import React, { memo, useCallback } from 'react';
import { 
  RotateCcw, 
  LayoutTemplate, 
  Bookmark, 
  FileCode 
} from 'lucide-react';
import { Button } from '../ui/button';
import { TabSelector } from './components';
import type { TabMode } from './types';

interface InspectorToolbarProps {
  activeTab: TabMode;
  onActiveTabChange: (tab: TabMode) => void;
  currentTag: string;
  onResetTransforms: () => void;
  onShowTemplates: () => void;
  onShowPresets: () => void;
  onShowExport: () => void;
}

interface ToolbarAction {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  title: string;
  ariaLabel: string;
}

const TAB_OPTIONS: string[] = ['EDIT', 'PROMPT', 'CODE'];

export const InspectorToolbar: React.FC<InspectorToolbarProps> = memo(({
  activeTab,
  onActiveTabChange,
  currentTag,
  onResetTransforms,
  onShowTemplates,
  onShowPresets,
  onShowExport,
}) => {
  // Memoizált callback a tab változáshoz
  const handleTabChange = useCallback((value: string) => {
    onActiveTabChange(value as TabMode);
  }, [onActiveTabChange]);

  // Toolbar műveletek konfigurációja
  const toolbarActions: ToolbarAction[] = [
    {
      icon: RotateCcw,
      onClick: onResetTransforms,
      title: 'Transzformációk visszaállítása',
      ariaLabel: 'Transzformációk visszaállítása',
    },
    {
      icon: LayoutTemplate,
      onClick: onShowTemplates,
      title: 'Sablonok megjelenítése',
      ariaLabel: 'Sablonok',
    },
    {
      icon: Bookmark,
      onClick: onShowPresets,
      title: 'Előre definiált beállítások',
      ariaLabel: 'Előbeállítások',
    },
    {
      icon: FileCode,
      onClick: onShowExport,
      title: 'Kód exportálása',
      ariaLabel: 'Exportálás',
    },
  ];

  return (
    <div 
      className="flex items-center justify-between border-b border-border py-2 px-4 bg-secondary/50 flex-shrink-0"
      role="toolbar"
      aria-label="Property Inspector eszköztár"
    >
      {/* Bal oldal: Tag név és Tab selector */}
      <div className="flex items-center gap-2">
        <h3 
          className="text-xs uppercase font-bold text-primary select-none"
          aria-label={`Aktuális elem: ${currentTag}`}
        >
          {currentTag}
        </h3>
        <TabSelector 
          value={activeTab} 
          onChange={handleTabChange}
          options={TAB_OPTIONS}
        />
      </div>

      {/* Jobb oldal: Akció gombok */}
      <div className="flex items-center gap-1" role="group" aria-label="Eszköztár műveletek">
        {toolbarActions.map(({ icon: Icon, onClick, title, ariaLabel }) => (
          <Button
            key={ariaLabel}
            variant="ghost"
            size="icon"
            className="h-6 w-6 transition-colors hover:bg-accent"
            onClick={onClick}
            title={title}
            aria-label={ariaLabel}
          >
            <Icon className="w-3 h-3" aria-hidden="true" />
          </Button>
        ))}
      </div>
    </div>
  );
});

InspectorToolbar.displayName = 'InspectorToolbar';
