import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { Search, X, Plus, CircleMinus as MinusCircle, CirclePlus as PlusCircle } from 'lucide-react-native';
import { useProducts } from '@/contexts/ProductsContext';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency_code: string;
  image_url: string | null;
};

type ProductSelectorProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (products: Array<{ product: Product; quantity: number }>) => void;
};

export default function ProductSelector({ visible, onClose, onSelect }: ProductSelectorProps) {
  const { products, loading, error, refreshProducts } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (visible) {
      refreshProducts();
    }
  }, [visible]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuantityChange = (productId: string, change: number) => {
    setSelectedProducts(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      if (newQuantity === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleConfirm = () => {
    const selectedItems = products
      .filter(product => selectedProducts[product.id])
      .map(product => ({
        product,
        quantity: selectedProducts[product.id]
      }));
    onSelect(selectedItems);
    onClose();
  };

  const renderItem = ({ item: product }: { item: Product }) => (
    <View style={styles.productItem}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]} />
      )}
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>
          {product.currency_code} {product.price.toFixed(2)}
        </Text>
      </View>

      <View style={styles.quantityControls}>
        {selectedProducts[product.id] ? (
          <>
            <TouchableOpacity
              onPress={() => handleQuantityChange(product.id, -1)}
              style={styles.quantityButton}
            >
              <MinusCircle size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{selectedProducts[product.id]}</Text>
            <TouchableOpacity
              onPress={() => handleQuantityChange(product.id, 1)}
              style={styles.quantityButton}
            >
              <PlusCircle size={24} color="#007AFF" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => handleQuantityChange(product.id, 1)}
            style={styles.addButton}
          >
            <Plus size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Products</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
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
            data={filteredProducts}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {loading ? 'Loading products...' : 'No products found'}
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              Object.keys(selectedProducts).length === 0 && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={Object.keys(selectedProducts).length === 0}
          >
            <Text style={styles.confirmButtonText}>
              Add {Object.keys(selectedProducts).length} Products
            </Text>
          </TouchableOpacity>
        </View>
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
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    backgroundColor: '#f0f9ff',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  quantityButton: {
    padding: 8,
  },
  quantity: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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