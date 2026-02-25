import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// IMPORTUL CORECT (verifică numărul de puncte în funcție de eroare)
import SecurityAlert from '../../components/Alert'; 

export default function TransferScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertReason, setAlertReason] = useState('');

  const handleTransferInit = () => {
    const numericAmount = parseFloat(amount);
    if (numericAmount > 1000) {
      setAlertReason("Suma este mult mai mare decât plățile tale obișnuite din ultimele 2 luni.");
      setShowAlert(true);
      return;
    }
    if (beneficiary.toLowerCase().includes('tabac') || beneficiary.toLowerCase().includes('spirit')) {
      setAlertReason("Sento a observat că nu ai cumpărat niciodată tutun sau alcool în ultimele 60 de zile.");
      setShowAlert(true);
      return;
    }
    alert("Plată procesată în siguranță!");
  };

  if (showAlert) {
    return (
      <SecurityAlert 
        reason={alertReason} 
        amount={amount} 
        onNavigate={(screen: string) => {
          // Navigăm înapoi la transfer sau la index (Acasă)
          if (screen === 'transfer') {
            setShowAlert(false);
          } else {
            router.push(screen as any);
          }
        }} 
      />
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transfer nou</Text>
          <View style={{ width: 45 }} /> 
        </View>

        <View style={styles.protectionBanner}>
          <Ionicons name="shield-checkmark" size={20} color="#2D7482" />
          <Text style={styles.protectionTitle}>Sento AI analizează riscurile...</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nume beneficiar</Text>
          <TextInput style={styles.input} placeholder="ex: Ion Popescu" value={beneficiary} onChangeText={setBeneficiary} />
          <Text style={styles.label}>IBAN</Text>
          <TextInput style={styles.input} placeholder="RO49 AAAA ..." autoCapitalize="characters" />
          <Text style={styles.label}>Sumă</Text>
          <View style={styles.amountRow}>
            <TextInput style={styles.amountInput} placeholder="0.00" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
            <Text style={styles.currency}>RON</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.btn, (!amount || !beneficiary) && { opacity: 0.5 }]}
          onPress={handleTransferInit}
          disabled={!amount || !beneficiary}
        >
          <Text style={styles.btnText}>Verifică și Continuă</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 60, paddingHorizontal: 20 },
  backButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  protectionBanner: { flexDirection: 'row', backgroundColor: '#EBF5F6', margin: 20, padding: 15, borderRadius: 20, alignItems: 'center', gap: 10 },
  protectionTitle: { color: '#2D7482', fontWeight: '600', fontSize: 13 },
  card: { backgroundColor: '#fff', marginHorizontal: 20, padding: 25, borderRadius: 30, gap: 15, elevation: 3 },
  label: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginBottom: -5 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 15, padding: 15, fontSize: 16 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', borderBottomWidth: 2, borderBottomColor: '#E2E8F0' },
  amountInput: { fontSize: 35, fontWeight: '700', color: '#2D7482', flex: 1 },
  currency: { fontSize: 20, color: '#94A3B8', fontWeight: '600' },
  btn: { backgroundColor: '#2D7482', margin: 20, padding: 20, borderRadius: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});