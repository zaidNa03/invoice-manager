import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { X, Download, Share2 } from 'lucide-react-native';
import { format } from 'date-fns';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type InvoicePreviewProps = {
  visible: boolean;
  onClose: () => void;
  data: {
    customerName: string;
    customerEmail: string;
    dueDate: string;
    notes: string;
    products: Array<{
      id: string;
      name: string;
      price: number;
      currency_code: string;
      quantity: number;
    }>;
    totals: Array<{
      currency: string;
      subtotal: number;
      taxAmount: number;
      total: number;
    }>;
  };
};

export default function InvoicePreview({ visible, onClose, data }: InvoicePreviewProps) {
  const generateHtml = () => {
    const productsHtml = data.products
      .map(
        (product) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1;">${product.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: center;">${
            product.quantity
          }</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: right;">${
            product.currency_code
          } ${product.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: right;">${
            product.currency_code
          } ${(product.price * product.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const totalsHtml = data.totals
      .map(
        (total) => `
        <div style="margin-top: 12px; border-top: 2px solid #f1f1f1; padding-top: 12px;">
          <h3 style="color: #1a1a1a; font-size: 16px; margin-bottom: 8px;">${total.currency}</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #666666;">Subtotal</span>
            <span style="color: #1a1a1a;">${total.currency} ${total.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #666666;">Tax (10%)</span>
            <span style="color: #1a1a1a;">${total.currency} ${total.taxAmount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; border-top: 1px solid #f1f1f1; padding-top: 8px;">
            <span style="color: #1a1a1a; font-weight: bold;">Total</span>
            <span style="color: #007AFF; font-weight: bold;">${total.currency} ${total.total.toFixed(
          2
        )}</span>
          </div>
        </div>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice</title>
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
              <img src="https://images.unsplash.com/photo-1622675363311-3e1904dc1885?w=128&h=128&fit=crop" 
                   style="width: 80px; height: 80px; border-radius: 8px;" />
            </div>
            
            <div style="margin-bottom: 40px;">
              <h1 style="color: #1a1a1a; font-size: 32px; margin-bottom: 8px;">Invoice</h1>
              <p style="color: #666666; margin: 0;">
                Date: ${format(new Date(), 'MMMM d, yyyy')}
              </p>
            </div>

            <div style="margin-bottom: 40px;">
              <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Bill To</h2>
              <p style="margin: 0;">
                <strong style="color: #1a1a1a;">${data.customerName}</strong><br>
                ${data.customerEmail}<br>
                Due Date: ${format(new Date(data.dueDate), 'MMMM d, yyyy')}
              </p>
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
              ${totalsHtml}
            </div>

            ${
              data.notes
                ? `
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f1f1;">
                <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Notes</h2>
                <p style="color: #666666; margin: 0;">${data.notes}</p>
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
      const html = generateHtml();
      const { uri } = await Print.printToFileAsync({ html });
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Sharing.shareAsync(uri);
      } else {
        const blob = await (await fetch(uri)).blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Invoice Preview</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share2 size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.logo}>
            <View style={styles.logoImage} />
          </View>

          <View style={styles.section}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.date}>
              Date: {format(new Date(), 'MMMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.customerName}>{data.customerName}</Text>
            <Text style={styles.customerEmail}>{data.customerEmail}</Text>
            <Text style={styles.dueDate}>
              Due Date: {format(new Date(data.dueDate), 'MMMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Item</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Price</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Amount</Text>
            </View>

            {data.products.map((product) => (
              <View key={product.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{product.name}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                  {product.quantity}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                  {product.currency_code} {product.price.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                  {product.currency_code} {(product.price * product.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsContainer}>
            {data.totals.map((total) => (
              <View key={total.currency} style={styles.currencyTotal}>
                <Text style={styles.currencyTitle}>{total.currency}</Text>
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>
                    {total.currency} {total.subtotal.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax (10%)</Text>
                  <Text style={styles.totalValue}>
                    {total.currency} {total.taxAmount.toFixed(2)}
                  </Text>
                </View>

                <View style={[styles.totalRow, styles.finalTotal]}>
                  <Text style={styles.finalTotalLabel}>Total</Text>
                  <Text style={styles.finalTotalValue}>
                    {total.currency} {total.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {data.notes && (
            <View style={styles.notes}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{data.notes}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logo: {
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  section: {
    marginBottom: 40,
  },
  invoiceTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  table: {
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  tableCell: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1a1a1a',
  },
  totalsContainer: {
    alignSelf: 'flex-end',
    width: 300,
    marginBottom: 40,
  },
  currencyTotal: {
    marginBottom: 24,
  },
  currencyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  totalValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  finalTotalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  finalTotalValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  notes: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  notesText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
});