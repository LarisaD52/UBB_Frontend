import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#2D7482',
      tabBarStyle: { height: 85, paddingBottom: 25 }
    }}>
      {/* 1. PAGINILE VIZIBILE (DOAR ACESTEA 4) */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Acasă', 
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="transfer" 
        options={{ 
          title: 'Transfer', 
          tabBarIcon: ({ color }) => <Ionicons name="swap-horizontal" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="notifications" 
        options={{ 
          title: 'Notificări', 
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Setări', 
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} /> 
        }} 
      />
      
      {/* 2. PAGINI CARE TREBUIE ASCUNSE (href: null) */}
      {/* Verifică în folderul app/(tabs) dacă fișierul se numește exact așa */}
      <Tabs.Screen name="consumeprocessing" options={{ href: null }} />
      <Tabs.Screen name="modal" options={{ href: null }} />
      
      {/* Restul paginilor auxiliare */}
      <Tabs.Screen name="assistant" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="protectionsettings" options={{ href: null }} />
      <Tabs.Screen name="transactions" options={{ href: null }} />
      <Tabs.Screen name="transfer-confirm" options={{ href: null }} />
      <Tabs.Screen name="phishing-simulation" options={{ href: null }} />
      <Tabs.Screen name="transaction-alert" options={{ href: null }} />
    </Tabs>
  );
}