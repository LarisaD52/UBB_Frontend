import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PhishingSimulation() {
  const router = useRouter();
  
  // Date pre-completate pentru simulare
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleProcessPayment = () => {
    // 1. Închidem modalul imediat
    setIsModalVisible(false);
    
    // 2. Navigăm la Home și trimitem semnalul specific pentru Maria
    // phishingAction: 'true' va declanșa dispariția notificării doar pe profilul ei
    router.push({
      pathname: '/',
      params: { 
        phishingAction: 'true',
        userRole: 'maria' 
      }
    }); 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Bara de adrese "Browser" cu Săgeată de BACK */}
      <View style={styles.browserBar}>
        <TouchableOpacity 
          onPress={() => router.push('/')} 
          style={styles.backArrow}
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        
        <View style={styles.urlContainer}>
          <Ionicons name="warning-outline" size={14} color="#C53030" />
          <Text style={styles.urlText}>posta-romana-pachet.ro/plata</Text>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.webContent}>
        <Text style={styles.logoFake}>Poșta Română</Text>
        
        <View style={styles.cardInfo}>
          <Text style={styles.alertText}>Pachetul tău este blocat!</Text>
          <Text style={styles.subText}>
            Pentru a primi coletul #8829, te rugăm să plătești taxa de transport de 25.45 RON.
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Număr Card</Text>
            <TextInput 
              style={styles.input} 
              value={cardNumber} 
              onChangeText={setCardNumber}
              keyboardType="numeric" 
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Dată Expirare</Text>
              <TextInput 
                style={styles.input} 
                value={expiryDate} 
                onChangeText={setExpiryDate} 
                placeholder="MM/YY"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>CVC</Text>
              <TextInput 
                style={styles.input} 
                secureTextEntry 
                value={cvc} 
                onChangeText={setCvc}
                keyboardType="numeric" 
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.submitBtnText}>Plătește 25.45 RON</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>© 2026 Poșta Română - Securizat prin SSL</Text>

        <View style={styles.sentoGuard}>
          <Ionicons name="shield-checkmark" size={18} color="#2D7482" />
          <Text style={styles.sentoGuardText}>Sento AI: Scanare pagină activă</Text>
        </View>
      </View>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="card-outline" size={40} color="#1A1A1A" style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>Confirmă Tranzacția</Text>
            <Text style={styles.modalSub}>Ești sigur că vrei să trimiți 25.45 RON către acest site?</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={handleProcessPayment}
              >
                <Text style={styles.confirmBtnText}>Confirmă Plata</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.backBtn]} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.backBtnText}>Mergi înapoi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  browserBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F1F1', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backArrow: { padding: 5, width: 40 },
  urlContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  urlText: { fontSize: 13, color: '#C53030', fontWeight: '600' },
  webContent: { flex: 1, padding: 25, alignItems: 'center', paddingTop: 40 },
  logoFake: { fontSize: 32, fontWeight: 'bold', color: '#C53030', textAlign: 'center', marginBottom: 30 },
  cardInfo: { backgroundColor: '#fff', width: '100%', padding: 20, borderRadius: 24, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  alertText: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 },
  subText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', padding: 14, borderRadius: 12, fontSize: 16, color: '#1A1A1A', backgroundColor: '#F8FAFC' },
  submitBtn: { backgroundColor: '#C53030', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerNote: { textAlign: 'center', marginTop: 30, color: '#94A3B8', fontSize: 11 },
  sentoGuard: { marginTop: 'auto', marginBottom: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBF5F6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: '#D1E7E9' },
  sentoGuardText: { color: '#2D7482', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: '85%', padding: 25, borderRadius: 28, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  modalSub: { textAlign: 'center', color: '#64748B', marginBottom: 25 },
  modalActions: { width: '100%', gap: 12 },
  modalBtn: { padding: 16, borderRadius: 16, alignItems: 'center', width: '100%' },
  confirmBtn: { backgroundColor: '#C53030' },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold' },
  backBtn: { backgroundColor: '#F1F5F9' },
  backBtnText: { color: '#64748B', fontWeight: 'bold' }
});