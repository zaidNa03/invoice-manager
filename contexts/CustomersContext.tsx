import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Tables } from '@/lib/supabase';

type Customer = Tables['customers']['Row'];

interface CustomersContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

const CustomersContext = createContext<CustomersContextType | null>(null);

export function CustomersProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customer, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;
      await refreshCustomers();
      return data;
    } catch (err) {
      console.error('Error adding customer:', err);
      throw new Error('Failed to add customer');
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('customers')
        .update({
          ...customer,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await refreshCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      throw new Error('Failed to update customer');
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await refreshCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw new Error('Failed to delete customer');
    }
  };

  useEffect(() => {
    if (session?.user) {
      refreshCustomers();
    }
  }, [session]);

  return (
    <CustomersContext.Provider
      value={{
        customers,
        loading,
        error,
        refreshCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
      }}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
}