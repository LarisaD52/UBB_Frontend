import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TransactionAlert() {
  const router = useRouter();

  const alertData = {
    merchant: "Mega Image Non-Stop",
    amount: "145,00 RON",
    time: "Astăzi, 23:15",
    aiAnalysis: "Maria a încercat să achiziționeze produse din categoria 'Alcool' la o oră târzie. Această acțiune este neobișnuită pentru ea și poate indica o stare de confuzie sau o presiune externă.",
    category: "Comportament Neobișnuit / Alcool"
  };

  const handleDecision = (type: 'aprobat' | 'blocat') => {
    Alert.alert(
      type === 'aprobat' ? "Aprobat" : "Blocat",
      `Decizia a fost trimisă. Alerta va fi eliminată din jurnal.`,
      [{ 
        text: "OK", 
        onPress: () => router.replace({ 
          pathname: '/', 
          params: { userRole: 'adrian', actionTaken: 'true', fromAlert: 'true' } 
        }) 
      }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analiză Alertă</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.alertHeader}>
          {/* Semnul exclamării principal */}
          <View style={styles.warningCircle}>
            <Ionicons name="alert-circle" size={40} color="#C53030" />
          </View>
          
          {/* ETICHETA: Semnul roșu în stânga textului, fără dreptunghi în jur */}
          <View style={styles.statusRow}>
            <Ionicons name="alert-circle" size={18} color="#C53030" style={{ marginRight: 6 }} />
            <Text style={styles.pendingTextInline}>Tranzacție în așteptare</Text>
          </View>

          <Text style={styles.amount}>{alertData.amount}</Text>
          <Text style={styles.merchant}>{alertData.merchant}</Text>
          <Text style={styles.time}>{alertData.time}</Text>
        </View>

        <View style={styles.aiBox}>
          <View style={styles.aiHeader}>
            <Ionicons name="shield-checkmark" size={18} color="#2D7482" />
            <Text style={styles.aiTitle}>Analiză Sento AI</Text>
          </View>
          <Text style={styles.aiMessage}>{alertData.aiAnalysis}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{alertData.category}</Text>
          </View>
        </View>

        <Text style={styles.question}>Ce decizie luați?</Text>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.denyButton]} onPress={() => handleDecision('blocat')}>
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>BLOCHEAZĂ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.allowButton]} onPress={() => handleDecision('aprobat')}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>APROBĂ</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.callButton} onPress={() => Alert.alert("Apel", "Se sună...")}>
          <Ionicons name="call" size={20} color="#2D7482" />
          <Text style={styles.callButtonText}>Sună Maria pentru verificare</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, alignItems: 'center', paddingBottom: 20 },
  alertHeader: { alignItems: 'center', marginVertical: 10 },
  warningCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  
  statusRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10
  },
  pendingTextInline: { 
    color: '#C53030', 
    fontSize: 14, 
    fontWeight: '700', 
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  amount: { fontSize: 32, fontWeight: '800', color: '#1A1A1A' },
  merchant: { fontSize: 16, color: '#4A5568' },
  time: { fontSize: 12, color: '#A0AEC0' },
  aiBox: { backgroundColor: '#F0F9FF', borderRadius: 20, padding: 15, width: '100%', borderWidth: 1, borderColor: '#BEE3F8' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: '#2D7482' },
  aiMessage: { fontSize: 14, color: '#2C5282', lineHeight: 20 },
  categoryBadge: { backgroundColor: 'rgba(45, 116, 130, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
  categoryText: { color: '#2D7482', fontSize: 11, fontWeight: '700' },
  question: { marginTop: 20, fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 15 },
  actionContainer: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 10 },
  actionButton: { flex: 1, height: 55, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  denyButton: { backgroundColor: '#C53030' },
  allowButton: { backgroundColor: '#2D7482' },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  callButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: 50, borderRadius: 15, backgroundColor: '#EBF5F6', borderWidth: 1, borderColor: '#D1E7E9', marginTop: 5, gap: 8 },
  callButtonText: { color: '#2D7482', fontSize: 14, fontWeight: '700' }
});