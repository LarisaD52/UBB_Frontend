import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';

// !!! Asigură-te că acest IP este cel corect din terminalul Metro !!!
const SERVER_URL = 'http://192.168.1.209:8000'; 

export default function ChatAssistantScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { id: 1, text: "Bună, Maria! Cu ce te pot ajuta astăzi?", sender: 'ai' }
  ]);
  
  const [liveData, setLiveData] = useState({ nume: '', iban: '', suma: '' });
  const [isTransferring, setIsTransferring] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll la ultimul mesaj
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatLog, isTransferring]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const userText = message;
    setChatLog(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setMessage('');

    try {
      // Trimitem textul către backend (main.py /process-voice)
      const response = await fetch(`${SERVER_URL}/process-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: userText }),
      });

      if (!response.ok) throw new Error("Server offline");

      const res = await response.json();
      
      // Adăugăm răspunsul vocal al lui Sento în chat
      setChatLog(prev => [...prev, { id: Date.now() + 1, text: res.speech, sender: 'ai' }]);

      // LOGICĂ: Dacă serverul spune că suntem în proces de transfer, activăm tabelul
      if (res.action === "UPDATE_UI" || res.step === "ask_details") {
        setIsTransferring(true);
        if (res.data) {
          setLiveData(prev => ({ ...prev, ...res.data }));
        }
      }

      // LOGICĂ: Navigare la confirmare dacă toate datele sunt gata
      if (res.action === "NAVIGATE_WITH_DATA") {
        setTimeout(() => {
          setIsTransferring(false);
          router.push({ 
            pathname: res.target as any, 
            params: res.data || {} 
          });
        }, 1500);
      }

    } catch (error) {
      console.error("Eroare rețea:", error);
      setChatLog(prev => [...prev, { 
        id: Date.now() + 2, 
        text: "Sento are o mică problemă de conexiune. Te rog verifică dacă serverul este pornit.", 
        sender: 'ai' 
      }]);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header Personalizat Sento */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sento Chat</Text>
        <View style={styles.statusIndicator}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Activ</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef} 
        style={styles.chatContainer} 
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {chatLog.map((item) => (
          <View 
            key={item.id} 
            style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}
          >
            {item.sender === 'ai' && (
              <View style={styles.aiIconSmall}>
                <Ionicons name="shield-checkmark" size={10} color="#fff" />
              </View>
            )}
            <Text style={[styles.bubbleText, item.sender === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
        ))}

        {/* Tabelul de date care se completează pe măsură ce Maria vorbește */}
        {isTransferring && (
          <View style={styles.liveCard}>
             <View style={styles.liveHeader}>
               <Ionicons name="card-outline" size={18} color="#2D7482" />
               <Text style={styles.liveTitle}>DATE TRANSFER</Text>
             </View>
             <View style={styles.liveRow}>
               <Text style={styles.liveLabel}>BENEFICIAR:</Text>
               <Text style={styles.liveVal}>{liveData.nume || "Se așteaptă..."}</Text>
             </View>
             <View style={styles.liveRow}>
               <Text style={styles.liveLabel}>SUMĂ:</Text>
               <Text style={styles.liveVal}>{liveData.suma ? `${liveData.suma} RON` : "---"}</Text>
             </View>
          </View>
        )}
      </ScrollView>

      {/* Bară de Input Modernă */}
      <View style={styles.inputBar}>
        <TextInput 
          style={styles.input} 
          value={message} 
          onChangeText={setMessage} 
          placeholder="Ex: Vreau să-i trimit 100 lei lui Adrian" 
          placeholderTextColor="#94A3B8"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !message.trim() && { opacity: 0.5 }]} 
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Ionicons name="arrow-up" size={24} color="#fff" />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingHorizontal: 20, 
    paddingBottom: 15, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    justifyContent: 'space-between'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  onlineText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },

  chatContainer: { flex: 1, paddingHorizontal: 15 },
  bubble: { maxWidth: '85%', padding: 15, borderRadius: 20, marginVertical: 5, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2D7482', borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2, flexDirection: 'row', gap: 8 },
  aiIconSmall: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#2D7482', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#1A1A1A' },

  liveCard: { 
    backgroundColor: '#EBF5F6', 
    marginVertical: 15, 
    padding: 18, 
    borderRadius: 22, 
    borderWidth: 1, 
    borderColor: '#D1E7E9',
    shadowColor: '#2D7482',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2
  },
  liveHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  liveTitle: { fontWeight: '800', color: '#2D7482', fontSize: 11, letterSpacing: 1.2 },
  liveRow: { marginBottom: 8 },
  liveLabel: { fontSize: 10, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  liveVal: { color: '#1A1A1A', fontSize: 16, fontWeight: '700', marginTop: 2 },

  inputBar: { 
    flexDirection: 'row', 
    padding: 15, 
    backgroundColor: '#fff', 
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 35 : 15,
    alignItems: 'center'
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
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#2D7482', 
    justifyContent: 'center', 
    alignItems: 'center'
  }
});
