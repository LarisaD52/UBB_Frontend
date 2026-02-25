import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import corect pentru a evita crash-ul

export default function TransactionsScreen() {
  const router = useRouter();
  const { userRole } = useLocalSearchParams();
  const isSenior = userRole !== 'adrian';

  // Lista extinsă pentru Maria (Senior)
  const mariaFullHistory = [
    { id: '1', title: 'Pensie Decembrie', sub: 'Ministerul Muncii', amount: '+2.800,00', type: 'in', date: 'Ieri', icon: 'wallet-outline' },
    { id: '2', title: 'Factură Enel', sub: 'Utilități', amount: '-245,30', type: 'out', date: 'Acum 2 zile', icon: 'flash-outline' },
    { id: '3', title: 'Farmacia Tei', sub: 'Sănătate', amount: '-112,00', type: 'out', date: 'Acum 3 zile', icon: 'medical-outline' },
    { id: '4', title: 'Mega Image', sub: 'Cumpărături', amount: '-85,40', type: 'out', date: '05 Feb', icon: 'cart-outline' },
    { id: '5', title: 'Transfer Adrian', sub: 'Familie', amount: '-200,00', type: 'out', date: '02 Feb', icon: 'person-outline' },
    { id: '6', title: 'Digi România', sub: 'Abonament', amount: '-45,00', type: 'out', date: '01 Feb', icon: 'tv-outline' },
    { id: '7', title: 'Piața Obor', sub: 'Cumpărături', amount: '-32,00', type: 'out', date: '28 Ian', icon: 'basket-outline' },
    { id: '8', title: 'Catena', sub: 'Sănătate', amount: '-67,00', type: 'out', date: '25 Ian', icon: 'medkit-outline' },
    { id: '9', title: 'Plată Întreținere', sub: 'Bloc A1', amount: '-350,00', type: 'out', date: '20 Ian', icon: 'home-outline' },
  ];

  // Lista extinsă pentru Adrian (Nepot - monitorizare)
  const adrianFullHistory = [
    { id: 'a1', title: 'Plată Blocată AI', sub: 'Site nesigur detectat', amount: '145,00', type: 'alert', date: 'Acum 10 min', icon: 'warning-outline' },
    { id: 'a2', title: 'Transfer către Maria', sub: 'Ajutor lunar', amount: '-500,00', type: 'out', date: 'Ieri', icon: 'heart-outline' },
    { id: 'a3', title: 'Logare Nouă Maria', sub: 'iPhone 17 Pro', amount: 'Info', type: 'info', date: 'Ieri', icon: 'phone-portrait-outline' },
    { id: 'a4', title: 'Raport Săptămânal', sub: 'Activitate stabilă', amount: 'Verificat', type: 'info', date: 'Luni', icon: 'shield-checkmark-outline' },
    { id: 'a5', title: 'Plată Utilități Maria', sub: 'Enel Muntenia', amount: 'Suma: 245,30', type: 'info', date: '05 Feb', icon: 'flash-outline' },
    { id: 'a6', title: 'Tentativă Phishing', sub: 'Mesaj SMS blocat', amount: 'Securizat', type: 'alert', date: '01 Feb', icon: 'mail-unread-outline' },
  ];

  const currentData = isSenior ? mariaFullHistory : adrianFullHistory;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isSenior ? "Istoric Maria" : "Monitorizare Adrian"}
        </Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionDate}>Luna Februarie 2026</Text>
        
        {currentData.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={[styles.iconCircle, { backgroundColor: item.type === 'alert' ? '#FFF5F5' : '#F1F5F9' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.type === 'alert' ? '#C53030' : '#2D7482'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.listSub}>{item.sub}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.listAmount, { color: item.type === 'in' ? '#2E7D32' : (item.type === 'alert' ? '#C53030' : '#1A1A1A') }]}>
                {item.type === 'in' ? '+' : ''}{item.amount} RON
              </Text>
              <Text style={styles.listDate}>{item.date}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { padding: 5, marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  list: { flex: 1, paddingHorizontal: 20 },
  sectionDate: { fontSize: 14, color: '#64748B', fontWeight: 'bold', marginVertical: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 25 },
  iconCircle: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  listTitle: { fontWeight: 'bold', fontSize: 16, color: '#1A1A1A' },
  listSub: { color: '#64748B', fontSize: 13, marginTop: 2 },
  listAmount: { fontWeight: 'bold', fontSize: 15 },
  listDate: { color: '#94A3B8', fontSize: 11, marginTop: 4 }
});