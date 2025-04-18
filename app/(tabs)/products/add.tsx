import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { Camera, X } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProducts } from '@/contexts/ProductsContext';

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'SYP', symbol: 'S£' },
];

export default function AddProductScreen() {
  const { addProduct } = useProducts();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!name.trim()) {
        throw new Error('Product name is required');
      }

      if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        throw new Error('Please enter a valid price');
      }

      await addProduct({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        currency_code: currency,
        image_url: image,
      });

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
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

      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {image ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeImage} 
              onPress={() => setImage(null)}
            >
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Camera size={32} color="#007AFF" />
            <Text style={styles.imageText}>Add Product Image</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter product name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter product description"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 2, marginRight: 12 }]}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencyContainer}>
            {currencies.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyButton,
                  currency === curr.code && styles.currencyButtonActive,
                ]}
                onPress={() => setCurrency(curr.code)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    currency === curr.code && styles.currencyTextActive,
                  ]}
                >
                  {curr.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Product'}
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
  imageContainer: {
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 4,
  },
  imageText: {
    marginTop: 12,
    fontSize: 16,
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
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  currencyContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
  },
  currencyButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  currencyButtonActive: {
    backgroundColor: '#007AFF',
  },
  currencyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
  },
  currencyTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
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