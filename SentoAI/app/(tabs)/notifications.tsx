import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();

  const notifications = [
    {
      id: '1',
      type: 'danger',
      title: 'Tranzacție suspectă blocată',
      desc: 'Am detectat o tentativă de fraudă și am protejat contul tău. Revizuiește detaliile.',
      time: 'Acum 2 ore',
      icon: 'alert-circle',
      active: true
    },
    {
      id: '2',
      type: 'success',
      title: 'Transfer confirmat',
      desc: 'Transferul de 850 RON către Ion Proprietar a fost realizat.',
      time: 'Ieri',
      icon: 'checkmark-circle'
    },
    {
      id: '3',
      type: 'info',
      title: 'Sfat de securitate',
      desc: 'Nu împărtăși niciodată codul PIN sau parola cu nimeni. Banca nu îți va cere niciodată aceste informații.',
      time: 'Acum 3 zile',
      icon: 'shield-checkmark'
    },
    {
      id: '4',
      type: 'warning',
      title: 'Sumă mare detectată',
      desc: 'Ai inițiat un transfer de 2.500 RON. Verifică dacă totul este în regulă.',
      time: 'Acum 5 zile',
      icon: 'warning'
    },
    {
      id: '5',
      type: 'info',
      title: 'Cont nou adăugat',
      desc: 'Mihai a fost adăugat ca persoană de încredere. Te poate ajuta când ai nevoie.',
      time: 'Săptămâna trecută',
      icon: 'person-add'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header fix */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificări</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {notifications.map((item) => (
          <View key={item.id} style={styles.notificationCard}>
            <View style={styles.cardTop}>
              <View style={[styles.iconContainer, 
                item.type === 'danger' ? styles.iconDanger : 
                item.type === 'success' ? styles.iconSuccess : 
                item.type === 'warning' ? styles.iconWarning : styles.iconInfo
              ]}>
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={
                    item.type === 'danger' ? '#EF4444' : 
                    item.type === 'success' ? '#22C55E' : 
                    item.type === 'warning' ? '#F59E0B' : '#2D7482'
                  } 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  {item.active && <View style={styles.activeDot} />}
                </View>
                <Text style={styles.notifDesc}>{item.desc}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.homeLink} 
          onPress={() => router.push('/')}
        >
          <Text style={styles.homeLinkText}>Înapoi la Acasă</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 60, 
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff' 
  },
  backButton: { 
    width: 45, 
    height: 45, 
    borderRadius: 15, 
    backgroundColor: '#F8FAFC', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  scrollContent: { padding: 20 },
  notificationCard: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cardTop: { flexDirection: 'row', gap: 15 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconDanger: { backgroundColor: '#FEE2E2' },
  iconSuccess: { backgroundColor: '#DCFCE7' },
  iconWarning: { backgroundColor: '#FEF3C7' },
  iconInfo: { backgroundColor: '#EBF5F6' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0EA5E9' },
  notifDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 8 },
  notifTime: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  homeLink: { marginTop: 10, marginBottom: 30, alignItems: 'center' },
  homeLinkText: { color: '#2D7482', fontWeight: '700', fontSize: 14 }
});