import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function ProtectionSettingsScreen() {
  const router = useRouter();
  
  // State-uri pentru opțiuni noi
  const [sumeMari, setSumeMari] = useState(true);
  const [persoaneNoi, setPersoaneNoi] = useState(true);
  const [protectieLink, setProtectieLink] = useState(true);
  const [limitNoapte, setLimitNoapte] = useState(false);
  const [confirmareFamilie, setConfirmareFamilie] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setări Protecție Sento</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>Cum vrei să te ajute Sento?</Text>
        <Text style={styles.subTitle}>Activează paza de care ai nevoie. Sento învață cum faci plăți și te apără de hoți.</Text>

        {/* 1. SUME MARI */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Oprește plățile foarte mari</Text>
              <Text style={styles.desc}>Dacă vrei să trimiți mulți bani deodată, Sento te va întreba de două ori dacă ești sigur.</Text>
            </View>
            <Switch value={sumeMari} onValueChange={setSumeMari} trackColor={{ false: "#E2E8F0", true: "#2D7482" }} />
          </View>
        </View>

        {/* 2. PERSOANE NOI (Antifraudă) */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Verifică persoanele noi</Text>
              <Text style={styles.desc}>Sento verifică dacă cel căruia îi trimiți bani este cine spune că este.</Text>
            </View>
            <Switch value={persoaneNoi} onValueChange={setPersoaneNoi} trackColor={{ false: "#E2E8F0", true: "#2D7482" }} />
          </View>
        </View>

        {/* 3. PROTECTIE LINK-URI (Mesaje suspecte) */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: '#2D7482' }]}>Blochează țepele prin mesaje</Text>
              <Text style={styles.desc}>Te anunțăm imediat dacă primești un mesaj fals care încearcă să-ți fure datele de la card.</Text>
            </View>
            <Switch value={protectieLink} onValueChange={setProtectieLink} trackColor={{ false: "#E2E8F0", true: "#2D7482" }} />
          </View>
        </View>

        {/* 4. LIMITA DE NOAPTE */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Liniște pe timpul nopții</Text>
              <Text style={styles.desc}>Oprește plățile între orele 23:00 și 06:00. Hoții profită de momentele când dormi.</Text>
            </View>
            <Switch value={limitNoapte} onValueChange={setLimitNoapte} trackColor={{ false: "#E2E8F0", true: "#2D7482" }} />
          </View>
        </View>

        {/* 5. CONFIRMARE FAMILIE */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Cere ajutor familiei</Text>
              <Text style={styles.desc}>Dacă faci o plată neobișnuită, trimitem un mesaj și Mariei Popescu să confirme că totul e bine.</Text>
            </View>
            <Switch value={confirmareFamilie} onValueChange={setConfirmareFamilie} trackColor={{ false: "#E2E8F0", true: "#2D7482" }} />
          </View>
        </View>

        <View style={styles.footerInfo}>
          <Ionicons name="shield-checkmark" size={20} color="#2D7482" />
          <Text style={styles.footerText}>Sento AI lucrează non-stop pentru liniștea ta.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 60, paddingHorizontal: 20, marginBottom: 10 },
  backButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  mainTitle: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 10 },
  subTitle: { fontSize: 15, color: '#64748B', marginBottom: 30, lineHeight: 22 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  highlightCard: { borderWidth: 1, borderColor: '#D1E7E9', backgroundColor: '#F0F9FF' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  label: { fontSize: 17, fontWeight: '700', marginBottom: 6, color: '#1A1A1A' },
  desc: { fontSize: 13, color: '#64748B', lineHeight: 19 },
  footerInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  footerText: { fontSize: 14, color: '#2D7482', fontWeight: '600' }
});