import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PhishingSimulation() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');

  const handleFakeSubmit = () => {
    // Simulăm intervenția Sento AI
    Alert.alert(
      "🛡️ Sento AI: Blocat pentru siguranță",
      "Sento a detectat că site-ul 'posta-romana-pachet.ro' este o clonă frauduloasă. Am blocat trimiterea datelor pentru a-ți proteja banii.",
      [
        { 
          text: "Mergi înapoi în siguranță", 
          onPress: () => router.back(),
          style: "cancel"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Bara de adrese "Browser" */}
      <View style={styles.browserBar}>
        <Ionicons name="warning-outline" size={16} color="#C53030" />
        <Text style={styles.urlText}>posta-romana-pachet.ro/plata</Text>
      </View>

      <View style={styles.webContent}>
        <Text style={styles.logoFake}>Poșta Română</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.alertText}>Pachetul tău este blocat!</Text>
          <Text style={styles.subText}>Pentru a primi coletul #8829, te rugăm să plătești taxa de transport de 25.45 RON.</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Număr Card</Text>
            <TextInput 
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleFakeSubmit}>
            <Text style={styles.submitBtnText}>Plătește 25.45 RON</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>© 2026 Poșta Română - Securizat prin SSL</Text>
      </View>

      {/* Sento Monitor - Indicator discret de protecție */}
      <View style={styles.sentoGuard}>
        <Ionicons name="shield-checkmark" size={18} color="#2D7482" />
        <Text style={styles.sentoGuardText}>Sento AI: Scanare pagină activă</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  browserBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0e0e0', padding: 8, gap: 5 },
  urlText: { fontSize: 12, color: '#C53030', fontWeight: 'bold' },
  webContent: { flex: 1, padding: 25, justifyContent: 'center' },
  logoFake: { fontSize: 24, fontWeight: 'bold', color: '#C53030', textAlign: 'center', marginBottom: 30 },
  cardInfo: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  alertText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 },
  subText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#CBD5E0', padding: 15, borderRadius: 10, fontSize: 16 },
  submitBtn: { backgroundColor: '#C53030', padding: 18, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerNote: { textAlign: 'center', marginTop: 30, color: '#94A3B8', fontSize: 11 },
  sentoGuard: { position: 'absolute', bottom: 40, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EBF5F6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: '#2D7482' },
  sentoGuardText: { color: '#2D7482', fontWeight: 'bold', fontSize: 13 }
});