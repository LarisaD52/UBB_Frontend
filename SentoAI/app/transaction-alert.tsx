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
    aiAnalysis: "Maria a încercat să achiziționeze produse din categoria 'Alcool' la o oră târzie. Această acțiune nu corespunde profilului ei de consum din ultimele 60 de zile și poate indica o stare de confuzie sau presiune externă.",
    category: "Risc Comportamental / Alcool"
  };

  // FUNCȚIE REPARATĂ: Trimite parametrul 'userRole' înapoi la Home
  const handleDecision = (type: 'aprobat' | 'blocat') => {
    Alert.alert(
      type === 'aprobat' ? "Tranzacție Aprobată" : "Tranzacție Blocată",
      `Decizia a fost trimisă. Te întorci la portalul de monitorizare.`,
      [
        { 
          text: "OK", 
          onPress: () => {
            // Folosim push cu parametru pentru a forța Home să știe că suntem Adrian
            router.push({
              pathname: '/',
              params: { userRole: 'adrian' }
            });
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analiză Alertă Sento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.alertHeader}>
          <View style={styles.warningCircle}>
            <Ionicons name="alert-circle" size={50} color="#C53030" />
          </View>
          <Text style={styles.amount}>{alertData.amount}</Text>
          <Text style={styles.merchant}>{alertData.merchant}</Text>
          <Text style={styles.time}>{alertData.time}</Text>
        </View>

        <View style={styles.aiBox}>
          <View style={styles.aiHeader}>
            <Ionicons name="shield-checkmark" size={22} color="#2D7482" />
            <Text style={styles.aiTitle}>Analiză Inteligență Artificială</Text>
          </View>
          <Text style={styles.aiMessage}>{alertData.aiAnalysis}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{alertData.category}</Text>
          </View>
        </View>

        <Text style={styles.question}>Ce decizie doriți să luați?</Text>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.denyButton]} 
            onPress={() => handleDecision('blocat')}
          >
            <Ionicons name="close-circle" size={24} color="#fff" />
            <Text style={styles.buttonText}>BLOCHEAZĂ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.allowButton]} 
            onPress={() => handleDecision('aprobat')}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.buttonText}>APROBĂ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { padding: 25, alignItems: 'center' },
  alertHeader: { alignItems: 'center', marginBottom: 30 },
  warningCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  amount: { fontSize: 36, fontWeight: '800', color: '#1A1A1A' },
  merchant: { fontSize: 18, color: '#4A5568', marginTop: 5 },
  time: { fontSize: 14, color: '#A0AEC0' },
  aiBox: { backgroundColor: '#F0F9FF', borderRadius: 24, padding: 20, width: '100%', borderWidth: 1, borderColor: '#BEE3F8', shadowColor: '#2D7482', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  aiTitle: { fontSize: 17, fontWeight: '700', color: '#2D7482' },
  aiMessage: { fontSize: 15, color: '#2C5282', lineHeight: 24 },
  categoryBadge: { backgroundColor: 'rgba(45, 116, 130, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 15 },
  categoryText: { color: '#2D7482', fontSize: 12, fontWeight: '700' },
  question: { marginTop: 40, fontSize: 16, fontWeight: '600', color: '#4A5568', marginBottom: 20 },
  actionContainer: { flexDirection: 'row', gap: 15, width: '100%' },
  actionButton: { flex: 1, height: 65, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 3 },
  denyButton: { backgroundColor: '#C53030' },
  allowButton: { backgroundColor: '#2D7482' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' }
});