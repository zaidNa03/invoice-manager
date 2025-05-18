import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { X, Download, Share2 } from 'lucide-react-native';
import { format } from 'date-fns';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTemplate } from '@/contexts/TemplateContext';
import { useBusinessContext } from '@/contexts/BusinessContext';

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
      image_url?: string;
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
  const { theme } = useTemplate();
  const { businessInfo } = useBusinessContext();

  const generateHtml = () => {
    const productsHtml = data.products
      .map(
        (product) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid ${theme.secondaryColor};">
            <div style="display: flex; align-items: center;">
              ${product.image_url ? `
                <img src="${product.image_url}" 
                     style="width: 40px; height: 40px; border-radius: 4px; margin-right: 12px; object-fit: cover;" />
              ` : ''}
              <span style="font-family: ${theme.fontFamily};">${product.name}</span>
            </div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid ${theme.secondaryColor}; text-align: center;">
            ${product.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid ${theme.secondaryColor}; text-align: right;">
            ${product.currency_code} ${product.price.toFixed(2)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid ${theme.secondaryColor}; text-align: right;">
            ${product.currency_code} ${(product.price * product.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('');

    const totalsHtml = data.totals
      .map(
        (total) => `
        <div style="margin-top: 12px; border-top: 2px solid ${theme.secondaryColor}; padding-top: 12px;">
          <h3 style="color: ${theme.primaryColor}; font-size: 16px; margin-bottom: 8px; font-family: ${theme.fontFamily};">
            ${total.currency}
          </h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #666666; font-family: ${theme.fontFamily};">Subtotal</span>
            <span style="color: #1a1a1a; font-family: ${theme.fontFamily};">
              ${total.currency} ${total.subtotal.toFixed(2)}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #666666; font-family: ${theme.fontFamily};">Tax (10%)</span>
            <span style="color: #1a1a1a; font-family: ${theme.fontFamily};">
              ${total.currency} ${total.taxAmount.toFixed(2)}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; border-top: 1px solid ${theme.secondaryColor}; padding-top: 8px;">
            <span style="color: ${theme.primaryColor}; font-weight: bold; font-family: ${theme.fontFamily};">Total</span>
            <span style="color: ${theme.accentColor}; font-weight: bold; font-family: ${theme.fontFamily};">
              ${total.currency} ${total.total.toFixed(2)}
            </span>
          </div>
        </div>
      `
      )
      .join('');

    const logoHtml = businessInfo?.logo_url
      ? `<img src="${businessInfo.logo_url}" style="width: 80px; height: 80px; border-radius: 8px; margin-bottom: 16px;" />`
      : '';

    const logoStyle = (() => {
      switch (theme.logoPosition) {
        case 'left':
          return 'text-align: left;';
        case 'right':
          return 'text-align: right;';
        case 'center':
          return 'text-align: center;';
      }
    })();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice</title>
          <style>
            body {
              font-family: ${theme.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              color: #1a1a1a;
              padding: 40px;
              background-color: ${theme.secondaryColor};
            }
            .page {
              max-width: 800px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th {
              background-color: ${theme.primaryColor};
              color: #ffffff;
              padding: 12px;
              text-align: left;
              font-family: ${theme.fontFamily};
            }
            td {
              padding: 12px;
              border-bottom: 1px solid ${theme.secondaryColor};
            }
            .product-image {
              width: 40px;
              height: 40px;
              border-radius: 4px;
              margin-right: 12px;
              object-fit: cover;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div style="${logoStyle} margin-bottom: 40px;">
              ${logoHtml}
              <h1 style="color: ${theme.primaryColor}; font-size: 32px; margin-bottom: 8px; font-family: ${theme.fontFamily};">
                ${businessInfo?.business_name || ''}
              </h1>
              ${businessInfo?.address ? `
                <p style="color: #666666; margin: 0; font-family: ${theme.fontFamily};">
                  ${businessInfo.address}
                </p>
              ` : ''}
            </div>
            
            <div style="margin-bottom: 40px;">
              <h2 style="color: ${theme.primaryColor}; font-size: 20px; margin-bottom: 16px; font-family: ${theme.fontFamily};">
                Bill To
              </h2>
              <p style="margin: 0;">
                <strong style="color: #1a1a1a; font-family: ${theme.fontFamily};">${data.customerName}</strong><br>
                ${data.customerEmail}<br>
                Due Date: ${format(new Date(data.dueDate), 'MMMM d, yyyy')}
              </p>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Item</th>
                  <th style="width: 15%; text-align: center;">Quantity</th>
                  <th style="width: 15%; text-align: right;">Price</th>
                  <th style="width: 20%; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>

            <div style="margin-left: auto; width: 300px;">
              ${totalsHtml}
            </div>

            ${data.notes ? `
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid ${theme.secondaryColor};">
                <h2 style="color: ${theme.primaryColor}; font-size: 20px; margin-bottom: 16px; font-family: ${theme.fontFamily};">
                  Notes
                </h2>
                <p style="color: #666666; margin: 0; font-family: ${theme.fontFamily};">${data.notes}</p>
              </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;
  };

  const handleShare = async () => {
    try {
      const html = generateHtml();
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
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

        <ScrollView style={[styles.content, { backgroundColor: theme.secondaryColor }]}>
          <View style={[styles.page, { backgroundColor: '#ffffff' }]}>
            <View style={[
              styles.header,
              theme.logoPosition === 'left' && styles.headerLeft,
              theme.logoPosition === 'right' && styles.headerRight,
              theme.logoPosition === 'center' && styles.headerCenter,
            ]}>
              {businessInfo?.logo_url && (
                <Image source={{ uri: businessInfo.logo_url }} style={styles.logo} />
              )}
              {businessInfo?.business_name && (
                <Text style={[styles.businessName, { color: theme.primaryColor, fontFamily: theme.fontFamily }]}>
                  {businessInfo.business_name}
                </Text>
              )}
              {businessInfo?.address && (
                <Text style={[styles.businessAddress, { fontFamily: theme.fontFamily }]}>
                  {businessInfo.address}
                </Text>
              )}
            </View>

            <View style={styles.customerSection}>
              <Text style={[styles.sectionTitle, { color: theme.primaryColor, fontFamily: theme.fontFamily }]}>
                Bill To
              </Text>
              <Text style={[styles.customerName, { fontFamily: theme.fontFamily }]}>
                {data.customerName}
              </Text>
              <Text style={[styles.customerEmail, { fontFamily: theme.fontFamily }]}>
                {data.customerEmail}
              </Text>
              <Text style={[styles.dueDate, { fontFamily: theme.fontFamily }]}>
                Due Date: {format(new Date(data.dueDate), 'MMMM d, yyyy')}
              </Text>
            </View>

            <View style={styles.itemsTable}>
              <View style={[styles.tableHeader, { backgroundColor: theme.primaryColor }]}>
                <Text style={[styles.headerCell, { flex: 3, color: '#ffffff', fontFamily: theme.fontFamily }]}>
                  Item
                </Text>
                <Text style={[styles.headerCell, { flex: 1, color: '#ffffff', fontFamily: theme.fontFamily }]}>
                  Qty
                </Text>
                <Text style={[styles.headerCell, { flex: 1, color: '#ffffff', fontFamily: theme.fontFamily }]}>
                  Price
                </Text>
                <Text style={[styles.headerCell, { flex: 1, color: '#ffffff', fontFamily: theme.fontFamily }]}>
                  Amount
                </Text>
              </View>

              {data.products.map((product, index) => (
                <View key={index} style={[styles.tableRow, { borderBottomColor: theme.secondaryColor }]}>
                  <View style={[styles.itemCell, { flex: 3 }]}>
                    {product.image_url && (
                      <Image source={{ uri: product.image_url }} style={styles.itemImage} />
                    )}
                    <Text style={[styles.itemName, { fontFamily: theme.fontFamily }]}>
                      {product.name}
                    </Text>
                  </View>
                  <Text style={[styles.cell, { flex: 1, fontFamily: theme.fontFamily }]}>
                    {product.quantity}
                  </Text>
                  <Text style={[styles.cell, { flex: 1, fontFamily: theme.fontFamily }]}>
                    {product.currency_code} {product.price.toFixed(2)}
                  </Text>
                  <Text style={[styles.cell, { flex: 1, fontFamily: theme.fontFamily }]}>
                    {product.currency_code} {(product.quantity * product.price).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.totalsContainer}>
              {data.totals.map((total, index) => (
                <View key={index} style={[styles.currencyTotal, { borderTopColor: theme.secondaryColor }]}>
                  <Text style={[styles.currencyTitle, { color: theme.primaryColor, fontFamily: theme.fontFamily }]}>
                    {total.currency}
                  </Text>
                  
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { fontFamily: theme.fontFamily }]}>Subtotal</Text>
                    <Text style={[styles.totalValue, { fontFamily: theme.fontFamily }]}>
                      {total.currency} {total.subtotal.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { fontFamily: theme.fontFamily }]}>Tax (10%)</Text>
                    <Text style={[styles.totalValue, { fontFamily: theme.fontFamily }]}>
                      {total.currency} {total.taxAmount.toFixed(2)}
                    </Text>
                  </View>

                  <View style={[styles.totalRow, styles.finalTotal, { borderTopColor: theme.secondaryColor }]}>
                    <Text style={[styles.finalTotalLabel, { color: theme.primaryColor, fontFamily: theme.fontFamily }]}>
                      Total
                    </Text>
                    <Text style={[styles.finalTotalValue, { color: theme.accentColor, fontFamily: theme.fontFamily }]}>
                      {total.currency} {total.total.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {data.notes && (
              <View style={[styles.notes, { borderTopColor: theme.secondaryColor }]}>
                <Text style={[styles.sectionTitle, { color: theme.primaryColor, fontFamily: theme.fontFamily }]}>
                  Notes
                </Text>
                <Text style={[styles.notesText, { fontFamily: theme.fontFamily }]}>{data.notes}</Text>
              </View>
            )}
          </View>
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
  page: {
    padding: 40,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerCenter: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 16,
  },
  businessName: {
    fontSize: 24,
    marginBottom: 8,
  },
  businessAddress: {
    fontSize: 14,
    color: '#666666',
  },
  customerSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  customerName: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 14,
    color: '#666666',
  },
  itemsTable: {
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  itemCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
  },
  itemName: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  cell: {
    fontSize: 14,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  totalsContainer: {
    alignSelf: 'flex-end',
    width: 300,
    marginBottom: 40,
  },
  currencyTotal: {
    marginBottom: 24,
    borderTopWidth: 2,
    paddingTop: 12,
  },
  currencyTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
  },
  totalValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  finalTotalLabel: {
    fontSize: 16,
  },
  finalTotalValue: {
    fontSize: 16,
  },
  notes: {
    borderTopWidth: 1,
    paddingTop: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#666666',
  },
});