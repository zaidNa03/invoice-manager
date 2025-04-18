import { Stack } from 'expo-router';

export default function CustomersLayout() {
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
          headerTitle: 'Add Customer'
        }}
      />
      <Stack.Screen 
        name="[id]"
        options={{
          presentation: 'modal',
          headerTitle: 'Edit Customer'
        }}
      />
    </Stack>
  );
}