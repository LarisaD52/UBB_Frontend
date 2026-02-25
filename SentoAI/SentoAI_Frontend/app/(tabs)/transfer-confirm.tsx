import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransferConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extragem datele și ne asigurăm că sunt șiruri de caractere pentru a evita erorile de tip
  const nume = typeof params.nume === 'string' ? params.nume : 'Andrei';
  const suma = typeof params.suma === 'string' ? params.suma : '0 lei';
  const iban = typeof params.iban === 'string' ? params.iban : '';
  const relatie = typeof params.relatie === 'string' ? params.relatie : 'Nepot';

  // REPARAT: useEffect nu mai dă eroare. Am scos 'async' din funcția principală.
  useEffect(() => {
    const message = `Maria, am pregătit transferul de ${suma} către ${nume}. Dacă totul este corect, apasă butonul mare de jos.`;
    
    // Lansăm vorbirea direct
    Speech.speak(message, { 
      language: 'ro-RO', 
      rate: 0.9 
    });

    // Funcția de curățare obligatorie
    return () => {
      Speech.stop();
    };
  }, [nume, suma]);

  const handleConfirm = () => {
    Speech.speak("Banii au fost trimiși. Transfer reușit!", { language: 'ro-RO' });
    Alert.alert("Succes", "Transferul a fost finalizat!");
    
    // REPARAT: Folosim o cale validă (index sau home) pentru a evita eroarea de rută
    router.replace('/' as any); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={80} color="#2D7482" />
        <Text style={styles.header}>Confirmă Plata</Text>

        <View style={styles.card}>
          <Text style={styles.label}>DESTINATAR:</Text>
          <Text style={styles.value}>{nume} ({relatie})</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>SUMĂ DE PLATĂ:</Text>
          <Text style={styles.amount}>{suma}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>CONT IBAN:</Text>
          <Text style={styles.iban}>{iban}</Text>
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
          <Text style={styles.confirmText}>DA, TRIMITE BANII</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>ANULEAZĂ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 },
  header: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', marginVertical: 20 },
  card: { 
    backgroundColor: '#fff', 
    width: '100%', 
    borderRadius: 30, 
    padding: 25, 
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  label: { fontSize: 12, color: '#64748B', fontWeight: 'bold', marginBottom: 5 },
  value: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 15 },
  amount: { fontSize: 38, fontWeight: '900', color: '#2D7482', marginBottom: 15 },
  iban: { fontSize: 15, color: '#475569', fontFamily: 'monospace' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  confirmBtn: { 
    backgroundColor: '#2D7482', 
    width: '100%', 
    height: 80, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 40 
  },
  confirmText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  cancelBtn: { marginTop: 20, padding: 10 },
  cancelText: { color: '#C53030', fontSize: 18, fontWeight: 'bold' }
});