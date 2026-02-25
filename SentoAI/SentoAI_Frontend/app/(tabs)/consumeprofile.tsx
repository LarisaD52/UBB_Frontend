import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ConsumeProfileScreen() {
  const router = useRouter();
  
  const [restrictions, setRestrictions] = useState([
    { id: '1', label: 'Băuturi Alcoolice', desc: 'Sento blochează magazinele de băuturi', icon: 'wine', active: true, isCustom: false },
    { id: '2', label: 'Jocuri de Noroc', desc: 'Pariuri și cazinouri online', icon: 'dice', active: true, isCustom: false },
    { id: '3', label: 'Tutun și Țigări', desc: 'Chioșcuri de tutun și vapes', icon: 'flame', active: false, isCustom: false },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const toggleSwitch = (id: string) => {
    setRestrictions(current =>
      current.map(item => item.id === id ? { ...item, active: !item.active } : item)
    );
  };

  const deleteItem = (id: string) => {
    setRestrictions(current => current.filter(item => item.id !== id));
  };

  const addItem = () => {
    if (newItemName.trim().length > 0) {
      const newItem = {
        id: Math.random().toString(),
        label: newItemName,
        desc: 'Categorie adăugată manual',
        icon: 'basket',
        active: true,
        isCustom: true 
      };
      setRestrictions([...restrictions, newItem]);
      setNewItemName('');
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil de Consum</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Ionicons name="bulb-outline" size={24} color="#2D7482" />
          <Text style={styles.infoText}>
            Personalizează ce monitorizează Sento. Poți opri monitorizarea sau șterge definitiv categoriile noi.
          </Text>
        </View>

        <View style={styles.card}>
          {restrictions.map((item, index) => (
            <View key={item.id}>
              <View style={styles.optionRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon as any} size={20} color="#2D7482" />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{item.label}</Text>
                  <Text style={styles.optionDesc}>{item.desc}</Text>
                </View>

                {/* Zona de butoane: Switch + Coș (doar pentru cele noi) */}
                <View style={styles.actionsContainer}>
                  <Switch 
                    value={item.active} 
                    onValueChange={() => toggleSwitch(item.id)}
                    trackColor={{ false: "#E2E8F0", true: "#2D7482" }} 
                  />
                  
                  {item.isCustom && (
                    <TouchableOpacity 
                      onPress={() => deleteItem(item.id)} 
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {index < restrictions.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={24} color="#2D7482" />
          <Text style={styles.addBtnText}>Adaugă altceva (ex: Dulciuri, Cafea)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
          <Text style={styles.saveBtnText}>Salvează și Instruiește AI</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ce să mai monitorizeze Sento?</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Scrie aici (ex: Fast Food)" 
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addItem} style={styles.confirmBtn}>
                <Text style={styles.confirmBtnText}>Adaugă</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 60, paddingHorizontal: 20, marginBottom: 10 },
  backButton: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20 },
  infoBox: { backgroundColor: '#EBF5F6', padding: 20, borderRadius: 24, flexDirection: 'row', gap: 15, alignItems: 'center', marginBottom: 25 },
  infoText: { flex: 1, color: '#2D7482', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 10, elevation: 3 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  optionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  optionDesc: { fontSize: 12, color: '#94A3B8', marginTop: 3 },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 20 },
  
  // Container pentru cele două butoane din dreapta
  actionsContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    backgroundColor: '#FFF1F1', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20, padding: 15, borderWidth: 2, borderColor: '#D1E7E9', borderStyle: 'dashed', borderRadius: 20 },
  addBtnText: { color: '#2D7482', fontWeight: '700', fontSize: 15 },
  saveBtn: { backgroundColor: '#2D7482', padding: 22, borderRadius: 20, alignItems: 'center', marginTop: 30, marginBottom: 40 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 30, width: '100%', gap: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', gap: 15 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#94A3B8', fontWeight: '700' },
  confirmBtn: { flex: 1, backgroundColor: '#2D7482', padding: 15, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: '700' }
});