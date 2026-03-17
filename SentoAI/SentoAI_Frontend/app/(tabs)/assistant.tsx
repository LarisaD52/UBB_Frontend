import { Ionicons } from '@expo/vector-icons';

import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// !!! Asigură-te că acest IP este cel corect din terminalul Metro !!!
const SERVER_URL = 'http://192.168.1.209:8000'; 

export default function AssistantScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isListening, setIsListening] = useState(false);
  const isFocused = useIsFocused(); // Detectează când Maria revine pe ecran
  const [statusText, setStatusText] = useState(
    "Apasă 'START' și spune ce dorești",
  );

  useEffect(() => {
    if (isFocused) {
      const startFresh = async () => {
        // Oprim orice voce anterioară
        Speech.stop();
        
        // Curățăm orice înregistrare veche "agățată"
        if (recording) {
          await stopAndCleanup(recording);
        }

        // Resetăm starea vizuală
        setStatusText("Bună, Maria!");

        // Pornim dialogul de la zero
        setTimeout(() => {
          aiSpeak("Bună, Maria! Cu ce te pot ajuta acum?", true);
        }, 800);
      };

      startFresh();
    }

    return () => {
      Speech.stop();
    };
  }, [isFocused]);

  const aiSpeak = (text: string, shouldListen: boolean = false) => {
  Speech.stop(); // Oprim orice vorbire anterioară

  Speech.speak(text, { 
    language: 'ro-RO', 
    rate: 0.85, 
    onStart: () => setStatusText(text),
    onDone: () => {
      // Dacă am setat că trebuie să asculte, pornim microfonul după o mică pauză
      if (shouldListen) {
        setTimeout(() => {
          handleStart();
        }, 400); // 400ms pauză ca să nu se audă pe el însuși
      }
    }
  });
};
  async function handleStart() {
  if (isListening || recording) return;

  try {
    // 1. FORȚĂM MODUL AUDIO PENTRU IOS (Trebuie să fie primul pas)
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true, // Aceasta este linia critică
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: 1, // DoNotMix
      shouldDuckAndroid: true,
      interruptionModeAndroid: 1,
      playThroughEarpieceAndroid: false,
    });

    Vibration.vibrate(50);
    setStatusText("Te ascult, Maria...");

    // 2. Acum încercăm să creăm înregistrarea
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    
    setRecording(newRecording);
    setIsListening(true);

    setTimeout(() => {
        stopAndCleanup(newRecording);
    }, 5000);

  } catch (err) {
    console.error("Eroare la pornire:", err);
    setRecording(null);
    setIsListening(false);
    // Dacă dă eroare, îi spunem Mariei
    aiSpeak("Maria, nu pot activa microfonul. Te rog verifică setările telefonului.");
  }
}

async function stopAndCleanup(recordingToStop: Audio.Recording | null) {
  if (!recordingToStop) return;

  try {
    const status = await recordingToStop.getStatusAsync();
    
    // Verificăm dacă mai putem opera pe acest obiect
    if (status.canRecord || status.isRecording) {
      await recordingToStop.stopAndUnloadAsync();
      const uri = recordingToStop.getURI();
      
      // Curățăm starea globală
      setRecording(null);
      setIsListening(false);

      if (uri) {
        uploadAudio(uri);
      }
    }
  } catch (error) {
    console.log("Obiectul era deja descărcat.");
    setRecording(null);
    setIsListening(false);
  }
}

  async function handleStop() {
    if (!recording) return;
    setIsListening(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      Vibration.vibrate([0, 50]);

      if (uri) {
        uploadAudio(uri);
      }
    } catch (err) {
      console.error("Eroare Stop Recording:", err);
    }
  }

  const uploadAudio = async (uri: string) => {
  try {
    setStatusText("Sento procesează...");
    const formData = new FormData();
    // @ts-ignore
    formData.append('audio', { uri, type: "audio/m4a", name: "voice.m4a" });

    const response = await fetch(`${SERVER_URL}/process-audio`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.action === "NAVIGATE_WITH_DATA") {
      // 1. NAVIGĂM IMEDIAT (Ecranul se schimbă instant)
      router.push({ 
        pathname: result.target as any, 
        params: result.data || {} 
      });

      // 2. AȘTEPTĂM O SECUNDĂ (ca ecranul nou să se încarce)
      // și abia apoi pornim vocea
      setTimeout(() => {
        Speech.speak(result.speech, {
          language: 'ro-RO',
          rate: 0.85,
          onStart: () => setStatusText(result.speech),
          onDone: () => {
            // 3. După ce termină de vorbit, vibrează și o ascultă pentru DA/NU
            Vibration.vibrate(100);
            handleStart(); 
          }
        });
      }, 1000); // 1000ms = 1 secundă de liniște până se încarcă noul ecran

    } else {
      // Pentru restul comenzilor (sold, etc.) care nu schimbă ecranul
      aiSpeak(result.speech, true); 
    }
  } catch (error) {
    aiSpeak("Maria, am o problemă de conexiune.", true);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sento AI</Text>

        <View style={styles.infoBox}>
          <Ionicons
            name="chatbubble-ellipses"
            size={24}
            color="#2D7482"
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.infoText}>{statusText}</Text>
        </View>

        {/* Buton central mare optimizat pentru seniori */}
        <TouchableOpacity 
          onLongPress={handleStart} 
          onPressOut={handleStop}
          onPress={() => !isListening && handleStart()} // Permite și simplu click dacă long press e greu
          activeOpacity={0.7}
          style={[styles.micCircle, isListening && styles.micCircleActive]}
        >
          <Ionicons 
            name={isListening ? "stop" : "mic"} 
            size={70} 
            color={isListening ? "#fff" : "#2D7482"} 
          />
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          {!isListening ? (
            <TouchableOpacity style={styles.btnStart} onPress={handleStart}>
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.btnText}>START</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnStop} onPress={handleStop}>
              <Ionicons name="square" size={24} color="#fff" />
              <Text style={styles.btnText}>STOP</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.hint}>Apasă START și spune: "Vreau să fac un transfer"</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1A202C",
  },
  infoBox: {
    backgroundColor: "#F0F7F9",
    padding: 25,
    borderRadius: 20,
    width: "100%",
    marginBottom: 40,
    alignItems: "center",
    borderLeftWidth: 8,
    borderLeftColor: "#2D7482",
  },
  infoText: {
    fontSize: 19,
    textAlign: "center",
    color: "#2C5282",
    fontWeight: "700",
    lineHeight: 26,
  },
  micCircle: { 
    width: 160, height: 160, borderRadius: 80, backgroundColor: '#EBF5F6', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 40, 
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 
  },
  micCircleActive: { backgroundColor: '#C53030', transform: [{ scale: 1.1 }] },
  buttonRow: { flexDirection: 'row', gap: 20 },
  btnStart: { backgroundColor: '#2D7482', flexDirection: 'row', padding: 20, borderRadius: 15, alignItems: 'center', gap: 10, width: 145, justifyContent: 'center' },
  btnStop: { backgroundColor: '#C53030', flexDirection: 'row', padding: 20, borderRadius: 15, alignItems: 'center', gap: 10, width: 145, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  hint: { marginTop: 35, color: '#64748B', fontSize: 15, fontWeight: '500', textAlign: 'center' }
});
