import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';

// !!! IMPORTANT: Înlocuiește cu IP-ul tău actual afișat în terminalul Expo !!!
const SERVER_URL = 'http://172.20.10.6:8000'; 

export default function ChatAssistantScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { id: 1, text: "Bună, Maria! Cu ce te pot ajuta astăzi?", sender: 'ai' }
  ]);
  
  // State pentru vizualizarea tabelului de transfer în timp real
  const [liveTransferData, setLiveTransferData] = useState({ nume: '', iban: '', suma: '' });
  const [isTransferring, setIsTransferring] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (message.trim() === '') return;
    
    const userText = message;
    // 1. Adăugăm mesajul utilizatorului în listă
    setChatLog(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setMessage('');

    try {
      // 2. Trimitem textul către backend-ul Python
      const response = await fetch(`${SERVER_URL}/process-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: userText }),
      });
      const res = await response.json();
      
      // 3. Adăugăm răspunsul vocal/text al lui Sento
      setChatLog(prev => [...prev, { id: Date.now() + 1, text: res.speech, sender: 'ai' }]);

      // 4. LOGICĂ: Actualizare Tabel Transfer (UPDATE_UI)
      if (res.action === "UPDATE_UI") {
        setIsTransferring(true);
        setLiveTransferData(prev => ({ ...prev, ...res.data }));
      }

      // 5. LOGICĂ: Navigare Automată (Către Notificări sau Confirmare Transfer)
      if (res.action === "NAVIGATE_WITH_DATA") {
        setIsTransferring(false); // Închidem tabelul dacă era deschis
        
        // Efectuăm tranziția către ecranul trimis de backend
        router.push({ 
          pathname: res.target as any, 
          params: res.data || {} 
        });
      }

    } catch (error) {
      console.error("Eroare de conexiune:", error);
      setChatLog(prev => [...prev, { 
        id: Date.now() + 2, 
        text: "Sento are probleme de conexiune. Verifică dacă serverul este pornit.", 
        sender: 'ai' 
      }]);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container} 
      keyboardVerticalOffset={90}
    >
      {/* Header cu Logo și Status */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Image 
            source={require('../../assets/images/logo.jpg')} 
            style={styles.headerLogo} 
          />
          <View style={styles.onlineStatus}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>Sento AI Activ</Text>
          </View>
        </View>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView 
        ref={scrollViewRef} 
        style={styles.chatContainer} 
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {chatLog.map((item) => (
          <View 
            key={item.id} 
            style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}
          >
            <Text style={[styles.bubbleText, item.sender === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
        ))}

        {/* TABEL VIZUAL: Apare doar în timpul fluxului de transfer */}
        {isTransferring && (
          <View style={styles.liveFormContainer}>
            <View style={styles.liveFormHeader}>
              <Ionicons name="refresh-circle" size={18} color="#2D7482" />
              <Text style={styles.liveFormTitle}>Transfer în curs...</Text>
            </View>
            <View style={styles.liveField}>
              <Text style={styles.label}>NUME:</Text>
              <Text style={styles.value}>{liveTransferData.nume || "..."}</Text>
            </View>
            <View style={styles.liveField}>
              <Text style={styles.label}>IBAN:</Text>
              <Text style={styles.value}>{liveTransferData.iban || "..."}</Text>
            </View>
            <View style={styles.liveField}>
              <Text style={styles.label}>SUMĂ:</Text>
              <Text style={styles.value}>{liveTransferData.suma || "0"} RON</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bară de Input */}
      <View style={styles.inputBar}>
        <TextInput 
          style={styles.input} 
          value={message} 
          onChangeText={setMessage} 
          placeholder="Scrie aici..." 
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 15, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerLogo: { width: 80, height: 30, resizeMode: 'contain' },
  headerTitleContainer: { alignItems: 'center' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  onlineText: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  backButton: { width: 45, height: 45, justifyContent: 'center' },

  chatContainer: { flex: 1, padding: 20 },
  bubble: { maxWidth: '85%', padding: 15, borderRadius: 20, marginBottom: 12, elevation: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2D7482' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#1A1A1A' },

  // Stiluri Tabel Live pentru Transfer
  liveFormContainer: { 
    backgroundColor: '#fff', 
    marginVertical: 10,
    padding: 20, 
    borderRadius: 22, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  liveFormHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  liveFormTitle: { fontSize: 13, fontWeight: '700', color: '#2D7482', textTransform: 'uppercase' },
  liveField: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 11, color: '#94A3B8', fontWeight: '700', width: 60 },
  value: { fontSize: 14, color: '#1A1A1A', fontWeight: '600', flex: 1 },

  inputBar: { 
    flexDirection: 'row', 
    padding: 15, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9',
    gap: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15
  },
  input: { 
    flex: 1, 
    backgroundColor: '#F1F5F9', 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A'
  },
  sendBtn: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#2D7482', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2
  }
});