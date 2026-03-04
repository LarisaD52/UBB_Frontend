import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AssistantScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState(
    "Apasă 'START' și spune ce dorești",
  );

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
    })();
    return () => {
      Speech.stop();
    };
  }, []);

  const aiSpeak = (text: string) => {
    Speech.speak(text, {
      language: "ro-RO",
      rate: 0.85,
      onStart: () => setStatusText(text),
    });
  };

  async function handleStart() {
    try {
      Vibration.vibrate(50);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
      setIsListening(true);
      setStatusText("Te ascult, Maria...");
    } catch (err) {
      console.error("Eroare Start:", err);
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
      console.error("Eroare Stop:", err);
    }
  }

  const uploadAudio = async (uri: string) => {
    try {
      setStatusText("Sento procesează vocea...");

      const formData = new FormData();
      // @ts-ignore - necesar pentru ca react-native să accepte obiectul de tip fișier
      formData.append("audio", {
        uri: uri,
        type: "audio/m4a",
        name: "comanda_maria.m4a",
      });

      // Se trimite către ruta /process-audio configurată în main.py
      const response = await fetch("http://localhost:8000/process-audio", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();

      if (result.action === "NAVIGATE_WITH_DATA") {
        aiSpeak(result.speech);
        setTimeout(() => {
          router.push({ pathname: result.target, params: result.data || {} });
        }, 1500);
      } else {
        // Pentru acțiuni de tip SPEAK_ONLY (ex: interogare sold)
        aiSpeak(result.speech);
      }
    } catch (error) {
      console.error("Eroare Upload:", error);
      aiSpeak("Eroare de conexiune cu serverul Sento.");
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

        {/* Buton central mare pentru accesibilitate */}
        <TouchableOpacity
          onPressIn={handleStart}
          onPressOut={handleStop}
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

        <Text style={styles.hint}>
          Ține apăsat pe cerc sau folosește butoanele
        </Text>
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
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#EBF5F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  micCircleActive: { backgroundColor: "#C53030", transform: [{ scale: 1.1 }] },
  buttonRow: { flexDirection: "row", gap: 20 },
  btnStart: {
    backgroundColor: "#2D7482",
    flexDirection: "row",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    gap: 10,
    width: 145,
    justifyContent: "center",
  },
  btnStop: {
    backgroundColor: "#C53030",
    flexDirection: "row",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    gap: 10,
    width: 145,
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  hint: { marginTop: 35, color: "#64748B", fontSize: 15, fontWeight: "500" },
});
