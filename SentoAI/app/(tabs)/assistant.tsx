import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AssistantScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // Mesajele de dialog care se schimbă pentru a ghida utilizatorul
  const [aiMessage, setAiMessage] = useState("Te ascult, Maria");
  const [subMessage, setSubMessage] = useState("Poți întreba orice. Sunt aici să te ajut.");

  // Animație de puls pentru microfon când "ascultă"
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setAiMessage("Te ascult...");
      setSubMessage("Spune comanda: 'Transfer către Adrian' sau 'Adaugă contact'");
    } else {
      setAiMessage("Te ascult, Maria");
      setSubMessage("Comandă recepționată. Se procesează...");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header cu buton de înapoi */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asistent Sento</Text>
        <View style={{ width: 45 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.mainText}>{aiMessage}</Text>
        <Text style={styles.subText}>{subMessage}</Text>

        {/* Zona Centrală cu Microfon și Animație */}
        <View style={styles.visualizerContainer}>
          {isListening && (
            <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }], opacity: 0.3 }]} />
          )}
          <Animated.View style={[styles.micButtonContainer, { transform: [{ scale: isListening ? 1.1 : 1 }] }]}>
            <TouchableOpacity 
              style={[styles.micButton, isListening && styles.micActive]} 
              onPress={toggleListening}
              activeOpacity={0.8}
            >
              <Ionicons name="mic" size={40} color={isListening ? "#fff" : "#2D7482"} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isListening ? '#22C55E' : '#94A3B8' }]} />
          <Text style={styles.statusText}>{isListening ? 'Activ' : 'Apasă pentru a vorbi'}</Text>
        </View>
      </View>

      {/* Butoane Ajutătoare Jos */}
      <View style={styles.footer}>
        <Text style={styles.footerHint}>Apasă butonul pentru a începe conversația sau rostește "Sento"</Text>
        <View style={styles.footerActions}>
          {/* Navigare către pagina de Chat (Scrie mesaj) */}
          <TouchableOpacity 
            style={styles.secondaryBtn} 
            onPress={() => router.push('/chat')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#475569" />
            <Text style={styles.secondaryBtnText}>Scrie mesaj</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.secondaryBtn, styles.closeBtn]} onPress={() => router.back()}>
            <Ionicons name="close-outline" size={20} color="#EF4444" />
            <Text style={[styles.secondaryBtnText, { color: '#EF4444' }]}>Închide</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 60, paddingHorizontal: 20 },
  backButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  mainText: { fontSize: 28, fontWeight: '800', color: '#2D7482', textAlign: 'center', marginBottom: 10 },
  subText: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 24, marginBottom: 50 },
  
  visualizerContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
  pulseCircle: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#2D7482' },
  micButtonContainer: { elevation: 10, shadowColor: '#2D7482', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  micButton: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#EBF5F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D1E7E9' },
  micActive: { backgroundColor: '#2D7482', borderColor: '#2D7482' },
  
  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 40 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  
  footer: { padding: 30, backgroundColor: '#F8FAFC', borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  footerHint: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  footerActions: { flexDirection: 'row', justifyContent: 'center', gap: 15 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  closeBtn: { borderColor: '#FEE2E2', borderWidth: 1 },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: '#475569' }
});