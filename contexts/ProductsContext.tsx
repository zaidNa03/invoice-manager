import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';

type Product = Tables['products']['Row'];

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Tables['products']['Insert'], 'id' | 'user_id'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Tables['products']['Update']>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Tables['products']['Insert'], 'id' | 'user_id'>) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...product, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;
      await refreshProducts();
      return data;
    } catch (err) {
      console.error('Error adding product:', err);
      throw new Error('Failed to add product');
    }
  };

  const updateProduct = async (id: string, product: Partial<Tables['products']['Update']>) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await refreshProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      throw new Error('Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await refreshProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      throw new Error('Failed to delete product');
    }
  };

  useEffect(() => {
    if (session?.user) {
      refreshProducts();
    }
  }, [session]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}