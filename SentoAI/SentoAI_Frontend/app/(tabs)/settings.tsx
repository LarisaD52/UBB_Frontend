import { API_BASE_URL } from '@/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  
  // State-uri pentru controlul setărilor
  const [isProtectionEnabled, setIsProtectionEnabled] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Date pentru contacte
  const [trustedContacts, setTrustedContacts] = useState([
    { id: '1', name: 'Ana Maria', initial: 'AM' },
    { id: '2', name: 'Nepotu Andrei', initial: 'NA' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);

  const getInitial = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  };

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTrustedContacts(data.map((c: any, i: number) => ({ id: String(i+1), name: c.nume || c.name || 'Contact', initial: getInitial(c.nume || c.name) })));
      }
    } catch (e) {
      console.warn('Failed to fetch contacts', e);
    } finally {
      setLoadingContacts(false);
    }
  };
  
  const handleDeleteContact = async (contactName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nume: contactName }),
      });
      if (!res.ok) throw new Error('Server error');
      fetchContacts();
    } catch (e) {
      console.warn('Failed to delete contact', e);
      Alert.alert('Eroare', 'Nu s-a putut șterge contactul.');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const addContactSubmit = async () => {
    if (!newName.trim()) {
      Alert.alert('Eroare', 'Completează numele contactului');
      return;
    }
    const payload = { nume: newName.trim(), relatie: newRelation.trim(), last_transfer: 0 };
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Server error');
      setShowAddModal(false);
      setNewName('');
      setNewRelation('');
      fetchContacts();
    } catch (e) {
      console.warn('Failed to add contact', e);
      Alert.alert('Eroare', 'Nu s-a putut salva contactul.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setări</Text>
        <View style={{ width: 45 }} />
      </View>

      <View style={styles.content}>
        {/* SECȚIUNE: SECURITATE */}
        <Text style={styles.sectionTitle}>SECURITATE ȘI ACCES</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Ionicons name="scan-outline" size={24} color="#94A3B8" style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Autentificare Biometrică</Text>
              <Text style={styles.settingSub}>FaceID pentru logare</Text>
            </View>
            <Switch 
              value={biometrics} 
              onValueChange={setBiometrics} 
              trackColor={{ false: "#E2E8F0", true: "#2D7482" }} 
            />
          </View>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color="#94A3B8" style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Alerte Tranzacții</Text>
              <Text style={styles.settingSub}>Notificări în timp real</Text>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications} 
              trackColor={{ false: "#E2E8F0", true: "#2D7482" }} 
            />
          </View>
        </View>

        {/* SECȚIUNE: SENTO AI */}
        <Text style={styles.sectionTitle}>INTELIGENȚĂ ARTIFICIALĂ</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#2D7482" style={styles.icon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Protecție Sento AI</Text>
              <Text style={styles.settingSub}>Analiză antifraudă activă</Text>
            </View>
            <Switch 
              value={isProtectionEnabled} 
              onValueChange={setIsProtectionEnabled} 
              trackColor={{ false: "#E2E8F0", true: "#2D7482" }} 
            />
          </View>
        </View>

        {/* SECȚIUNE BUTOANE SPECIALE AI */}
        {isProtectionEnabled && (
          <View style={{ gap: 12, marginTop: 10 }}>
            <TouchableOpacity 
              style={[styles.specialAiButton, { backgroundColor: '#fff', borderColor: '#E2E8F0' }]} 
              onPress={() => router.push('/protectionsettings')}
            >
              <View style={styles.specialAiIconContent}>
                 <Ionicons name="options-outline" size={22} color="#2D7482" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.specialAiTitle, { color: '#1A1A1A' }]}>Personalizează limitele AI</Text>
                <Text style={styles.specialAiSub}>Alege cum să te ajute Sento</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2D7482" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.specialAiButton, { backgroundColor: '#fff', borderColor: '#E2E8F0' }]} 
              onPress={() => router.push('/consumeprofile')}
            >
              <View style={[styles.specialAiIconContent, { backgroundColor: '#F1F5F9' }]}>
                 <Ionicons name="person-circle-outline" size={22} color="#2D7482" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.specialAiTitle, { color: '#1A1A1A' }]}>Profilul meu de consum</Text>
                <Text style={styles.specialAiSub}>Bifează ce NU cumperi niciodată</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2D7482" />
            </TouchableOpacity>
          </View>
        )}

        {/* SECȚIUNE: CONTACTE (Actualizată conform screenshot-ului) */}
        {isProtectionEnabled && (
          <>
            <Text style={styles.sectionTitle}>CONTACTE DE ÎNCREDERE</Text>
            <View style={styles.contactsCard}>
              <Text style={styles.contactsDesc}>
                Persoanele de mai jos pot confirma tranzacțiile tale.
              </Text>
              
              {trustedContacts.map((contact) => (
                <View key={contact.id} style={styles.contactRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{contact.initial}</Text>
                  </View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <TouchableOpacity activeOpacity={0.6} onPress={() => handleDeleteContact(contact.name)}>
                    <Ionicons name="close-circle-outline" size={22} color="#E2E8F0" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addContactBtn} activeOpacity={0.6} onPress={() => setShowAddModal(true)}>
                <Ionicons name="add" size={24} color="#2D7482" />
                <Text style={styles.addContactText}>Adaugă contact nou</Text>
              </TouchableOpacity>

              <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <View style={{ width: '92%', backgroundColor: '#fff', borderRadius: 16, padding: 18 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Adaugă contact</Text>
                    <TextInput placeholder="Nume complet" value={newName} onChangeText={setNewName} style={{ borderWidth: 1, borderColor: '#E2E8F0', padding: 10, borderRadius: 10, marginBottom: 8 }} />
                    <TextInput placeholder="Relație (ex: Frate)" value={newRelation} onChangeText={setNewRelation} style={{ borderWidth: 1, borderColor: '#E2E8F0', padding: 10, borderRadius: 10, marginBottom: 8 }} />
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                      <TouchableOpacity onPress={() => setShowAddModal(false)} style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
                        <Text style={{ color: '#64748B' }}>Anulează</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={addContactSubmit} style={{ backgroundColor: '#2D7482', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Salvează</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 60, 
    paddingHorizontal: 20 
  },
  backButton: { 
    width: 45, 
    height: 45, 
    borderRadius: 15, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1A1A1A' 
  },
  content: { 
    padding: 20 
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#94A3B8', 
    marginBottom: 12, 
    marginTop: 24, 
    letterSpacing: 1 
  },
  settingCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 10 
  },
  settingInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 12 
  },
  icon: { 
    marginRight: 15 
  },
  settingLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1A1A1A' 
  },
  settingSub: { 
    fontSize: 12, 
    color: '#94A3B8' 
  },
  specialAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1E7E9',
    elevation: 3,
    shadowColor: '#2D7482',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  specialAiIconContent: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  specialAiTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#2D7482' 
  },
  specialAiSub: { 
    fontSize: 13, 
    color: '#64748B', 
    marginTop: 2 
  },
  contactsCard: { 
    backgroundColor: '#fff', 
    borderRadius: 28, 
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1
  },
  contactsDesc: { 
    color: '#94A3B8', 
    fontSize: 15, 
    marginBottom: 20,
    lineHeight: 20 
  },
  contactRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#F0F9FF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  avatarText: { 
    color: '#2D7482', 
    fontWeight: '700', 
    fontSize: 16 
  },
  contactName: { 
    flex: 1, 
    fontSize: 17, 
    fontWeight: '500', 
    color: '#1A1A1A' 
  },
  addContactBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 10,
    paddingVertical: 5
  },
  addContactText: { 
    color: '#2D7482', 
    fontWeight: '800', 
    fontSize: 16, 
    marginLeft: 8 
  }
});