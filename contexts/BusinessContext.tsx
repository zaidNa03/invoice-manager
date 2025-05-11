import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';

type BusinessInfo = Tables['business_info']['Row'];

interface BusinessContextType {
  businessInfo: BusinessInfo | null;
  loading: boolean;
  error: string | null;
  updateBusinessInfo: (info: Partial<Tables['business_info']['Update']>) => Promise<void>;
  refreshBusinessInfo: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | null>(null);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthContext();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBusinessInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user) {
        setError('No authenticated user');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('business_info')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No business info found, create default entry
          const { data: newData, error: createError } = await supabase
            .from('business_info')
            .insert([{
              user_id: session.user.id,
              business_name: 'My Business',
              default_currency: 'USD'
            }])
            .select()
            .single();

          if (createError) throw createError;
          setBusinessInfo(newData);
        } else {
          throw error;
        }
      } else {
        setBusinessInfo(data);
      }
    } catch (err) {
      setError('Failed to load business information');
      console.error('Error loading business info:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessInfo = async (info: Partial<Tables['business_info']['Update']>) => {
    try {
      setError(null);
      
      if (!businessInfo?.id) {
        throw new Error('No business info found');
      }

      const { error } = await supabase
        .from('business_info')
        .update({
          ...info,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessInfo.id);

      if (error) throw error;
      await refreshBusinessInfo();
    } catch (err) {
      setError('Failed to update business information');
      throw err;
    }
  };

  useEffect(() => {
    if (session?.user) {
      refreshBusinessInfo();
    }
  }, [session]);

  return (
    <BusinessContext.Provider
      value={{
        businessInfo,
        loading,
        error,
        updateBusinessInfo,
        refreshBusinessInfo,
      }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
}