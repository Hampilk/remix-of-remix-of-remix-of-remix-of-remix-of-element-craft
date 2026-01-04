import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Download, X, Globe, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InspectorState } from './types';

type PresetCategory = 'custom' | 'typography' | 'layout' | 'effects' | 'colors';

interface StylePreset {
  id: string;
  name: string;
  description: string | null;
  category: string;
  state_json: InspectorState;
  is_public: boolean;
  tags: string[];
  created_at: string;
}

interface StylePresetsProps {
  currentState: InspectorState;
  onLoadPreset: (state: InspectorState) => void;
  onClose: () => void;
}

export const StylePresets: React.FC<StylePresetsProps> = ({ currentState, onLoadPreset, onClose }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [presets, setPresets] = useState<StylePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  // Save form state
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState<PresetCategory>('custom');
  const [newPresetPublic, setNewPresetPublic] = useState(true);

  const categories: PresetCategory[] = ['custom', 'typography', 'layout', 'effects', 'colors'];

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('style_presets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion for the fetched data
      const typedData = (data || []).map(item => ({
        ...item,
        state_json: item.state_json as unknown as InspectorState,
        tags: item.tags || []
      })) as StylePreset[];
      
      setPresets(typedData);
    } catch (error) {
      console.error('Error fetching presets:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load presets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) return;

    try {
      const { error } = await supabase
        .from('style_presets')
        .insert([{
          name: newPresetName,
          description: newPresetDescription || null,
          category: newPresetCategory,
          state_json: JSON.parse(JSON.stringify(currentState)),
          is_public: newPresetPublic,
          tags: [],
        }]);

      if (error) throw error;

      toast({
        title: t('presets.saved'),
        description: t('presets.savedDesc'),
      });

      setShowSaveForm(false);
      setNewPresetName('');
      setNewPresetDescription('');
      setNewPresetCategory('custom');
      setNewPresetPublic(true);
      fetchPresets();
    } catch (error) {
      console.error('Error saving preset:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to save preset',
        variant: 'destructive',
      });
    }
  };

  const handleLoadPreset = (preset: StylePreset) => {
    onLoadPreset(preset.state_json);
    toast({
      title: t('presets.loaded'),
      description: t('presets.loadedDesc'),
    });
  };

  const handleDeletePreset = async (id: string) => {
    try {
      const { error } = await supabase
        .from('style_presets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('presets.deleted'),
        description: t('presets.deletedDesc'),
      });
      fetchPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to delete preset',
        variant: 'destructive',
      });
    }
  };

  const filteredPresets = presets.filter(preset =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-2xl shadow-[var(--shadow-panel)] w-72 max-h-[80vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border py-2 px-4 bg-secondary/50 flex-shrink-0">
        <h3 className="text-xs uppercase font-bold text-primary">{t('presets.title')}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Search & Save Button */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder={t('presets.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs pl-7"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs gap-1.5"
          onClick={() => setShowSaveForm(!showSaveForm)}
        >
          <Plus className="w-3 h-3" />
          {t('presets.saveNew')}
        </Button>
      </div>

      {/* Save Form */}
      {showSaveForm && (
        <div className="p-3 border-b border-border bg-secondary/20 space-y-3">
          <Input
            placeholder={t('presets.name')}
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="h-7 text-xs"
          />
          <Textarea
            placeholder={t('presets.description')}
            value={newPresetDescription}
            onChange={(e) => setNewPresetDescription(e.target.value)}
            className="text-xs min-h-[60px] resize-none"
          />
          <Select value={newPresetCategory} onValueChange={(v) => setNewPresetCategory(v as PresetCategory)}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder={t('presets.category')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {t(`presets.categories.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="preset-public"
                checked={newPresetPublic}
                onCheckedChange={setNewPresetPublic}
              />
              <Label htmlFor="preset-public" className="text-xs">
                {t('presets.makePublic')}
              </Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={handleSavePreset}
              disabled={!newPresetName.trim()}
            >
              {t('presets.save')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowSaveForm(false)}
            >
              {t('presets.cancel')}
            </Button>
          </div>
        </div>
      )}

      {/* Presets List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : filteredPresets.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              {t('presets.noPresets')}
            </div>
          ) : (
            filteredPresets.map(preset => (
              <div
                key={preset.id}
                className="border border-border rounded-lg p-3 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {preset.is_public ? (
                        <Globe className="w-3 h-3 text-green-500" />
                      ) : (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium truncate">{preset.name}</span>
                    </div>
                    {preset.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {preset.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded">
                        {t(`presets.categories.${preset.category}`)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    className="flex-1 h-6 text-[10px] gap-1"
                    onClick={() => handleLoadPreset(preset)}
                  >
                    <Download className="w-3 h-3" />
                    {t('presets.load')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDeletePreset(preset.id)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
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
