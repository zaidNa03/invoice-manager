import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTemplate } from '@/contexts/TemplateContext';
import { useBusinessContext } from '@/contexts/BusinessContext';

interface TemplatePreviewProps {
  data: {
    customerName: string;
    customerEmail: string;
    dueDate: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      currency_code: string;
      image_url?: string;
    }>;
    notes?: string;
  };
}

export default function TemplatePreview({ data }: TemplatePreviewProps) {
  const { theme } = useTemplate();
  const { businessInfo } = useBusinessContext();

  const getLogoStyle = () => {
    switch (theme.logoPosition) {
      case 'left':
        return { alignSelf: 'flex-start' };
      case 'right':
        return { alignSelf: 'flex-end' };
      case 'center':
        return { alignSelf: 'center' };
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.secondaryColor }]}>
      <View style={[styles.page, { backgroundColor: '#ffffff' }]}>
        <View style={[styles.header, getLogoStyle()]}>
          {businessInfo?.logo_url && (
            <Image 
              source={{ uri: businessInfo.logo_url }} 
              style={styles.logo}
            />
          )}
          <Text style={[styles.businessName, { color: theme.primaryColor, fontFamily: theme.fontFamily }]}>
            {businessInfo?.business_name}
          </Text>
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
        </View>

        <View style={styles.itemsTable}>
          <View style={[styles.tableHeader, { backgroundColor: theme.primaryColor }]}>
            <Text style={[styles.headerCell, { flex: 2, color: '#ffffff', fontFamily: theme.fontFamily }]}>Item</Text>
            <Text style={[styles.headerCell, { flex: 1, color: '#ffffff', fontFamily: theme.fontFamily }]}>Qty</Text>
            <Text style={[styles.headerCell, { flex: 1, color: '#ffffff', fontFamily: theme.fontFamily }]}>Price</Text>
            <Text style={[styles.headerCell, { flex: 1, color: '#ffffff', fontFamily: theme.fontFamily }]}>Amount</Text>
          </View>

          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.itemCell, { flex: 2 }]}>
                {item.image_url && (
                  <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                )}
                <Text style={[styles.itemName, { fontFamily: theme.fontFamily }]}>{item.name}</Text>
              </View>
              <Text style={[styles.cell, { flex: 1, fontFamily: theme.fontFamily }]}>{item.quantity}</Text>
              <Text style={[styles.cell, { flex: 1, fontFamily: theme.fontFamily }]}>
                {item.currency_code} {item.price.toFixed(2)}
              </Text>
              <Text style={[styles.cell, { flex: 1, fontFamily: theme.fontFamily }]}>
                {item.currency_code} {(item.quantity * item.price).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {data.notes && (
          <View style={styles.notes}>
            <Text style={[styles.sectionTitle, { color: theme.primaryColor, fontFamily: theme.fontFamily }]}>
              Notes
            </Text>
            <Text style={[styles.notesText, { fontFamily: theme.fontFamily }]}>{data.notes}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    aspectRatio: 1 / Math.sqrt(2), // A4 aspect ratio
  },
  header: {
    marginBottom: 40,
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
    borderBottomColor: '#f1f1f1',
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
  },
  itemName: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  cell: {
    fontSize: 14,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  notes: {
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    paddingTop: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#666666',
  },
});