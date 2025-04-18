import { Stack } from 'expo-router';

export default function InvoicesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="create"
        options={{
          presentation: 'modal',
          headerTitle: 'Create Invoice'
        }}
      />
      <Stack.Screen 
        name="[id]"
        options={{
          headerTitle: 'Invoice Details'
        }}
      />
    </Stack>
  );
}