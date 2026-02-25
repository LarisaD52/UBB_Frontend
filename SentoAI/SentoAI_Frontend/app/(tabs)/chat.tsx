import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatAssistantScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    { id: 1, text: "Bună, Maria! Cu ce te pot ajuta astăzi?", sender: 'ai' }
  ]);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    if (message.trim() === '') return;

    // Adaugăm mesajul utilizatorului
    const newUserMsg = { id: Date.now(), text: message, sender: 'user' };
    setChatLog(prev => [...prev, newUserMsg]);
    
    const currentInput = message.toLowerCase();
    setMessage('');

    // Simulare logică AI (Flow-ul tău pentru Transfer/Contacte)
    setTimeout(() => {
      let aiResponse = "";
      if (currentInput.includes('transfer')) {
        aiResponse = "Sigur! Spune-mi numele persoanei căreia vrei să îi trimiți bani.";
      } else if (currentInput.includes('contact')) {
        aiResponse = "Te ajut să adaugi un contact. Spune-mi numele, prenumele și numărul de telefon.";
      } else if (currentInput.includes('adrian')) {
        aiResponse = "L-am găsit pe Adrian în contactele tale de încredere. Ce sumă dorești să îi trimiți?";
      } else {
        aiResponse = "Am înțeles. Vrei să facem un transfer sau să adăugăm un contact nou?";
      }

      setChatLog(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Sento Chat</Text>
          <View style={styles.onlineStatus}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>AI Activ</Text>
          </View>
        </View>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {chatLog.map((item) => (
          <View key={item.id} style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            {item.sender === 'ai' && (
              <View style={styles.aiIcon}>
                <Ionicons name="shield-checkmark" size={12} color="#fff" />
              </View>
            )}
            <Text style={[styles.bubbleText, item.sender === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput 
          style={styles.input}
          placeholder="Scrie un mesaj..."
          value={message}
          onChangeText={setMessage}
          multiline
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 60, paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#fff' },
  backButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  onlineText: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },

  chatContainer: { flex: 1, padding: 20 },
  bubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 12, elevation: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2D7482', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  aiIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#2D7482', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#1A1A1A' },

  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10 },
  input: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, maxHeight: 100, fontSize: 15 },
  sendBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#2D7482', justifyContent: 'center', alignItems: 'center' }
});