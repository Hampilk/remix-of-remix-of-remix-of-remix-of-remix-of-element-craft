import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '../ui/button';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hu' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 gap-1 text-[10px] font-medium"
      onClick={toggleLanguage}
      title={language === 'en' ? 'Switch to Hungarian' : 'Váltás angolra'}
    >
      <Globe className="w-3 h-3" />
      <span className="uppercase">{language}</span>
    </Button>
  );
};
