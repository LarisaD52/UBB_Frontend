import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';

// !!! Asigură-te că acest IP este cel corect din terminalul Metro !!!
const SERVER_URL = 'http://192.168.1.209:8000'; 

export default function ChatAssistantScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([{ id: 1, text: "Bună, Maria! Cu ce te ajut?", sender: 'ai' }]);
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
    // 1. Adăugăm mesajul utilizatorului în listă
    setChatLog(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setMessage('');

    try {
      const response = await fetch(`${SERVER_URL}/process-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: userText }),
      });

      if (!response.ok) throw new Error("Server offline");

      const res = await response.json();
      
      setChatLog(prev => [...prev, { id: Date.now() + 1, text: res.speech, sender: 'ai' }]);

      if (res.action === "UPDATE_UI") {
        setIsTransferring(true);
        setLiveData(prev => ({ ...prev, ...res.data }));
      }

      if (res.action === "NAVIGATE_WITH_DATA") {
        setIsTransferring(false);
        router.push({ pathname: res.target as any, params: res.data });
      }
    } catch (e) {
      console.log("Eroare rețea:", e);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="#000" /></TouchableOpacity>
        <Image source={require('../../assets/images/logo.jpg')} style={{width: 80, height: 30}} />
        <View style={{width: 24}} />
      </View>

      <ScrollView 
        ref={scrollViewRef} 
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {chatLog.map(m => (
          <View key={m.id} style={[styles.bubble, m.sender === 'user' ? styles.userB : styles.aiB]}>
            <Text style={{ color: m.sender === 'user' ? '#fff' : '#000' }}>{m.text}</Text>
          </View>
        ))}

        {isTransferring && (
          <View style={styles.liveCard}>
             <Text style={styles.liveTitle}>TRANSFER ÎN CURS</Text>
             <Text style={styles.liveLabel}>NUME: <Text style={styles.liveVal}>{liveData.nume || "..."}</Text></Text>
             <Text style={styles.liveLabel}>IBAN: <Text style={styles.liveVal}>{liveData.iban || "..."}</Text></Text>
             <Text style={styles.liveLabel}>SUMĂ: <Text style={styles.liveVal}>{liveData.suma || "..."}</Text></Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder="Scrie aici..." />
        <TouchableOpacity onPress={sendMessage} style={styles.send}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 60, padding: 15, backgroundColor: '#fff' },
  bubble: { padding: 15, borderRadius: 20, margin: 10, maxWidth: '80%' },
  userB: { alignSelf: 'flex-end', backgroundColor: '#2D7482' },
  aiB: { alignSelf: 'flex-start', backgroundColor: '#fff', elevation: 1 },
  liveCard: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 20, borderLeftWidth: 5, borderLeftColor: '#2D7482', elevation: 4 },
  liveTitle: { fontWeight: 'bold', color: '#2D7482', marginBottom: 10 },
  liveLabel: { fontSize: 12, color: '#64748B', marginBottom: 5 },
  liveVal: { fontWeight: 'bold', color: '#000', fontSize: 14 },
  inputBar: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 25, padding: 12 },
  send: { backgroundColor: '#2D7482', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});
