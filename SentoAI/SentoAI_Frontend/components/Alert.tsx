import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SecurityAlertProps {
  onNavigate: (screen: string) => void;
  reason: string;
  amount: string;
}

export default function SecurityAlert({ onNavigate, reason, amount }: SecurityAlertProps) {
  
  const handleTrustVerification = () => {
    Alert.alert(
      "Cerere trimisă",
      `Am trimis un mesaj către Maria Popescu. Plata de ${amount} RON a fost pusă în așteptare până la confirmare.`,
      [{ text: "Am înțeles", onPress: () => onNavigate('transfer') }]
    );
  };

  return (
    <View style={styles.alertContainer}>
      <View style={styles.alertHeader}>
        {/* Folosim 'warning' pentru a opri eroarea de pictogramă din VS Code */}
        <Ionicons name="warning" size={80} color="#C53030" />
        <Text style={styles.alertTitle}>Plată Suspectă</Text>
      </View>
      
      <View style={styles.alertBox}>
        <Text style={styles.reasonTitle}>Sento AI a constatat:</Text>
        <Text style={styles.alertText}>"{reason}"</Text>
      </View>

      <Text style={styles.instructionText}>Cum dorești să procedezi?</Text>

      <View style={styles.actionGroup}>
        {/* BUTONUL MARE: Cere ajutor familiei */}
        <TouchableOpacity style={styles.trustBtn} onPress={handleTrustVerification}>
          <Ionicons name="people" size={26} color="#fff" style={{marginRight: 12}} />
          <View>
            <Text style={styles.trustBtnText}>Cere ajutor familiei</Text>
            <Text style={styles.trustBtnSub}>Tranzacția intră în așteptare</Text>
          </View>
        </TouchableOpacity>

        {/* BUTOANELE STÂNGA-DREAPTA */}
        <View style={styles.rowButtons}>
          <TouchableOpacity 
            style={[styles.sideBtn, styles.cancelBtn]} 
            onPress={() => onNavigate('transfer')}
          >
            <Text style={styles.cancelText}>Anulează plata</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.sideBtn, styles.continueBtn]} 
            onPress={() => {
              Alert.alert("Confirmare", "Vrei să continui fără verificare?", [
                { text: "Nu", style: "cancel" },
                { text: "Da", onPress: () => onNavigate('transfer') }
              ]);
            }}
          >
            <Text style={styles.continueText}>Continuă plata</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alertContainer: { flex: 1, padding: 25, backgroundColor: '#FFF5F5', justifyContent: 'center' },
  alertHeader: { alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontSize: 30, fontWeight: '900', color: '#C53030', marginTop: 10 },
  alertBox: { backgroundColor: '#fff', padding: 20, borderRadius: 20, borderLeftWidth: 6, borderLeftColor: '#C53030', elevation: 3, marginBottom: 10 },
  reasonTitle: { fontSize: 13, color: '#9B2C2C', fontWeight: '800', textTransform: 'uppercase', marginBottom: 5 },
  alertText: { fontSize: 17, color: '#1A1A1A', lineHeight: 24, fontWeight: '600' },
  instructionText: { fontSize: 15, color: '#742A2A', textAlign: 'center', marginVertical: 20 },
  actionGroup: { gap: 15 },
  trustBtn: { backgroundColor: '#2D7482', padding: 22, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  trustBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  trustBtnSub: { color: '#EBF5F6', fontSize: 12, opacity: 0.9 },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  sideBtn: { flex: 1, padding: 18, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  cancelBtn: { backgroundColor: '#fff', borderColor: '#C53030' },
  continueBtn: { backgroundColor: '#EDF2F7', borderColor: '#CBD5E0' },
  cancelText: { color: '#C53030', fontWeight: '800', fontSize: 14 },
  continueText: { color: '#4A5568', fontWeight: '700', fontSize: 14 }
});