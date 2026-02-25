import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showData, setShowData] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [hasAdrianAlert, setHasAdrianAlert] = useState(true); 
  const [phishingResolved, setPhishingResolved] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(12450.75);

  const [adrianTransactions, setAdrianTransactions] = useState([
    { id: 'a1', title: 'Alertă: Plată Blocată', sub: 'Tentativă achiziție alcool', amount: '145,00 RON', type: 'alert', date: 'Acum 10 min', icon: 'warning-outline' },
    { id: 'a2', title: 'Raport Săptămânal', sub: 'Activitate Maria ok', amount: 'Analiză AI', type: 'info', date: 'Azi dimineață', icon: 'document-text-outline' },
    { id: 'a3', title: 'Logare Nouă', sub: 'Dispozitiv: iPhone 17 Pro', amount: 'Securizat', type: 'info', date: 'Ieri', icon: 'phone-portrait-outline' },
  ]);

  const [mariaTransactions] = useState([
    { id: 'm1', title: 'Pensie Decembrie', sub: 'Ministerul Muncii', amount: '+2.800,00 RON', type: 'in', date: 'Ieri', icon: 'wallet-outline' },
    { id: 'm2', title: 'Factură Enel', sub: 'Utilități', amount: '-245,30 RON', type: 'out', date: 'Acum 2 zile', icon: 'flash-outline' },
    { id: 'm3', title: 'Farmacia Tei', sub: 'Sănătate', amount: '-112,00 RON', type: 'out', date: 'Acum 3 zile', icon: 'medical-outline' },
  ]);

  const mariaData = { 
    name: "Senior", 
    role: "senior", 
    avatar: require('../assets/images/maria.png'), 
    color: "#2D7482", 
    statusTitle: "Totul este în regulă", 
    statusSub: "Contul tău este protejat și securizat." 
  };

  const adiData = {
    name: "Nepotul",
    role: "trusted_contact",
    avatar: require('../assets/images/andrei.png'),
    color: "#2D7482",
    statusTitle: "Tranzacție Riscantă Detectată",
    statusSub: "Maria a efectuat o plată pe un site clonă."
  };

  const [currentUser, setCurrentUser] = useState(mariaData);

  useEffect(() => {
    if (params.phishingAction === 'true') {
      setPhishingResolved(true);
      if (currentBalance === 12450.75) setCurrentBalance(12450.75 - 25.45);
    }
    if (params.actionTaken === 'true') {
      setHasAdrianAlert(false);
      setAdrianTransactions(prev => prev.filter(t => t.id !== 'a1'));
    }
    if (params.userRole === 'adrian') setCurrentUser(adiData);
    else setCurrentUser(mariaData);
  }, [params.userRole, params.actionTaken, params.phishingAction]);

  const isSenior = currentUser.role === 'senior';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoGroup}>
          <Image source={require('../assets/images/logo.jpg')} style={styles.logoImage} />
          <View>
            <Text style={styles.logoText}>Sento AI</Text>
            <Text style={styles.subLogo}>{isSenior ? "Împreună, în siguranță" : "Portal Nepot / Tutore"}</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
            {((isSenior && !phishingResolved) || (!isSenior && hasAdrianAlert)) && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SELECTARE CONT */}
      <View style={styles.greetingContainer}>
        <TouchableOpacity style={styles.greetingRow} onPress={() => setShowUserMenu(!showUserMenu)}>
          <Ionicons name={showUserMenu ? "chevron-up" : "chevron-down"} size={20} color="#1A1A1A" style={{ marginRight: 10 }} />
          <View style={styles.avatarCircle}><Image source={currentUser.avatar} style={styles.avatarImage} /></View>
          <Text style={styles.greetingName}>{currentUser.name} 👋</Text>
        </TouchableOpacity>

        {showUserMenu && (
          <View style={styles.userMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setCurrentUser(mariaData); setShowUserMenu(false); router.setParams({userRole: 'maria'})}}>
              <Image source={require('../assets/images/maria.png')} style={styles.menuAvatar} />
              <Text style={[styles.menuText, isSenior && styles.activeMenuText]}>Maria (Senior)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setCurrentUser(adiData); setShowUserMenu(false); router.setParams({userRole: 'adrian'})}}>
              <Image source={require('../assets/images/andrei.png')} style={styles.menuAvatar} />
              <Text style={[styles.menuText, !isSenior && styles.activeMenuText]}>Adrian (Nepot)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* STATUS BOX */}
      {!isSenior && hasAdrianAlert ? (
        <TouchableOpacity style={[styles.statusBox, styles.statusBoxWarning]} onPress={() => router.push('/transaction-alert')} activeOpacity={0.7}>
          <View style={styles.checkCircleWarning}><Ionicons name="alert-circle" size={16} color="#C53030" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitleWarning}>Tranzacție Riscantă Detectată</Text>
            <Text style={styles.statusSubWarning}>Mega Image: Tentativă achiziție alcool.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C53030" />
        </TouchableOpacity>
      ) : (
        <View style={styles.statusBox}>
          <View style={styles.checkCircle}><Ionicons name="checkmark" size={16} color="#2E7D32" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{isSenior ? mariaData.statusTitle : "Totul este sub control"}</Text>
            <Text style={styles.statusSub}>{isSenior ? mariaData.statusSub : "Nu sunt alerte noi."}</Text>
          </View>
        </View>
      )}

      {/* NOTIFICARE PHISHING */}
      {isSenior && !phishingResolved && (
        <TouchableOpacity style={styles.phishingAlert} onPress={() => router.push('/phishing-simulation')}>
          <Ionicons name="mail-unread" size={24} color="#C53030" />
          <View style={{ flex: 1 }}>
            <Text style={styles.phishingTitle}>Mesaj nou: Colet blocat 📦</Text>
            <Text style={styles.phishingSub}>Apasă pentru a rezolva livrarea.</Text>
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
        <Text style={styles.balanceLabel}>Sold disponibil</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.balanceAmount}>{showData ? currentBalance.toLocaleString('ro-RO', { minimumFractionDigits: 2 }) : "••••••"}</Text>
          <Text style={styles.currency}> RON</Text>
        </View>
      </View>

      {/* BUTOANE MARI DE ACȚIUNE */}
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.bigActionButton} onPress={() => router.push('/assistant')}>
          <View style={styles.bigIconCircle}>
            <Ionicons name="mic" size={28} color="#2D7482" />
          </View>
          <Text style={styles.bigActionTitle}>Vorbește cu Sento</Text>
          <Text style={styles.bigActionSub}>Asistent vocal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bigActionButton} onPress={() => router.push('/transfer')}>
          <View style={styles.bigIconCircle}>
            <Ionicons name="card-outline" size={28} color="#2D7482" />
          </View>
          <Text style={styles.bigActionTitle}>Plată nouă</Text>
          <Text style={styles.bigActionSub}>Trimite bani</Text>
        </TouchableOpacity>
      </View>

      {/* TRANZACȚII */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{isSenior ? "Tranzacții recente" : "Activitate Monitorizată"}</Text>
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
            <Text style={[styles.listAmount, { color: item.type === 'alert' ? '#C53030' : '#1A1A1A' }]}>{item.amount}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 },
  logoGroup: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 42, height: 42, borderRadius: 10, marginRight: 12 },
  logoText: { fontSize: 22, fontWeight: 'bold' },
  subLogo: { fontSize: 12, color: '#64748B' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#C53030', borderWidth: 1, borderColor: '#fff' },
  greetingContainer: { zIndex: 1000, marginTop: 25 },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', marginRight: 10, borderWidth: 1.5, borderColor: '#D1E5E7' },
  avatarImage: { width: '100%', height: '100%' },
  greetingName: { fontSize: 26, fontWeight: 'bold' },
  userMenu: { position: 'absolute', top: 50, width: 200, backgroundColor: '#fff', borderRadius: 15, padding: 5, elevation: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  menuAvatar: { width: 24, height: 24, borderRadius: 12 },
  menuText: { fontSize: 13, color: '#64748B' },
  activeMenuText: { color: '#2D7482', fontWeight: 'bold' },
  statusBox: { flexDirection: 'row', backgroundColor: '#F0FDF4', padding: 15, borderRadius: 20, marginTop: 20, alignItems: 'center', gap: 12 },
  statusBoxWarning: { backgroundColor: '#FFF5F5' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  checkCircleWarning: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FED7D7', justifyContent: 'center', alignItems: 'center' },
  statusTitle: { color: '#166534', fontWeight: 'bold' },
  statusTitleWarning: { color: '#C53030', fontWeight: 'bold' },
  statusSub: { color: '#166534', fontSize: 12 },
  statusSubWarning: { color: '#C53030', fontSize: 12 },
  phishingAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 15, borderRadius: 20, marginTop: 20, gap: 12, borderWidth: 1, borderColor: '#FED7D7' },
  phishingTitle: { fontWeight: 'bold', color: '#C53030' },
  phishingSub: { color: '#475569', fontSize: 12 },
  balanceCard: { borderRadius: 30, padding: 25, marginTop: 25 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  shieldBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 5 },
  shieldText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  balanceLabel: { color: '#fff', opacity: 0.8 },
  amountContainer: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 8 },
  balanceAmount: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  currency: { color: '#fff', fontSize: 20 },
  
  // Stiluri BUTOANE MARI
  actionGrid: { flexDirection: 'row', gap: 15, marginTop: 20 },
  bigActionButton: { flex: 1, backgroundColor: '#F0F9FF', borderRadius: 24, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E0F2FE' },
  bigIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  bigActionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  bigActionSub: { fontSize: 12, color: '#64748B' },

  sectionHeader: { marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  listContainer: { backgroundColor: '#fff' },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  listIcon: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  listTitle: { fontWeight: 'bold', fontSize: 14 },
  listSub: { color: '#94A3B8', fontSize: 12 },
  listAmount: { fontWeight: 'bold', fontSize: 14 }
});