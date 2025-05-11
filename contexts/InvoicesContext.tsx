import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Tables } from '@/lib/supabase';

type Invoice = Tables['invoices']['Row'];
type InvoiceItem = Tables['invoice_items']['Row'] & {
  product_image_url?: string;
};

interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

interface InvoicesContextType {
  invoices: InvoiceWithItems[];
  loading: boolean;
  error: string | null;
  refreshInvoices: () => Promise<void>;
  createInvoice: (invoice: CreateInvoiceData) => Promise<Invoice>;
  updateInvoice: (id: string, invoice: Partial<Tables['invoices']['Update']>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

interface CreateInvoiceData {
  customer_name: string;
  customer_email?: string;
  due_date?: string;
  notes?: string;
  items: Array<{
    product_id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency_code: string;
  }>;
}

const InvoicesContext = createContext<InvoicesContextType | null>(null);

export function InvoicesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthContext();
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      const invoicesWithItems: InvoiceWithItems[] = [];

      for (const invoice of invoicesData || []) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('invoice_items')
          .select(`
            *,
            products (
              image_url
            )
          `)
          .eq('invoice_id', invoice.id);

        if (itemsError) throw itemsError;

        const items = itemsData.map(item => ({
          ...item,
          product_image_url: item.products?.image_url
        }));

        invoicesWithItems.push({
          ...invoice,
          items,
        });
      }

      setInvoices(invoicesWithItems);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async () => {
    if (!session?.user) {
      throw new Error('No authenticated user');
    }

    const { data: latestInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestInvoice) {
      return 'INV-0001';
    }

    const currentNumber = parseInt(latestInvoice.invoice_number.split('-')[1]);
    return `INV-${String(currentNumber + 1).padStart(4, '0')}`;
  };

  const calculateTotals = (items: CreateInvoiceData['items']) => {
    const totals = items.reduce(
      (acc, item) => {
        const subtotal = item.unit_price * item.quantity;
        return {
          subtotal: acc.subtotal + subtotal,
          tax_amount: acc.tax_amount + subtotal * 0.1, // 10% tax rate
        };
      },
      { subtotal: 0, tax_amount: 0 }
    );

    return {
      ...totals,
      total: totals.subtotal + totals.tax_amount,
      tax_rate: 10,
    };
  };

  const createInvoice = async (data: CreateInvoiceData) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const invoiceNumber = await generateInvoiceNumber();
      const totals = calculateTotals(data.items);

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([
          {
            user_id: session.user.id,
            invoice_number: invoiceNumber,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            due_date: data.due_date,
            notes: data.notes,
            subtotal: totals.subtotal,
            tax_rate: totals.tax_rate,
            tax_amount: totals.tax_amount,
            total: totals.total,
            status: 'draft',
          },
        ])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const invoiceItems = data.items.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_code: item.currency_code,
        subtotal: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      await refreshInvoices();
      return invoice;
    } catch (err) {
      console.error('Error creating invoice:', err);
      throw new Error('Failed to create invoice');
    }
  };

  const updateInvoice = async (id: string, data: Partial<Tables['invoices']['Update']>) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('invoices')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await refreshInvoices();
    } catch (err) {
      console.error('Error updating invoice:', err);
      throw new Error('Failed to update invoice');
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await refreshInvoices();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      throw new Error('Failed to delete invoice');
    }
  };

  useEffect(() => {
    if (session?.user) {
      refreshInvoices();
    }
  }, [session]);

  return (
    <InvoicesContext.Provider
      value={{
        invoices,
        loading,
        error,
        refreshInvoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
      }}>
      {children}
    </InvoicesContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoicesContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoicesProvider');
  }
  return context;
}