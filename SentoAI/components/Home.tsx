import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showData, setShowData] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // 1. STĂRI PENTRU LISTE (Permit modificarea dinamică)
  const [hasAlert, setHasAlert] = useState(true); 
  const [adrianTransactions, setAdrianTransactions] = useState([
    { id: 'a1', title: 'Alertă: Plată Blocată', sub: 'Tentativă achiziție alcool', amount: '145,00 RON', type: 'alert', date: 'Acum 10 min', icon: 'warning-outline' },
    { id: 'a2', title: 'Raport Săptămânal', sub: 'Activitate Maria ok', amount: 'Analiză AI', type: 'info', date: 'Azi dimineață', icon: 'document-text-outline' },
    { id: 'a3', title: 'Logare Nouă', sub: 'Dispozitiv: iPhone 17 Pro', amount: 'Securizat', type: 'info', date: 'Ieri', icon: 'phone-portrait-outline' },
  ]);

  const [mariaTransactions, setMariaTransactions] = useState([
    { id: 'm1', title: 'Pensie Decembrie', sub: 'Ministerul Muncii', amount: '+2.800,00 RON', type: 'in', date: 'Ieri', icon: 'wallet-outline' },
    { id: 'm2', title: 'Factură Enel', sub: 'Utilități', amount: '-245,30 RON', type: 'out', date: 'Acum 2 zile', icon: 'flash-outline' },
    { id: 'm3', title: 'Farmacia Tei', sub: 'Sănătate', amount: '-112,00 RON', type: 'out', date: 'Acum 3 zile', icon: 'medical-outline' },
  ]);

  // DATE PROFILE
  const mariaData = {
    name: "Maria",
    role: "senior",
    balance: "12.450,75",
    iban: "RO49 SENT 1234 5678 0000",
    statusTitle: "Totul este în regulă",
    statusSub: "Contul tău este protejat și securizat.",
    avatar: require('../assets/images/maria.png'),
    color: "#2D7482"
  };

  const adiData = {
    name: "Adrian",
    role: "trusted_contact",
    balance: "12.450,75", 
    iban: "RO49 SENT 1234 5678 0000",
    statusTitle: "1 Tranzacție Suspectă",
    statusSub: "Maria a încercat o plată neobișnuită.",
    avatar: require('../assets/images/andrei.png'),
    color: "#2D7482"
  };

  const [currentUser, setCurrentUser] = useState(mariaData);

  // 2. LOGICA DE SINCRONIZARE: Verifică dacă venim de la o acțiune de blocare/acceptare
  useEffect(() => {
    if (params.userRole === 'adrian') {
      setCurrentUser(adiData);
      
      // Dacă am confirmat acțiunea în TransactionAlert, curățăm interfața
      if (params.actionTaken === 'true') {
        setHasAlert(false); // Ascunde bannerul roșu
        setAdrianTransactions(prev => prev.filter(t => t.id !== 'a1')); // Șterge alerta din listă
      }
    }
  }, [params.userRole, params.actionTaken]);

  const isSenior = currentUser.role === 'senior';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER LOGO */}
      <View style={styles.header}>
        <View style={styles.logoGroup}>
          <Image source={require('../assets/images/logo.jpg')} style={styles.logoImage} />
          <View>
            <Text style={styles.logoText}>Sento AI</Text>
            <Text style={styles.subLogo}>{isSenior ? "Împreună, în siguranță" : "Portal Nepot / Tutore"}</Text>
          </View>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="settings-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SELECTARE CONT */}
      <View style={styles.greetingContainer}>
        <TouchableOpacity 
          style={styles.greetingRow} 
          onPress={() => setShowUserMenu(!showUserMenu)}
          activeOpacity={0.7}
        >
          <Ionicons name={showUserMenu ? "chevron-up" : "chevron-down"} size={20} color="#1A1A1A" style={{ marginRight: 10 }} />
          <View style={styles.avatarCircle}>
            <Image source={currentUser.avatar} style={styles.avatarImage} />
          </View>
          <Text style={styles.greetingName}>{currentUser.name} 👋</Text>
        </TouchableOpacity>

        {showUserMenu && (
          <View style={styles.userMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setCurrentUser(mariaData); setShowUserMenu(false); }}>
              <Image source={require('../assets/images/maria.png')} style={styles.menuAvatar} />
              <Text style={[styles.menuText, isSenior && styles.activeMenuText]}>Maria (Senior)</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setCurrentUser(adiData); setShowUserMenu(false); }}>
              <Image source={require('../assets/images/andrei.png')} style={styles.menuAvatar} />
              <Text style={[styles.menuText, !isSenior && styles.activeMenuText]}>Adrian (Nepot)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.subGreeting}>
        {isSenior ? "Sunt aici să te ajut să faci plăți în siguranță." : "Monitorizezi activitatea și alertele pentru Maria."}
      </Text>

      {/* STATUS BOX (Dinamic: se ascunde dacă alerta a fost procesată) */}
      {(isSenior || hasAlert) && (
        <View style={[styles.statusBox, !isSenior && styles.statusBoxWarning]}>
          <View style={[styles.checkCircle, !isSenior && styles.checkCircleWarning]}>
            <Ionicons name={isSenior ? "checkmark" : "alert-circle"} size={16} color={isSenior ? "#2E7D32" : "#C53030"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, !isSenior && styles.statusTitleWarning]}>
                {isSenior ? mariaData.statusTitle : adiData.statusTitle}
            </Text>
            <Text style={[styles.statusSub, !isSenior && styles.statusSubWarning]}>
                {isSenior ? mariaData.statusSub : adiData.statusSub}
            </Text>
          </View>
          {!isSenior && (
            <TouchableOpacity style={styles.alertButtonSmall} onPress={() => router.push('/transaction-alert')}>
              <Text style={styles.alertButtonText}>Vezi Alerta</Text>
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* SIMULARE SMS FRAUDĂ - DOAR PENTRU MARIA */}
      {isSenior && (
        <TouchableOpacity 
          style={styles.phishingAlert} 
          onPress={() => router.push('/phishing-simulation')}
        >
          <Ionicons name="mail-unread" size={24} color="#C53030" />
          <View style={{ flex: 1 }}>
            <Text style={styles.phishingTitle}>Mesaj nou: Colet blocat 📦</Text>
            <Text style={styles.phishingSub}>Apasă pentru a rezolva livrarea pachetului tău.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C53030" />
        </TouchableOpacity>
      )}

      {/* CARD SOLD */}
      <View style={[styles.balanceCard, { backgroundColor: currentUser.color }]}>
        <View style={styles.cardHeader}>
          <View style={styles.shieldBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#fff" />
            <Text style={styles.shieldText}>{isSenior ? "Protejat de Sento AI" : "Mod Monitorizare"}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowData(!showData)}>
            <Ionicons name={showData ? "eye-outline" : "eye-off-outline"} size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceLabel}>Sold disponibil {!isSenior && "(Maria)"}</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.balanceAmount}>{showData ? currentUser.balance : "••••••"}</Text>
          <Text style={styles.currency}> RON</Text>
        </View>
        <Text style={styles.ibanText}>{currentUser.iban}</Text>
      </View>

      {/* BUTOANE ACȚIUNI */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/assistant')}>
          <View style={styles.actionIconCircle}><Ionicons name="mic" size={24} color="#2D7482" /></View>
          <Text style={styles.actionTitle}>Vorbește cu Sento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/transfer')}>
          <View style={styles.actionIconCircle}><Ionicons name="card-outline" size={24} color="#2D7482" /></View>
          <Text style={styles.actionTitle}>Plată nouă</Text>
        </TouchableOpacity>
      </View>

      {/* LISTĂ TRANZACȚII DIN STATE (Dinamice) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{isSenior ? "Tranzacții recente" : "Activitate Monitorizată"}</Text>
        <TouchableOpacity><Text style={styles.viewAll}>Vezi tot</Text></TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {(isSenior ? mariaTransactions : adrianTransactions).map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={[styles.listIcon, { backgroundColor: item.type === 'alert' ? '#FFF5F5' : '#F1F5F9' }]}>
              <Ionicons name={item.icon as any} size={20} color={item.type === 'alert' ? '#C53030' : '#64748B'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.listSub}>{item.sub}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.listAmount, { color: item.type === 'in' ? '#2E7D32' : (item.type === 'alert' ? '#C53030' : '#1A1A1A') }]}>
                {item.amount}
              </Text>
              <Text style={styles.listDate}>{item.date}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 },
  logoGroup: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 42, height: 42, borderRadius: 10, marginRight: 12 },
  logoText: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  subLogo: { fontSize: 12, color: '#64748B' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  greetingContainer: { zIndex: 1000, marginTop: 25 },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBF5F6', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1.5, borderColor: '#D1E5E7' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  greetingName: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  subGreeting: { color: '#64748B', fontSize: 15, marginTop: 5, marginBottom: 5 },
  userMenu: { position: 'absolute', top: 50, left: 0, width: 220, backgroundColor: '#fff', borderRadius: 15, padding: 5, elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  menuAvatar: { width: 30, height: 30, borderRadius: 15 },
  menuText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  activeMenuText: { color: '#2D7482', fontWeight: '800' },
  menuDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 10 },
  statusBox: { flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 15, borderRadius: 20, marginTop: 20, alignItems: 'center', gap: 12 },
  statusBoxWarning: { backgroundColor: '#FFF5F5' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  checkCircleWarning: { backgroundColor: '#FED7D7' },
  statusTitle: { color: '#166534', fontWeight: 'bold', fontSize: 14 },
  statusTitleWarning: { color: '#C53030' },
  statusSub: { color: '#166534', fontSize: 12, opacity: 0.8 },
  statusSubWarning: { color: '#C53030' },
  alertButtonSmall: { backgroundColor: '#C53030', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  phishingAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 15, borderRadius: 20, marginTop: 20, gap: 12, borderWidth: 1, borderColor: '#FED7D7' },
  phishingTitle: { fontWeight: 'bold', color: '#C53030', fontSize: 14 },
  phishingSub: { color: '#C53030', fontSize: 12, opacity: 0.8 },
  balanceCard: { borderRadius: 30, padding: 25, marginTop: 25, elevation: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  shieldBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 5 },
  shieldText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  balanceLabel: { color: '#fff', opacity: 0.8, fontSize: 13 },
  amountContainer: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 8 },
  balanceAmount: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  currency: { color: '#fff', fontSize: 20 },
  ibanText: { color: '#fff', opacity: 0.7, fontSize: 12, marginTop: 10 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  actionCard: { backgroundColor: '#F8FAFC', width: '48%', padding: 20, borderRadius: 25, alignItems: 'center', elevation: 2 },
  actionIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAll: { color: '#2D7482', fontWeight: 'bold' },
  listContainer: { backgroundColor: '#fff' },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  listIcon: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  listTitle: { fontWeight: 'bold', fontSize: 14 },
  listSub: { color: '#94A3B8', fontSize: 12 },
  listAmount: { fontWeight: 'bold' },
  listDate: { color: '#94A3B8', fontSize: 10 }
});