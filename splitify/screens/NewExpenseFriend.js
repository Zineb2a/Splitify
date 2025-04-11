import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../UserContext';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';

const BottomSelect = ({ visible, items, onClose, onSelect }) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.phone}
          renderItem={({ item }) => (
            <Pressable
              style={styles.modalItem}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text style={styles.modalItemText}>
                {item.name} ({item.phone})
              </Text>
            </Pressable>
          )}
        />
        <Pressable style={styles.modalCancel} onPress={onClose}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const NewExpenseFriend = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useUser();

  const preSelectedFriend = route.params?.selectedFriend;
  const isValidPreSelected =
    preSelectedFriend &&
    typeof preSelectedFriend.phone === 'string' &&
    typeof preSelectedFriend.name === 'string';
  
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(
    isValidPreSelected ? preSelectedFriend : null
  );
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [friendModalVisible, setFriendModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const categories = [
    'Food',
    'Travel',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Other',
  ];

  const fetchFriends = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'friendships'));
      const result = [];

      snapshot.forEach((docSnap) => {
        const { user1, user2, metadata } = docSnap.data();

        if (user1 === user.phone && metadata?.[user2]) {
          result.push({ phone: user2, name: metadata[user2].name });
        } else if (user2 === user.phone && metadata?.[user1]) {
          result.push({ phone: user1, name: metadata[user1].name });
        }
      });

      setFriends(result);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  useEffect(() => {
    if (!isValidPreSelected) {
      fetchFriends();
    }
  }, []);

  const handleDateChange = (_, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (
      !selectedFriend ||
      typeof selectedFriend.phone !== 'string' ||
      !selectedFriend.name ||
      !amount ||
      !reason ||
      !selectedCategory
    ) {
      console.warn("Invalid friend or missing fields:", {
        selectedFriend,
        amount,
        reason,
        selectedCategory,
      });
      Alert.alert('Please fill out all fields correctly.');
      return;
    }
  
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Please enter a valid amount.');
      return;
    }

    console.log('Submitting expense with:', {
      from: user.phone,
      fromName: user.name,
      to: selectedFriend.phone,
      toName: selectedFriend.name,
      category: selectedCategory,
      amount: parsedAmount,
      reason,
      date: date.toISOString(),
    });
  
    try {
      await addDoc(collection(db, 'transactions'), {
        from: user.phone,
        fromName: user.name,
        to: selectedFriend.phone,
        toName: selectedFriend.name,
        category: selectedCategory,
        amount: parsedAmount,
        reason,
        date: Timestamp.fromDate(date),
        status: 'unpaid',
        createdAt: Timestamp.now(),
      });
      console.log('Added to transactions');
      await addDoc(collection(db, 'expenses'), {
        participants: [user.phone, selectedFriend.phone],
        from: user.phone,
        fromName: user.name,
        to: selectedFriend.phone,
        toName: selectedFriend.name,
        category: selectedCategory,
        amount: parsedAmount,
        reason,
        date: Timestamp.fromDate(date),
        status: 'unpaid',
        createdAt: Timestamp.now(),
      });
      console.log('Added to expenses');
      
      await addDoc(collection(db, 'activityLogs'), {
        type: 'expense',
        actor: user.phone,
        actorName: user.name,
        target: selectedFriend.phone,
        targetName: selectedFriend.name,
        amount: parsedAmount,
        category: selectedCategory,
        reason,
        date: Timestamp.fromDate(date),
        createdAt: Timestamp.now(),
        description: `${user.name} added an expense with ${selectedFriend.name} for $${parsedAmount} (${selectedCategory})`,
      });

      // Update owes/owedBy balances
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let friendUid = null;
      usersSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.phone === selectedFriend.phone) {
          friendUid = docSnap.id;
        }
      });

      console.log('Friend UID:', friendUid);
      if (!friendUid) {
        console.warn('No matching user found for selected friend phone:', selectedFriend.phone);
      }

      if (friendUid) {
        const friendRef = doc(db, 'users', friendUid);
        const userRef = doc(db, 'users', user.uid);
        const increment = (value) => ({
          [`owes.${user.phone}`]: (firebase.firestore.FieldValue.increment
            ? firebase.firestore.FieldValue.increment(value)
            : value),
        });
        const incrementOwed = (value) => ({
          [`owedBy.${selectedFriend.phone}`]: (firebase.firestore.FieldValue.increment
            ? firebase.firestore.FieldValue.increment(value)
            : value),
        });

        await updateDoc(friendRef, {
          [`owes.${user.phone}`]: parsedAmount,
        });

        await updateDoc(userRef, {
          [`owedBy.${selectedFriend.phone}`]: parsedAmount,
        });
      }
  
      navigation.navigate('ExpenseSuccess');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Could not save expense.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BottomSelect
        visible={friendModalVisible}
        items={friends}
        onClose={() => setFriendModalVisible(false)}
        onSelect={setSelectedFriend}
      />
      <BottomSelect
        visible={categoryModalVisible}
        items={categories.map((c) => ({ name: c, phone: c }))}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={(c) => setSelectedCategory(c.name)}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#9EC6F3" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!isValidPreSelected && (
          <>
            <Text style={styles.label}>Select a friend</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setFriendModalVisible(true)}
            >
              <Text style={styles.selectorText}>
                {selectedFriend
                  ? `${selectedFriend.name} (${selectedFriend.phone})`
                  : 'Choose a friend...'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.label}>Select a category</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {selectedCategory || 'Choose a category...'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="$0.00"
        />

        <Text style={styles.label}>Reason</Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={setReason}
          placeholder="e.g., Lunch, Tickets..."
        />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => setShowPicker(true)}
        >
          <Ionicons name="calendar" size={18} color="#666" />
          <Text style={styles.dateText}>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NewExpenseFriend;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF8' },
  scroll: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    marginTop: 18,
  },
  selector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
  },
  selectorText: { fontSize: 16, color: '#333' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 4,
  },
  dateText: { color: '#333', fontSize: 16 },
  button: {
    backgroundColor: '#9EC6F3',
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FAFAFA',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCancel: {
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#9EC6F3',
    fontSize: 16,
    fontWeight: '600',
  },
});