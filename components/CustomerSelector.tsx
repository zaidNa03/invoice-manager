import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Search, X, Plus, User } from 'lucide-react-native';
import { useCustomers } from '@/contexts/CustomersContext';
import { Link } from 'expo-router';

type CustomerSelectorProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (customer: { id: string; name: string; email: string | null }) => void;
};

export default function CustomerSelector({ visible, onClose, onSelect }: CustomerSelectorProps) {
  const { customers, loading, error, refreshCustomers } = useCustomers();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) {
      refreshCustomers();
    }
  }, [visible]);

  const filteredCustomers = customers.filter(
    customer =>
      customer.first_name.toLowerCase().includes(search.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(search.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (customer: typeof customers[0]) => {
    onSelect({
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email || null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Customer</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCustomers}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Link href="/customers/add" asChild>
                <TouchableOpacity style={styles.addCustomerButton}>
                  <Plus size={20} color="#007AFF" />
                  <Text style={styles.addCustomerText}>Add New Customer</Text>
                </TouchableOpacity>
              </Link>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {loading ? 'Loading customers...' : 'No customers found'}
                </Text>
              </View>
            }
            renderItem={({ item: customer }) => (
              <TouchableOpacity
                style={styles.customerItem}
                onPress={() => handleSelect(customer)}>
                <View style={styles.customerIcon}>
                  <User size={20} color="#007AFF" />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>
                    {customer.first_name} {customer.last_name}
                  </Text>
                  {customer.email && (
                    <Text style={styles.customerEmail}>{customer.email}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1a1a1a',
  },
  list: {
    padding: 16,
  },
  addCustomerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addCustomerText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
  },
});