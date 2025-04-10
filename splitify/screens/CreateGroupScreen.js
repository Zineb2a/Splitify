import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../UserContext';
import { collection, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();

  const [groupName, setGroupName] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [members, setMembers] = useState([]);

  const handleAddContact = async () => {
    const phone = phoneInput.trim();
    if (!phone.match(/^\d{9,15}$/)) {
      Alert.alert('Invalid number', 'Please enter a valid phone number');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      let found = false;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.phone === phone) {
          setMembers((prev) => [
            ...prev,
            { phone, name: data.name },
          ]);
          found = true;
        }
      });

      if (!found) {
        Alert.alert('User not found', 'This phone number is not registered.');
      }
      setPhoneInput('');
    } catch (error) {
      console.error('Error fetching contact:', error);
      Alert.alert('Error', 'Something went wrong while validating the number.');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || members.length === 0) {
      Alert.alert('Missing Info', 'Please add a group name and at least one member.');
      return;
    }

    try {
      await addDoc(collection(db, 'groups'), {
        groupName,
        members,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
      });

      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Could not create group.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with back arrow */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backArrow}
      >
        <Ionicons name="arrow-back" size={24} color="#9EC6F3" />
      </TouchableOpacity>

      <Text style={styles.title}>Create Group</Text>

      <Text style={styles.label}>Group Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Euro Trip"
        value={groupName}
        onChangeText={setGroupName}
      />

      <Text style={styles.label}>Select Members (Your Friends)</Text>
      {members.map((member, idx) => (
        <View key={idx} style={styles.memberChip}>
          <Text style={styles.memberText}>{member.name} ({member.phone})</Text>
        </View>
      ))}

      <Text style={styles.label}>Add Other Contact</Text>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          placeholder="Enter phone number"
          value={phoneInput}
          onChangeText={setPhoneInput}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createText}>Create Group</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFDF8',
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 100,
  },
  backArrow: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9EC6F3',
    marginBottom: 20,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#9EC6F3',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FAFAFA',
    fontWeight: 'bold',
  },
  memberChip: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  memberText: {
    fontSize: 14,
    color: '#333',
  },
  createButton: {
    backgroundColor: '#9EC6F3',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  createText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});