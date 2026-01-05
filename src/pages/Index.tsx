import { PropertyInspector } from "@/components/PropertyInspector";
import { PreviewBox } from "@/components/PropertyInspector/PreviewBox";
import { useGeneratedStyles } from "@/components/PropertyInspector/hooks";
import { CodePreviewProvider, useCodePreview } from "@/contexts/CodePreviewContext";
import { sanitizeHtml, sanitizeCss } from "@/lib/sanitize";
import { memo, useMemo, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Főkomponens - Provider wrappel ellátva
 */
const Index = () => {
  return (
    <CodePreviewProvider>
      <MainContent />
    </CodePreviewProvider>
  );
};

/**
 * Fő tartalom komponens - központosított layout
 */
const MainContent = memo(() => {
  return (
    <main 
      className="min-h-screen bg-[hsl(var(--editor-bg))] bg-[image:var(--gradient-editor)] p-6 md:p-8"
      role="main"
    >
      <div className="max-w-5xl mx-auto">
        <PageHeader />
        
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
          <PropertyInspectorSection />
          <PreviewPanelSection />
        </div>
      </div>
    </main>
  );
});

MainContent.displayName = 'MainContent';

/**
 * Oldal fejléc komponens
 */
const PageHeader = memo(() => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground/90 mb-2">
        Component Inspector
      </h1>
      <p className="text-sm text-muted-foreground/70">
        React Component Props & Style Editor
      </p>
    </header>
  );
});

PageHeader.displayName = 'PageHeader';

/**
 * Property Inspector szekció wrapper
 */
const PropertyInspectorSection = memo(() => {
  return (
    <section 
      className="w-full lg:w-auto lg:flex-shrink-0"
      aria-label="Property inspector panel"
    >
      <PropertyInspector />
    </section>
  );
});

PropertyInspectorSection.displayName = 'PropertyInspectorSection';

/**
 * Preview Panel szekció wrapper
 */
const PreviewPanelSection = memo(() => {
  return (
    <section 
      className="w-full lg:w-96 lg:flex-shrink-0"
      aria-label="Component preview panel"
    >
      <PreviewPanel />
    </section>
  );
});

PreviewPanelSection.displayName = 'PreviewPanelSection';

/**
 * Státusz badge típusok
 */
type StatusBadgeType = 'saved' | 'code';

interface StatusBadgeProps {
  type: StatusBadgeType;
}

/**
 * Státusz badge komponens
 */
const StatusBadge = memo<StatusBadgeProps>(({ type }) => {
  if (type === 'saved') {
    return (
      <span 
        className="text-[9px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded flex items-center gap-1"
        role="status"
        aria-label="Code saved"
      >
        <span 
          className="w-1.5 h-1.5 bg-green-500 rounded-full" 
          aria-hidden="true"
        />
        SAVED
      </span>
    );
  }

  return (
    <span 
      className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded"
      role="status"
      aria-label="Code mode active"
    >
      CODE
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

/**
 * Clear saved code gomb komponens
 */
interface ClearSavedCodeButtonProps {
  onClear: () => void;
}

const ClearSavedCodeButton = memo<ClearSavedCodeButtonProps>(({ onClear }) => {
  return (
    <button
      onClick={onClear}
      className="text-[9px] bg-destructive/20 text-destructive hover:bg-destructive/30 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
      aria-label="Clear saved code and return to inspector"
      title="Return to Inspector Mode"
    >
      <X className="w-2.5 h-2.5" />
      CLEAR
    </button>
  );
});

ClearSavedCodeButton.displayName = 'ClearSavedCodeButton';

/**
 * Preview panel fejléc komponens
 */
interface PreviewHeaderProps {
  hasSavedCode: boolean;
  isCodeMode: boolean;
  onClearSavedCode: () => void;
}

const PreviewHeader = memo<PreviewHeaderProps>(({ hasSavedCode, isCodeMode, onClearSavedCode }) => {
  return (
    <div className="border-b border-border py-2 px-4 bg-secondary/50 flex items-center justify-between">
      <h3 className="text-xs uppercase font-bold text-primary">
        Preview
      </h3>
      <div className="flex items-center gap-1.5">
        {hasSavedCode && (
          <>
            <StatusBadge type="saved" />
            <ClearSavedCodeButton onClear={onClearSavedCode} />
          </>
        )}
        {isCodeMode && !hasSavedCode && <StatusBadge type="code" />}
      </div>
    </div>
  );
});

PreviewHeader.displayName = 'PreviewHeader';

/**
 * Rács háttér komponens
 */
const GridBackground = memo(() => {
  return (
    <div
      className="absolute inset-0 opacity-5 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}
      aria-hidden="true"
    />
  );
});

GridBackground.displayName = 'GridBackground';

/**
 * Információs overlay komponens
 */
interface InfoOverlayProps {
  hasSavedCode: boolean;
}

const InfoOverlay = memo<InfoOverlayProps>(({ hasSavedCode }) => {
  return (
    <div 
      className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span className="font-mono uppercase bg-secondary/50 px-1.5 py-0.5 rounded">
        &lt;custom&gt;
      </span>
      <span className="font-mono">
        {hasSavedCode ? 'SAVED' : 'Code Mode'}
      </span>
    </div>
  );
});

InfoOverlay.displayName = 'InfoOverlay';

/**
 * Egyedi kód preview komponens
 */
interface CustomCodePreviewProps {
  html: string;
  css: string;
  hasSavedCode: boolean;
}

const CustomCodePreview = memo<CustomCodePreviewProps>(({ html, css, hasSavedCode }) => {
  // XSS védelem - sanitize a HTML és CSS tartalom
  const safeHtml = useMemo(() => sanitizeHtml(html || ''), [html]);
  const safeCss = useMemo(() => sanitizeCss(css || ''), [css]);
  
  // Placeholder tartalom, ha nincs HTML
  const placeholderContent = useMemo(
    () => `<p class="text-muted-foreground text-center text-sm italic p-4">
      Enter HTML code in the editor to see your preview here.
    </p>`,
    []
  );

  return (
    <div className="relative bg-card border border-border rounded-xl p-6 overflow-hidden">
      <GridBackground />
      
      <div 
        className="relative flex items-center justify-center min-h-48"
        role="region"
        aria-label="Custom code preview"
      >
        {/* Biztonságos CSS injektálás */}
        {safeCss && <style>{safeCss}</style>}
        
        {/* Biztonságos HTML renderelés */}
        <div 
          dangerouslySetInnerHTML={{ 
            __html: safeHtml || placeholderContent 
          }} 
        />
      </div>
      
      <InfoOverlay hasSavedCode={hasSavedCode} />
    </div>
  );
});

CustomCodePreview.displayName = 'CustomCodePreview';

/**
 * Preview panel wrapper komponens
 */
interface PreviewPanelWrapperProps {
  children: ReactNode;
}

const PreviewPanelWrapper = memo<PreviewPanelWrapperProps>(({ children }) => {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-panel)] overflow-hidden">
      {children}
    </div>
  );
});

PreviewPanelWrapper.displayName = 'PreviewPanelWrapper';

/**
 * Fő Preview Panel komponens XSS védelemmel
 * 
 * FIX: Tiszta elkülönítés az Inspector Mode és Custom Code Mode között
 * - Ha van mentett kód (hasSavedCode), azt jeleníti meg CLEAR gombbal
 * - Ha Code Mode aktív (isCodeMode) de nincs mentés, élő előnézet
 * - Egyébként Inspector Mode: dinamikus PreviewBox az inspector beállításokkal
 */
const PreviewPanel = memo(() => {
  const { 
    customHtml, 
    customCss, 
    isCodeMode, 
    savedHtml, 
    savedCss, 
    hasSavedCode,
    clearSavedCode, // FIX: új context action
    inspectorState, 
    generatedClasses 
  } = useCodePreview();
  
  const generatedStyles = useGeneratedStyles(inspectorState);
  
  // FIX: Mentett kód törlése callback
  const handleClearSavedCode = useCallback(() => {
    clearSavedCode?.();
  }, [clearSavedCode]);
  
  // Mentett kód használata, ha elérhető, különben az aktuális szerkesztett kód
  const displayHtml = useMemo(
    () => hasSavedCode ? savedHtml : customHtml,
    [hasSavedCode, savedHtml, customHtml]
  );
  
  const displayCss = useMemo(
    () => hasSavedCode ? savedCss : customCss,
    [hasSavedCode, savedCss, customCss]
  );
  
  // FIX: Egyszerűsített logika - mentett kód prioritást élvez
  // Ha van mentett kód, azt mutatjuk (függetlenül az isCodeMode-tól)
  // Ha nincs mentett kód, akkor isCodeMode alapján döntünk
  const shouldShowCustomCode = hasSavedCode || isCodeMode;

  return (
    <PreviewPanelWrapper>
      <PreviewHeader 
        hasSavedCode={hasSavedCode} 
        isCodeMode={isCodeMode}
        onClearSavedCode={handleClearSavedCode}
      />
      
      <div className="p-4">
        {shouldShowCustomCode ? (
          <CustomCodePreview 
            html={displayHtml}
            css={displayCss}
            hasSavedCode={hasSavedCode}
          />
        ) : (
          <PreviewBox 
            state={inspectorState}
            generatedClasses={generatedClasses}
            generatedStyles={generatedStyles}
          />
        )}
      </div>
    </PreviewPanelWrapper>
  );
});

PreviewPanel.displayName = 'PreviewPanel';

export default Index;
