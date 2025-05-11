import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useInvoices } from '@/contexts/InvoicesContext';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { format } from 'date-fns';
import { Share2, Trash2, Send, CircleCheck as CheckCircle2, Circle as XCircle, Clock, Ban } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export default function InvoiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, updateInvoice, deleteInvoice } = useInvoices();
  const { businessInfo } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const invoice = invoices.find(inv => inv.id === id);

  const getStatusColor = (status: InvoiceStatus) => {
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

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 size={20} color="#34C759" />;
      case 'sent':
        return <Send size={20} color="#007AFF" />;
      case 'cancelled':
        return <Ban size={20} color="#FF3B30" />;
      default:
        return <Clock size={20} color="#8E8E93" />;
    }
  };

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

  const generateHtml = () => {
    if (!invoice || !businessInfo) return '';

    const productsHtml = invoice.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: center;">${
            item.quantity
          }</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: right;">${
            item.currency_code
          } ${item.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: right;">${
            item.currency_code
          } ${item.subtotal.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              color: #1a1a1a;
              padding: 40px;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            <div style="text-align: right; margin-bottom: 40px;">
              ${
                businessInfo.logo_url
                  ? `<img src="${businessInfo.logo_url}" style="width: 80px; height: 80px; border-radius: 8px;" />`
                  : ''
              }
            </div>
            
            <div style="margin-bottom: 40px;">
              <h1 style="color: #1a1a1a; font-size: 32px; margin-bottom: 8px;">Invoice ${
                invoice.invoice_number
              }</h1>
              <p style="color: #666666; margin: 0;">
                Status: ${invoice.status?.toUpperCase() || 'DRAFT'}<br>
                Issue Date: ${format(new Date(invoice.created_at || ''), 'MMMM d, yyyy')}<br>
                Due Date: ${invoice.due_date ? format(new Date(invoice.due_date), 'MMMM d, yyyy') : 'Not set'}
              </p>
            </div>

            <div style="margin-bottom: 40px;">
              <div style="float: left; width: 50%;">
                <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">From</h2>
                <p style="margin: 0;">
                  <strong style="color: #1a1a1a;">${businessInfo.business_name}</strong><br>
                  ${businessInfo.address || ''}<br>
                  ${businessInfo.email || ''}<br>
                  ${businessInfo.phone || ''}<br>
                  ${businessInfo.tax_number ? `Tax Number: ${businessInfo.tax_number}` : ''}
                </p>
              </div>

              <div style="float: left; width: 50%;">
                <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Bill To</h2>
                <p style="margin: 0;">
                  <strong style="color: #1a1a1a;">${invoice.customer_name}</strong><br>
                  ${invoice.customer_email || ''}
                </p>
              </div>

              <div style="clear: both;"></div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; text-align: left;">Item</th>
                  <th style="padding: 12px; text-align: center;">Quantity</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                  <th style="padding: 12px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>

            <div style="margin-left: auto; width: 300px;">
              <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
                <span style="color: #666666;">Subtotal</span>
                <span style="color: #1a1a1a;">${invoice.items[0]?.currency_code} ${invoice.subtotal.toFixed(
      2
    )}</span>
              </div>
              <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
                <span style="color: #666666;">Tax (${invoice.tax_rate}%)</span>
                <span style="color: #1a1a1a;">${invoice.items[0]?.currency_code} ${invoice.tax_amount?.toFixed(
      2
    )}</span>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f1f1; display: flex; justify-content: space-between;">
                <span style="color: #1a1a1a; font-weight: bold;">Total</span>
                <span style="color: #007AFF; font-weight: bold;">${
                  invoice.items[0]?.currency_code
                } ${invoice.total.toFixed(2)}</span>
              </div>
            </div>

            ${
              invoice.notes
                ? `
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f1f1;">
                <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Notes</h2>
                <p style="color: #666666; margin: 0;">${invoice.notes}</p>
              </div>
              `
                : ''
            }
          </div>
        </body>
      </html>
    `;
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      const html = generateHtml();
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } catch (err) {
      setError('Failed to share invoice');
    } finally {
      setLoading(false);
    }
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
          <View>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(invoice.status as InvoiceStatus)}20` }]}>
              <View style={styles.statusIcon}>
                {getStatusIcon(invoice.status as InvoiceStatus)}
              </View>
              <Text style={[styles.statusText, { color: getStatusColor(invoice.status as InvoiceStatus) }]}>
                {invoice.status?.toUpperCase() || 'DRAFT'}
              </Text>
            </View>
          </View>

          <View style={styles.dates}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Issue Date</Text>
              <Text style={styles.dateValue}>
                {format(new Date(invoice.created_at || ''), 'MMM d, yyyy')}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Due Date</Text>
              <Text style={styles.dateValue}>
                {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.businessInfo}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={styles.businessName}>{businessInfo?.business_name}</Text>
            {businessInfo?.address && (
              <Text style={styles.businessDetail}>{businessInfo.address}</Text>
            )}
            {businessInfo?.email && (
              <Text style={styles.businessDetail}>{businessInfo.email}</Text>
            )}
            {businessInfo?.phone && (
              <Text style={styles.businessDetail}>{businessInfo.phone}</Text>
            )}
            {businessInfo?.tax_number && (
              <Text style={styles.businessDetail}>Tax Number: {businessInfo.tax_number}</Text>
            )}
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.customerName}>{invoice.customer_name}</Text>
            {invoice.customer_email && (
              <Text style={styles.customerEmail}>{invoice.customer_email}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.itemsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Item</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Price</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Amount</Text>
            </View>

            {invoice.items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.description}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                  {item.currency_code} {item.unit_price.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                  {item.currency_code} {item.subtotal.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {invoice.items[0]?.currency_code} {invoice.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax ({invoice.tax_rate}%)</Text>
            <Text style={styles.summaryValue}>
              {invoice.items[0]?.currency_code} {invoice.tax_amount?.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {invoice.items[0]?.currency_code} {invoice.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{invoice.notes}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <View style={styles.statusActions}>
          {invoice.status !== 'paid' && (
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#34C75920' }]}
              onPress={() => handleStatusChange('paid')}
              disabled={loading}
            >
              <CheckCircle2 size={20} color="#34C759" />
              <Text style={[styles.statusButtonText, { color: '#34C759' }]}>
                Mark as Paid
              </Text>
            </TouchableOpacity>
          )}
          {invoice.status === 'draft' && (
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#007AFF20' }]}
              onPress={() => handleStatusChange('sent')}
              disabled={loading}
            >
              <Send size={20} color="#007AFF" />
              <Text style={[styles.statusButtonText, { color: '#007AFF' }]}>
                Mark as Sent
              </Text>
            </TouchableOpacity>
          )}
          {invoice.status !== 'cancelled' && (
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#FF3B3020' }]}
              onPress={() => handleStatusChange('cancelled')}
              disabled={loading}
            >
              <XCircle size={20} color="#FF3B30" />
              <Text style={[styles.statusButtonText, { color: '#FF3B30' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mainActions}>
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
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  dates: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 24,
  },
  dateItem: {
    flex: 1,
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
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  businessInfo: {
    marginBottom: 24,
  },
  businessName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  businessDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  customerInfo: {},
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  customerEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  itemsTable: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  tableCell: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1a1a1a',
  },
  summary: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
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
  notes: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  actions: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  statusButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  mainActions: {
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