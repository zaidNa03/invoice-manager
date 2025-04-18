import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useProducts } from '@/contexts/ProductsContext';
import { useState } from 'react';

export default function ProductsScreen() {
  const { products, loading, error, refreshProducts, deleteProduct } = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteError(null);
      await deleteProduct(id);
    } catch (err) {
      setDeleteError('Failed to delete product');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <Link href="/products/add" asChild>
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
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {deleteError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{deleteError}</Text>
          </View>
        )}

        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color="#007AFF" style={styles.emptyIcon} />
            <Text style={styles.emptyStateText}>No products yet</Text>
            <Text style={styles.emptyStateSubtext}>Add products to include them in your invoices</Text>
            <Link href="/products/add" asChild>
              <TouchableOpacity style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Add First Product</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                {product.image_url ? (
                  <Image source={{ uri: product.image_url }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.productImagePlaceholder]}>
                    <Package size={24} color="#007AFF" />
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>
                    {product.currency_code} {product.price.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Pencil size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(product.id)}
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
  emptyIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
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
  productGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  productImagePlaceholder: {
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
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
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
});