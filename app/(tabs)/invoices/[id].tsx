import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useInvoices } from '@/contexts/InvoicesContext';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Share2, Trash2, CircleCheck, Circle, Clock, Ban } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import InvoicePreview from '../../../components/InvoicePreview';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

interface StatusOption {
  value: InvoiceStatus;
  label: string;
  icon: typeof CircleCheck;
  color: string;
  backgroundColor: string;
}

const statusOptions: StatusOption[] = [
  {
    value: 'draft',
    label: 'Draft',
    icon: Clock,
    color: '#8E8E93',
    backgroundColor: '#8E8E9320',
  },
  {
    value: 'sent',
    label: 'Sent',
    icon: Circle,
    color: '#007AFF',
    backgroundColor: '#007AFF20',
  },
  {
    value: 'paid',
    label: 'Paid',
    icon: CircleCheck,
    color: '#34C759',
    backgroundColor: '#34C75920',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    icon: Ban,
    color: '#FF3B30',
    backgroundColor: '#FF3B3020',
  },
];

export default function InvoiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, updateInvoice, deleteInvoice } = useInvoices();
  const { businessInfo } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const invoice = invoices.find(inv => inv.id === id);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    try {
      setLoading(true);
      setError(null);
      await updateInvoice(id, { status: newStatus });
    } catch (err) {
      setError('Failed to update invoice status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteInvoice(id);
      router.back();
    } catch (err) {
      setError('Failed to delete invoice');
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
    }
  };

  const handleShare = async () => {
    setShowPreview(true);
  };

  if (!invoice) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
          <View style={styles.statusOptions}>
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isActive = invoice.status === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    { backgroundColor: isActive ? option.backgroundColor : '#f8f9fa' }
                  ]}
                  onPress={() => handleStatusChange(option.value)}
                  disabled={loading}
                >
                  <Icon size={20} color={isActive ? option.color : '#8E8E93'} />
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: isActive ? option.color : '#8E8E93' }
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewContainer}>
            <InvoicePreview
              visible={false}
              onClose={() => {}}
              data={{
                customerName: invoice.customer_name,
                customerEmail: invoice.customer_email || '',
                dueDate: invoice.due_date || new Date().toISOString(),
                notes: invoice.notes || '',
                products: invoice.items.map(item => ({
                  id: item.id,
                  name: item.description,
                  price: item.unit_price,
                  currency_code: item.currency_code,
                  quantity: item.quantity,
                  image_url: item.product_image_url,
                })),
                totals: [{
                  currency: invoice.items[0]?.currency_code || 'USD',
                  subtotal: invoice.subtotal,
                  taxAmount: invoice.tax_amount || 0,
                  total: invoice.total,
                }],
              }}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={loading}
        >
          <Share2 size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => setShowConfirmDelete(true)}
          disabled={loading}
        >
          <Trash2 size={20} color="#FF3B30" />
          <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>

      {showConfirmDelete && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Invoice</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmDelete(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDelete}
              >
                <Text style={[styles.modalButtonText, { color: '#FF3B30' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <InvoicePreview
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        data={{
          customerName: invoice.customer_name,
          customerEmail: invoice.customer_email || '',
          dueDate: invoice.due_date || new Date().toISOString(),
          notes: invoice.notes || '',
          products: invoice.items.map(item => ({
            id: item.id,
            name: item.description,
            price: item.unit_price,
            currency_code: item.currency_code,
            quantity: item.quantity,
            image_url: item.product_image_url,
          })),
          totals: [{
            currency: invoice.items[0]?.currency_code || 'USD',
            subtotal: invoice.subtotal,
            taxAmount: invoice.tax_amount || 0,
            total: invoice.total,
          }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    margin: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  invoiceNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  previewContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  actions: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#f0f9ff',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
  },
  confirmButton: {
    backgroundColor: '#ffebee',
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
});