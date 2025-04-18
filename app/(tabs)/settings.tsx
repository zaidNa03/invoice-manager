import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ChevronRight, Globe, DollarSign, Building2, Palette, Camera } from 'lucide-react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessContext } from '@/contexts/BusinessContext';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SYP', symbol: 'S£', name: 'Syrian Pound' },
];

const taxRates = [
  { value: 0, label: 'No Tax' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
];

export default function SettingsScreen() {
  const { businessInfo, loading, error, updateBusinessInfo } = useBusinessContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    business_name: businessInfo?.business_name || '',
    address: businessInfo?.address || '',
    tax_number: businessInfo?.tax_number || '',
    phone: businessInfo?.phone || '',
    email: businessInfo?.email || '',
    logo_url: businessInfo?.logo_url || '',
    default_currency: businessInfo?.default_currency || 'USD',
    tax_rate: businessInfo?.tax_rate || 10,
  });
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        logo_url: result.assets[0].uri
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setUpdateError(null);
      await updateBusinessInfo(formData);
      setIsEditing(false);
    } catch (err) {
      setUpdateError('Failed to update business information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Business Information</Text>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {(error || updateError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error || updateError}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.logoContainer} onPress={pickImage}>
            {formData.logo_url ? (
              <View style={styles.logoWrapper}>
                <View style={styles.logoOverlay}>
                  <Camera size={24} color="#ffffff" />
                </View>
              </View>
            ) : (
              <View style={styles.logoPlaceholder}>
                <Camera size={32} color="#007AFF" />
                <Text style={styles.logoText}>Add Logo</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={formData.business_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, business_name: text }))}
              placeholder="Enter business name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder="Enter business address"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tax Number</Text>
            <TextInput
              style={styles.input}
              value={formData.tax_number}
              onChangeText={(text) => setFormData(prev => ({ ...prev, tax_number: text }))}
              placeholder="Enter tax number"
            />
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
            <Text style={styles.label}>Default Currency</Text>
            <View style={styles.currencyGrid}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyButton,
                    formData.default_currency === currency.code && styles.currencyButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, default_currency: currency.code }))}
                >
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Default Tax Rate</Text>
            <View style={styles.taxRateGrid}>
              {taxRates.map((rate) => (
                <TouchableOpacity
                  key={rate.value}
                  style={[
                    styles.taxRateButton,
                    formData.tax_rate === rate.value && styles.taxRateButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, tax_rate: rate.value }))}
                >
                  <Text 
                    style={[
                      styles.taxRateText,
                      formData.tax_rate === rate.value && styles.taxRateTextActive
                    ]}
                  >
                    {rate.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {(error || updateError) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || updateError}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => setIsEditing(true)}>
            <View style={styles.settingIcon}>
              <Building2 size={20} color="#007AFF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Business Information</Text>
              <Text style={styles.settingDescription}>Update your business details</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Globe size={20} color="#007AFF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingDescription}>English</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <DollarSign size={20} color="#007AFF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Default Currency</Text>
              <Text style={styles.settingDescription}>{businessInfo?.default_currency || 'USD'}</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Palette size={20} color="#007AFF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Invoice Template</Text>
              <Text style={styles.settingDescription}>Customize your invoice design</Text>
            </View>
            <ChevronRight size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
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
  currencyGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: '#007AFF',
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  taxRateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taxRateButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: '30%',
  },
  taxRateButtonActive: {
    backgroundColor: '#007AFF',
  },
  taxRateText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  taxRateTextActive: {
    color: '#ffffff',
  },
});