// AI Styler Hook - Uses Lovable AI to parse style prompts
import { useState, useCallback } from 'react';
import type { InspectorState } from './types';
import { supabase } from '@/integrations/supabase/client';

interface AIStylerResult {
  success: boolean;
  changes: Partial<InspectorState>;
  message?: string;
}

export const useAIStyler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPrompt = useCallback(async (
    prompt: string,
    currentState: InspectorState
  ): Promise<AIStylerResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-styler', {
        body: {
          prompt,
          currentState
        }
      });

      if (fnError) throw fnError;

      return {
        success: true,
        changes: data.changes || {},
        message: data.message
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed';
      setError(message);
      return {
        success: false,
        changes: {},
        message
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    applyPrompt,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};
