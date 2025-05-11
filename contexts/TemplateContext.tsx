import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';

export type TemplateTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  layout: 'compact' | 'standard' | 'detailed';
  logoPosition: 'left' | 'right' | 'center';
};

const defaultTheme: TemplateTheme = {
  primaryColor: '#007AFF',
  secondaryColor: '#f8f9fa',
  accentColor: '#34C759',
  fontFamily: 'Inter-Regular',
  layout: 'standard',
  logoPosition: 'right',
};

interface TemplateContextType {
  theme: TemplateTheme;
  updateTheme: (updates: Partial<TemplateTheme>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TemplateContext = createContext<TemplateContextType | null>(null);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthContext();
  const [theme, setTheme] = useState<TemplateTheme>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTheme = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error: fetchError } = await supabase
        .from('template_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No settings found, create default
          const { data: newData, error: createError } = await supabase
            .from('template_settings')
            .insert([{
              user_id: session.user.id,
              primary_color: defaultTheme.primaryColor,
              secondary_color: defaultTheme.secondaryColor,
              accent_color: defaultTheme.accentColor,
              font_family: defaultTheme.fontFamily,
              layout: defaultTheme.layout,
              logo_position: defaultTheme.logoPosition
            }])
            .select()
            .single();

          if (createError) throw createError;
          setTheme({
            primaryColor: newData.primary_color,
            secondaryColor: newData.secondary_color,
            accentColor: newData.accent_color,
            fontFamily: newData.font_family,
            layout: newData.layout as 'compact' | 'standard' | 'detailed',
            logoPosition: newData.logo_position as 'left' | 'right' | 'center'
          });
        } else {
          throw fetchError;
        }
      } else {
        setTheme({
          primaryColor: data.primary_color,
          secondaryColor: data.secondary_color,
          accentColor: data.accent_color,
          fontFamily: data.font_family,
          layout: data.layout as 'compact' | 'standard' | 'detailed',
          logoPosition: data.logo_position as 'left' | 'right' | 'center'
        });
      }
    } catch (err) {
      console.error('Error loading template settings:', err);
      setError('Failed to load template settings');
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (updates: Partial<TemplateTheme>) => {
    try {
      setError(null);

      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const dbUpdates = {
        ...(updates.primaryColor && { primary_color: updates.primaryColor }),
        ...(updates.secondaryColor && { secondary_color: updates.secondaryColor }),
        ...(updates.accentColor && { accent_color: updates.accentColor }),
        ...(updates.fontFamily && { font_family: updates.fontFamily }),
        ...(updates.layout && { layout: updates.layout }),
        ...(updates.logoPosition && { logo_position: updates.logoPosition }),
        updated_at: new Date().toISOString()
      };

      // First, ensure settings exist
      const { data: existing } = await supabase
        .from('template_settings')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!existing) {
        // Create initial settings if they don't exist
        const { error: createError } = await supabase
          .from('template_settings')
          .insert([{
            user_id: session.user.id,
            primary_color: defaultTheme.primaryColor,
            secondary_color: defaultTheme.secondaryColor,
            accent_color: defaultTheme.accentColor,
            font_family: defaultTheme.fontFamily,
            layout: defaultTheme.layout,
            logo_position: defaultTheme.logoPosition,
            ...dbUpdates
          }]);

        if (createError) throw createError;
      } else {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('template_settings')
          .update(dbUpdates)
          .eq('user_id', session.user.id);

        if (updateError) throw updateError;
      }

      setTheme(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Error updating template settings:', err);
      throw new Error('Failed to update template settings');
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadTheme();
    }
  }, [session]);

  return (
    <TemplateContext.Provider value={{ theme, updateTheme, loading, error }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}