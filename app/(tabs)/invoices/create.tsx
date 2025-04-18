import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { Package, Plus, Trash2, Eye, User } from 'lucide-react-native';
import ProductSelector from '../../../components/ProductSelector';
import CustomerSelector from '../../../components/CustomerSelector';
import InvoicePreview from '../../../components/InvoicePreview';
import { useInvoices } from '@/contexts/InvoicesContext';

type Product = {
  id: string;
  name: string;
  price: number;
  currency_code: string;
  quantity: number;
};

export default function CreateInvoiceScreen() {
  const { createInvoice } = useInvoices();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddProduct = () => {
    setShowProductSelector(true);
  };

  const handleSelectCustomer = (customer: { name: string; email: string | null }) => {
    setCustomerName(customer.name);
    if (customer.email) {
      setCustomerEmail(customer.email);
    }
  };

  const handleProductSelect = (products: Array<{ product: any; quantity: number }>) => {
    setSelectedProducts(prev => [
      ...prev,
      ...products.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        currency_code: product.currency_code,
        quantity,
      })),
    ]);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const calculateTotals = () => {
    // Group products by currency
    const currencyGroups = selectedProducts.reduce((acc, product) => {
      const { currency_code, price, quantity } = product;
      if (!acc[currency_code]) {
        acc[currency_code] = 0;
      }
      acc[currency_code] += price * quantity;
      return acc;
    }, {} as Record<string, number>);

    // Calculate tax for each currency group
    const taxRate = 0.1; // 10% tax rate
    const totals = Object.entries(currencyGroups).map(([currency, subtotal]) => ({
      currency,
      subtotal,
      taxAmount: subtotal * taxRate,
      total: subtotal * (1 + taxRate),
    }));

    return totals;
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!customerName.trim()) {
        throw new Error('Customer name is required');
      }

      if (selectedProducts.length === 0) {
        throw new Error('Please add at least one product');
      }

      await createInvoice({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || undefined,
        due_date: dueDate,
        notes: notes.trim(),
        items: selectedProducts.map(product => ({
          product_id: product.id,
          description: product.name,
          quantity: product.quantity,
          unit_price: product.price,
          currency_code: product.currency_code,
        })),
      });

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <TouchableOpacity 
          style={styles.customerSelector}
          onPress={() => setShowCustomerSelector(true)}
        >
          {customerName ? (
            <View style={styles.selectedCustomer}>
              <View style={styles.customerIcon}>
                <User size={20} color="#007AFF" />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customerName}</Text>
                {customerEmail && (
                  <Text style={styles.customerEmail}>{customerEmail}</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.selectCustomerPrompt}>
              <User size={24} color="#007AFF" />
              <Text style={styles.selectCustomerText}>Select Customer</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Products</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <Plus size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {selectedProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={32} color="#007AFF" />
            <Text style={styles.emptyStateText}>No products added</Text>
            <Text style={styles.emptyStateSubtext}>Add products to your invoice</Text>
          </View>
        ) : (
          <View style={styles.productList}>
            {selectedProducts.map((product) => (
              <View key={product.id} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>
                    {product.currency_code} {product.price.toFixed(2)} × {product.quantity}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveProduct(product.id)}
                >
                  <Trash2 size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes to your invoice"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.summary}>
        {calculateTotals().map(({ currency, subtotal, taxAmount, total }) => (
          <View key={currency} style={styles.currencyGroup}>
            <Text style={styles.currencyTitle}>{currency}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {currency} {subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%)</Text>
              <Text style={styles.summaryValue}>
                {currency} {taxAmount.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {currency} {total.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.previewButton} onPress={handlePreview}>
          <Eye size={20} color="#007AFF" />
          <Text style={styles.previewButtonText}>Preview Invoice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Create Invoice</Text>
          )}
        </TouchableOpacity>
      </View>

      <ProductSelector
        visible={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onSelect={handleProductSelect}
      />

      <CustomerSelector
        visible={showCustomerSelector}
        onClose={() => setShowCustomerSelector(false)}
        onSelect={handleSelectCustomer}
      />

      <InvoicePreview
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        data={{
          customerName,
          customerEmail,
          dueDate,
          notes,
          products: selectedProducts,
          totals: calculateTotals(),
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  customerSelector: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  selectedCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  selectCustomerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  selectCustomerText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  productList: {
    marginTop: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  removeButton: {
    padding: 8,
  },
  summary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  currencyGroup: {
    marginBottom: 16,
  },
  currencyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
  },
  previewButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});