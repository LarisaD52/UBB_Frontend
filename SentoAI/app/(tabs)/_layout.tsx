import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#2D7482',
      tabBarStyle: { height: 85, paddingBottom: 25 }
    }}>
      <Tabs.Screen name="index" options={{ title: 'Acasă', tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="transfer" options={{ title: 'Transfer', tabBarIcon: ({ color }) => <Ionicons name="swap-horizontal" size={24} color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notificări', tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Setări', tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} /> }} />
      
      {/* ACEASTA ESTE LINIA CRITICĂ: Spunem că pagina există, dar nu punem buton jos */}
      <Tabs.Screen name="protectionsettings" options={{ href: null }} />
      
      {/* Alte pagini ascunse */}
      <Tabs.Screen name="assistant" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
    </Tabs>
  );
}