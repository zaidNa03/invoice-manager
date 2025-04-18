import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Plus, Receipt, Eye, Trash2 } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { useInvoices } from '@/contexts/InvoicesContext';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useState } from 'react';
import { format } from 'date-fns';

export default function InvoicesScreen() {
  const { invoices, loading, error, refreshInvoices, deleteInvoice } = useInvoices();
  const { businessInfo } = useBusinessContext();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshInvoices();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteError(null);
      await deleteInvoice(id);
    } catch (err) {
      setDeleteError('Failed to delete invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#34C759';
      case 'sent':
        return '#007AFF';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {businessInfo?.logo_url ? (
          <Image source={{ uri: businessInfo.logo_url }} style={styles.logo} />
        ) : (
          <View style={[styles.logo, styles.logoPlaceholder]}>
            <Receipt size={24} color="#007AFF" />
          </View>
        )}
        <Text style={styles.title}>Invoices</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {(error || deleteError) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || deleteError}</Text>
          </View>
        )}

        {invoices.length === 0 ? (
          <View style={styles.emptyState}>
            <Receipt size={48} color="#007AFF" />
            <Text style={styles.emptyStateText}>No invoices yet</Text>
            <Text style={styles.emptyStateSubtext}>Create your first invoice to get started</Text>
            <Link href="/invoices/create" asChild>
              <TouchableOpacity style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Create First Invoice</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <View style={styles.invoiceList}>
            {invoices.map((invoice) => (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <View>
                    <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                    <Text style={styles.customerName}>{invoice.customer_name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(invoice.status || 'draft')}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(invoice.status || 'draft') }]}>
                      {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Draft'}
                    </Text>
                  </View>
                </View>

                <ScrollView horizontal style={styles.productList} showsHorizontalScrollIndicator={false}>
                  {invoice.items.map((item) => (
                    <View key={item.id} style={styles.productItem}>
                      {item.product_id && (
                        <Image 
                          source={{ uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' }} 
                          style={styles.productImage} 
                        />
                      )}
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.description}
                      </Text>
                      <Text style={styles.productPrice}>
                        {item.currency_code} {item.unit_price.toFixed(2)} × {item.quantity}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.invoiceFooter}>
                  <View>
                    <Text style={styles.dateLabel}>Due Date</Text>
                    <Text style={styles.dateValue}>
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'Not set'}
                    </Text>
                  </View>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      {invoice.items[0]?.currency_code} {invoice.total.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    <Eye size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(invoice.id)}
                  >
                    <Trash2 size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Link href="/invoices/create" asChild>
        <TouchableOpacity style={styles.fab}>
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  logoPlaceholder: {
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  invoiceList: {
    gap: 16,
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  invoiceNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  productList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productItem: {
    marginRight: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    width: 120,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 4,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewButton: {
    backgroundColor: '#f0f9ff',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});