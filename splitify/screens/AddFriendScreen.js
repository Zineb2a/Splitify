import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useUser } from '../UserContext';

const AddFriendScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();
  const { user } = useUser();

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        const cleaned = data
          .filter((c) => c.phoneNumbers?.length > 0)
          .map((c) => ({
            id: c.id,
            name: c.name,
            number: c.phoneNumbers[0].number,
          }));

        setContacts(cleaned);
        setFiltered(cleaned);
      }
    })();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    const filteredList = contacts.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredList);
  };

  const handleAddFriend = async (contact) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        friends: arrayUnion({
          name: contact.name,
          phone: contact.number,
        }),
      });

      Alert.alert('Success', `${contact.name} added as a friend`);
      navigation.goBack();
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to add friend');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#9EC6F3"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Add a Friend</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Search contacts..."
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleAddFriend(item)}
          >
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.number}>{item.number}</Text>
            </View>
            <Ionicons name="person-add" size={20} color="#9EC6F3" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default AddFriendScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9EC6F3',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  name: {
    fontWeight: '500',
    fontSize: 15,
    color: '#333',
  },
  number: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});