import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  // State pentru a controla vizibilitatea datelor sensibile (Sold + IBAN)
  const [showData, setShowData] = useState(false);

  // Date pentru tranzacții
  const transactions = [
    { id: '1', title: 'Salariu Decembrie', sub: 'SC Compania SRL', amount: '+3.500,00 RON', type: 'in', date: 'Acum 2 zile', icon: 'briefcase' },
    { id: '2', title: 'Chirie Apartament', sub: 'Ion Proprietar', amount: '-850,00 RON', type: 'out', date: 'Acum 2 zile', icon: 'home' },
    { id: '3', title: 'Mega Image', sub: 'Cumpărături', amount: '-142,50 RON', type: 'out', date: 'Ieri', icon: 'cart' },
    { id: '4', title: 'Transfer Revolut', sub: 'Cont personal', amount: '+500,00 RON', type: 'in', date: 'Azi', icon: 'swap-horizontal' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header cu Logo si Butoane Setari */}
      <View style={styles.header}>
        <View style={styles.logoGroup}>
          <Image source={require('../assets/images/logo.jpg')} style={styles.logoImage} />
          <View>
            <Text style={styles.logoText}>Sento AI</Text>
            <Text style={styles.subLogo}>Împreună, în siguranță</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.greeting}>Bună, Maria 👋</Text>
      <Text style={styles.subGreeting}>Sunt aici să te ajut să faci plăți în siguranță.</Text>

      {/* Status Box */}
      <View style={styles.statusBox}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={16} color="#2E7D32" />
        </View>
        <View>
          <Text style={styles.statusTitle}>Totul este în regulă</Text>
          <Text style={styles.statusSub}>Contul tău este protejat și securizat.</Text>
        </View>
      </View>

      {/* Card Sold (Chenar Albastru) */}
      <View style={styles.balanceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.shieldBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text style={styles.shieldText}>Protejat de Sento AI</Text>
          </View>
          <TouchableOpacity onPress={() => setShowData(!showData)}>
            <Ionicons 
              name={showData ? "eye-outline" : "eye-off-outline"} 
              size={22} 
              color="#fff" 
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.balanceLabel}>Sold disponibil</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.balanceAmount}>
            {showData ? "12.450,75" : "••••••"}
          </Text>
          <Text style={styles.currency}> RON</Text>
        </View>
        
        <View style={styles.ibanRow}>
          <Text style={styles.ibanText}>Cont Principal</Text>
          <View style={styles.ibanCopyRow}>
            <Text style={styles.ibanNumber}>
              {showData ? "RO49 1234 5678 0000" : "RO49 •••• •••• 0000"}
            </Text>
            <Ionicons name="copy-outline" size={14} color="#fff" style={{ marginLeft: 8, opacity: 0.7 }} />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/assistant')}>
          <View style={styles.actionIconCircle}><Ionicons name="mic" size={24} color="#2D7482" /></View>
          <Text style={styles.actionTitle}>Vorbește cu Sento</Text>
          <Text style={styles.actionSub}>Asistent vocal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/transfer')}>
          <View style={styles.actionIconCircle}><Ionicons name="card-outline" size={24} color="#2D7482" /></View>
          <Text style={styles.actionTitle}>Plată nouă</Text>
          <Text style={styles.actionSub}>Trimite bani</Text>
        </TouchableOpacity>
      </View>

      {/* Sectiune Tranzactii */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tranzacții recente</Text>
        <TouchableOpacity onPress={() => router.push('/transfer')}>
          <Text style={styles.viewAll}>Vezi toate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsContainer}>
        {transactions.map((item) => (
          <View key={item.id} style={styles.transactionItem}>
            <View style={[styles.transIcon, { backgroundColor: item.type === 'in' ? '#E8F5E9' : '#F1F5F9' }]}>
              <Ionicons 
                name={item.icon as any} 
                size={20} 
                color={item.type === 'in' ? "#2E7D32" : "#64748B"} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.transTitle}>{item.title}</Text>
              <Text style={styles.transSub}>{item.sub}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.transAmount, { color: item.type === 'in' ? '#2E7D32' : '#1A1A1A' }]}>
                {item.amount}
              </Text>
              <Text style={styles.transDate}>{item.date}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
  logoGroup: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 42, height: 42, borderRadius: 10, marginRight: 12 },
  logoText: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  subLogo: { fontSize: 12, color: '#64748B' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 26, fontWeight: 'bold', marginTop: 25 },
  subGreeting: { color: '#64748B', fontSize: 15, marginTop: 5 },
  statusBox: { flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 15, borderRadius: 20, marginTop: 20, alignItems: 'center', gap: 12 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  statusTitle: { color: '#166534', fontWeight: 'bold', fontSize: 14 },
  statusSub: { color: '#166534', fontSize: 12, opacity: 0.8 },
  balanceCard: { 
    backgroundColor: '#2D7482', 
    borderRadius: 30, 
    padding: 25, 
    marginTop: 25,
    shadowColor: "#2D7482",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  shieldBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 5 },
  shieldText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  balanceLabel: { color: '#fff', opacity: 0.8, fontSize: 13 },
  amountContainer: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 8 },
  balanceAmount: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  currency: { color: '#fff', fontSize: 20 },
  ibanRow: { marginTop: 10 },
  ibanText: { color: '#fff', opacity: 0.6, fontSize: 11 },
  ibanCopyRow: { flexDirection: 'row', alignItems: 'center' },
  ibanNumber: { color: '#fff', fontSize: 13, fontWeight: '500' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  actionCard: { backgroundColor: '#F0F9FF', width: '48%', padding: 20, borderRadius: 25, alignItems: 'center' },
  actionIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center' },
  actionSub: { color: '#64748B', fontSize: 12, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  viewAll: { color: '#2D7482', fontWeight: 'bold' },
  transactionsContainer: { backgroundColor: '#fff', borderRadius: 25 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  transIcon: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  transTitle: { fontWeight: 'bold', color: '#1A1A1A' },
  transSub: { color: '#94A3B8', fontSize: 12 },
  transAmount: { fontWeight: 'bold' },
  transDate: { color: '#94A3B8', fontSize: 10, marginTop: 2 }
});