import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="add"
        options={{
          presentation: 'modal',
          headerTitle: 'Add Product'
        }}
      />
      <Stack.Screen 
        name="[id]"
        options={{
          headerTitle: 'Product Details'
        }}
      />
    </Stack>
  );
}