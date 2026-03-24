import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Vibration, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransferConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isListening, setIsListening] = useState(false);

  // Extragem datele primite prin navigare
  const nume = typeof params.nume === 'string' ? params.nume : 'Destinatar';
  const suma = typeof params.suma === 'string' ? params.suma : '0';
  const iban = typeof params.iban === 'string' ? params.iban : '';

  // 1. Funcția care trimite vocea Mariei la server pentru confirmare
  // 1. Funcția REPARATĂ pentru confirmare vocală
  const processVoiceConfirmation = async (uri: string) => {
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('audio', {
        uri: uri,
        type: 'audio/m4a',
        name: 'confirmare.m4a',
      });

      const response = await fetch("http://192.168.1.209:8000/process-audio", {
        method: 'POST',
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.json();

      console.log("Serverul a auzit:", result.speech);

      // VERIFICARE REPARATĂ:
      // Dacă serverul a întors succes sau dacă textul conține "reușit", "trimis" sau "principal"
      if (
        result.target === "/" || 
        result.action === "NAVIGATE_WITH_DATA" ||
        result.speech.toLowerCase().includes("reușit") ||
        result.speech.toLowerCase().includes("trimis")
      ) {
        // Dacă serverul a validat confirmarea, executăm funcția de trimitere
        handleFinalConfirm(); 
      } else {
        // Dacă Maria a zis altceva sau serverul n-a înțeles
        Speech.speak("Nu am înțeles. Te rog spune DA clar sau apasă butonul.");
      }
    } catch (e) {
      console.error("Eroare comunicare server:", e);
      Speech.speak("Eroare de conexiune. Te rog apasă butonul manual.");
    }
  };

  // 2. Funcția care pornește microfonul automat după ce AI-ul tace
  const startAutomaticListening = async () => {
    try {
      // Vibrație scurtă ca Maria să știe că acum trebuie să vorbească
      Vibration.vibrate(100);
      setIsListening(true);

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      // Ascultăm timp de 3 secunde pentru un "DA" sau "NU"
      setTimeout(async () => {
        await recording.stopAndUnloadAsync();
        setIsListening(false);
        const uri = recording.getURI();
        if (uri) processVoiceConfirmation(uri);
      }, 3000);

    } catch (err) {
      console.log("Eroare microfon:", err);
    }
  };

  // 3. Efectul vocal la intrarea pe ecran
 useEffect(() => {
    // 1. Oprim orice voce care rulează în fundal din ecranul anterior
    Speech.stop();

    const announce = async () => {
        // 2. O mică pauză de 500ms ca să fim siguri că tranziția s-a terminat
        await new Promise(resolve => setTimeout(resolve, 500));

        const sumaCurata = suma.replace(' lei', '').replace(' RON', '');
        const message = `Maria, confirmăm transferul de ${sumaCurata} lei către ${nume}? Spune DA pentru a trimite.`;
        
        Speech.speak(message, { 
          language: 'ro-RO', 
          rate: 0.85, 
          onDone: () => {
            startAutomaticListening();
          }
        });
    };

    announce();

    return () => { Speech.stop(); };
}, [nume, suma]);

  // 4. Acțiunea de succes
  const handleFinalConfirm = () => {
    Speech.speak("Banii au fost trimiși. Transfer reușit!", { language: 'ro-RO' });
    Vibration.vibrate([0, 100, 50, 100]); // Vibrație de succes
    router.replace('/' as any); 
  };

  return (
    <SafeAreaView style={[styles.container, isListening && styles.containerListening]}>
      <View style={styles.content}>
        
        {/* Indicator vizual pentru ascultare */}
        {isListening && (
          <View style={styles.micStatus}>
            <Ionicons name="mic" size={40} color="#C53030" />
            <Text style={styles.micText}>TE ASCULT...</Text>
          </View>
        )}

        <Ionicons 
          name={isListening ? "mic-circle" : "checkmark-circle"} 
          size={100} 
          color={isListening ? "#C53030" : "#2D7482"} 
        />
        
        <Text style={styles.header}>Confirmă Plata</Text>

        <View style={styles.card}>
          <Text style={styles.label}>DESTINATAR</Text>
          <Text style={styles.value}>{nume}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>SUMĂ</Text>
          <Text style={styles.amount}>{suma} RON</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>IBAN</Text>
          <Text style={styles.iban}>{iban || "Nespecificat"}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.confirmBtn, isListening && { backgroundColor: '#C53030' }]} 
          onPress={handleFinalConfirm}
        >
          <Text style={styles.confirmText}>TRIMITE ACUM</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>ÎNAPOI / ANULEAZĂ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  containerListening: { backgroundColor: '#FFF5F5' }, // Fundal roșiatic când ascultă
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 },
  micStatus: { position: 'absolute', top: 60, alignItems: 'center' },
  micText: { color: '#C53030', fontWeight: 'bold', marginTop: 5 },
  header: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', marginVertical: 20 },
  card: { 
    backgroundColor: '#fff', 
    width: '100%', 
    borderRadius: 30, 
    padding: 30, 
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  label: { fontSize: 12, color: '#64748B', fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  value: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 10 },
  amount: { fontSize: 42, fontWeight: '900', color: '#2D7482', marginBottom: 10 },
  iban: { fontSize: 14, color: '#475569', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  confirmBtn: { 
    backgroundColor: '#2D7482', 
    width: '100%', 
    height: 85, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 40,
    elevation: 4
  },
  confirmText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  cancelBtn: { marginTop: 25 },
  cancelText: { color: '#C53030', fontSize: 18, fontWeight: '600' }
});