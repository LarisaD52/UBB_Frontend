import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AssistantScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header cu buton de închidere discret */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeCircle}>
          <Ionicons name="close" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.title}>Asistent Sento</Text>
        
        {/* Indicația solicitată */}
        <View style={styles.instructionBox}>
           <Text style={styles.instructionText}>
             Apăsați butonul verde pentru a începe conversația sau butonul roșu pentru a opri asistentul.
           </Text>
        </View>

        <View style={styles.visualizerContainer}>
          {/* Cercul de animație/pulsare care reacționează la starea isListening */}
          <View style={[styles.pulseRing, isListening && styles.pulseRingActive]}>
            <View style={styles.micButtonMain}>
              <Ionicons 
                name={isListening ? "mic" : "mic-off"} 
                size={42} 
                color={isListening ? "#2D7482" : "#94A3B8"} 
              />
            </View>
          </View>
          <Text style={[styles.statusText, isListening && styles.statusTextActive]}>
            {isListening ? "Vă ascult, Maria..." : "Asistent în așteptare"}
          </Text>
        </View>
      </View>

      {/* Controlerele de jos: START și ÎNCHIDE */}
      <View style={styles.footer}>
        <View style={styles.controlRow}>
          <TouchableOpacity 
            style={[styles.controlBtn, styles.startBtn]} 
            onPress={() => setIsListening(true)}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.controlBtnText}>START</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlBtn, styles.stopBtn]} 
            onPress={() => {
              setIsListening(false);
              // Opțional: router.back(); dacă vrei să iasă de tot la apăsarea stop
            }}
          >
            <Ionicons name="stop" size={20} color="#fff" />
            <Text style={styles.controlBtnText}>ÎNCHIDE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 10, alignItems: 'flex-end' },
  closeCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 20 },
  
  instructionBox: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, marginBottom: 40, borderLeftWidth: 4, borderLeftColor: '#2D7482' },
  instructionText: { fontSize: 16, color: '#475569', textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  
  visualizerContainer: { alignItems: 'center' },
  pulseRing: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  pulseRingActive: { backgroundColor: 'rgba(45, 116, 130, 0.1)', borderColor: '#2D7482', borderWidth: 2 },
  micButtonMain: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  
  statusText: { marginTop: 25, fontSize: 16, fontWeight: '700', color: '#94A3B8' },
  statusTextActive: { color: '#2D7482' },
  
  footer: { padding: 30, paddingBottom: 50 },
  controlRow: { flexDirection: 'row', gap: 15 },
  controlBtn: { flex: 1, height: 65, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 3 },
  startBtn: { backgroundColor: '#2D7482' },
  stopBtn: { backgroundColor: '#C53030' },
  controlBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 }
});