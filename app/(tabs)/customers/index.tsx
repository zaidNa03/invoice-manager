import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Plus, Users, Pencil, Trash2, Mail, Phone } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useCustomers } from '@/contexts/CustomersContext';
import { useState } from 'react';

export default function CustomersScreen() {
  const { customers, loading, error, refreshCustomers, deleteCustomer } = useCustomers();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCustomers();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteError(null);
      await deleteCustomer(id);
    } catch (err) {
      setDeleteError('Failed to delete customer');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Link href="/customers/add" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Plus color="#007AFF" size={24} />
          </TouchableOpacity>
        </Link>
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

        {customers.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#007AFF" />
            <Text style={styles.emptyStateText}>No customers yet</Text>
            <Text style={styles.emptyStateSubtext}>Add your first customer to get started</Text>
            <Link href="/customers/add" asChild>
              <TouchableOpacity style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Add First Customer</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <View style={styles.customerList}>
            {customers.map((customer) => (
              <View key={customer.id} style={styles.customerCard}>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>
                    {customer.first_name} {customer.last_name}
                  </Text>
                  {customer.gender && (
                    <View style={styles.genderBadge}>
                      <Text style={styles.genderText}>
                        {customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>

                {(customer.email || customer.phone) && (
                  <View style={styles.contactInfo}>
                    {customer.email && (
                      <View style={styles.contactItem}>
                        <Mail size={16} color="#666666" />
                        <Text style={styles.contactText}>{customer.email}</Text>
                      </View>
                    )}
                    {customer.phone && (
                      <View style={styles.contactItem}>
                        <Phone size={16} color="#666666" />
                        <Text style={styles.contactText}>{customer.phone}</Text>
                      </View>
                    )}
                  </View>
                )}

                {customer.address && (
                  <Text style={styles.address} numberOfLines={2}>
                    {customer.address}
                  </Text>
                )}

                <View style={styles.actions}>
                  <Link href={`/customers/${customer.id}`} asChild>
                    <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
                      <Pencil size={20} color="#007AFF" />
                    </TouchableOpacity>
                  </Link>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(customer.id)}
                  >
                    <Trash2 size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#1a1a1a',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
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
  customerList: {
    gap: 16,
  },
  customerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    flex: 1,
  },
  genderBadge: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  genderText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  contactInfo: {
    marginBottom: 12,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  address: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#f0f9ff',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
});