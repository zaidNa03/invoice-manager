import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCustomers } from '@/contexts/CustomersContext';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customers, updateCustomer } = useCustomers();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    phone: '',
    address: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const customer = customers.find(c => c.id === id);
    if (customer) {
      setFormData({
        first_name: customer.first_name,
        last_name: customer.last_name,
        gender: customer.gender || '',
        phone: customer.phone || '',
        address: customer.address || '',
        email: customer.email || '',
      });
    }
  }, [id, customers]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.first_name.trim()) {
        throw new Error('First name is required');
      }

      if (!formData.last_name.trim()) {
        throw new Error('Last name is required');
      }

      await updateCustomer(id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        gender: formData.gender || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        email: formData.email.trim() || null,
      });

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.first_name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, first_name: text }))}
          placeholder="Enter first name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.last_name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, last_name: text }))}
          placeholder="Enter last name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderGrid}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderButton,
                formData.gender === option.value && styles.genderButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, gender: option.value }))}
            >
              <Text 
                style={[
                  styles.genderButtonText,
                  formData.gender === option.value && styles.genderButtonTextActive
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.address}
          onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          placeholder="Enter address"
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Update Customer'}
        </Text>
      </TouchableOpacity>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1a1a1a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
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