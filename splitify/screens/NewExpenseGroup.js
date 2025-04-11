import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
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
import { db } from '../firebase';
import { collection, addDoc, Timestamp, getDoc, doc } from 'firebase/firestore';

const NewExpenseGroup = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useUser();
  const { groupId, groupName: initialGroupName, members: initialMembers = [] } = route.params || {};

  // Debug log: Check members passed from navigation
  useEffect(() => {
    console.log('Group members from route params:', initialMembers);
  }, [initialMembers]);

  const [groupName, setGroupName] = useState(initialGroupName || '');
  const [members, setMembers] = useState(initialMembers);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);  
  const [splitMode, setSplitMode] = useState('equal'); // only equal split supported for now
  const [customSplits, setCustomSplits] = useState({});

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (!amount || !reason || selectedMembers.length === 0) {
      Alert.alert('Missing Fields', 'Please fill out all fields and select at least one member.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid numeric amount.');
      return;
    }

    let splits = [];
    if (splitMode === 'equal') {
      const perPerson = parsedAmount / selectedMembers.length;
      splits = selectedMembers.map((m) => ({
        name: m.name,
        phone: m.phone,
        amount: perPerson,
      }));
    } else {
      splits = selectedMembers.map((m) => ({
        name: m.name,
        phone: m.phone,
        amount: isNaN(parseFloat(customSplits[m.phone])) ? 0 : parseFloat(customSplits[m.phone]),
      }));
    }

    console.log('Adding expense:', {
      total: parsedAmount,
      reason,
      date: Timestamp.fromDate(date),
      splits,
    });

    try {
      await addDoc(collection(db, 'groups', groupId, 'expenses'), {
        total: parsedAmount,
        reason,
        date: Timestamp.fromDate(date),
        splits,
      });

      console.log('Adding activity log...');

      await addDoc(collection(db, 'groups', groupId, 'activityLogs'), {
        action: 'expense_added',
        reason,
        total: parsedAmount,
        splits,
        date: Timestamp.fromDate(date),
        createdAt: Timestamp.now(),
        actor: user.phone,
        actorName: user.name,
        groupId,
        groupName,
        type: 'group_expense', // distinguish this
        description: `${user.name} added a group expense in ${groupName} for $${parsedAmount} (${reason})`,
      });

      console.log('Activity log added successfully');

      // Optionally, you could add activity logging here
      navigation.navigate('ExpenseSuccess');
    } catch (error) {
      Alert.alert('Error', 'Error adding expense: ' + error.message);
    }
  };

  useEffect(() => {
    if (!groupId || members.length > 0) return;

    const fetchGroup = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'groups', groupId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGroupName(data.name);
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error('Error fetching group:', error);
      }
    };

    fetchGroup();
  }, [groupId]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#9EC6F3" />
        </TouchableOpacity>
        <Text style={styles.title}>New Group Expense</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Group Name */}
        <Text style={styles.label}>Group: {groupName}</Text>

        {/* Members Selection */}
        <Text style={styles.label}>Select Members</Text>
        {members && members.length > 0 ? (
          members.map((member) => (
            <TouchableOpacity
              key={member.phone}
              style={[
                styles.selector,
                selectedMembers.find((m) => m.phone === member.phone)
                  ? { backgroundColor: '#D6EAF8' }
                  : null,
              ]}
              onPress={() => {
                setSelectedMembers((prev) =>
                  prev.find((m) => m.phone === member.phone)
                    ? prev.filter((m) => m.phone !== member.phone)
                    : [...prev, member]
                );
              }}
            >
              <Text style={styles.selectorText}>{member.name} ({member.phone})</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No members to select.</Text>
        )}

        {/* Split Mode Selection */}
        <Text style={styles.label}>Split Mode</Text>
        <View style={styles.toggleContainer}>
          {['equal', 'custom'].map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setSplitMode(mode)}
              style={[
                styles.toggleButton,
                splitMode === mode && styles.toggleActive,
              ]}
            >
              <Text style={splitMode === mode ? styles.toggleTextActive : styles.toggleText}>
                {mode === 'equal' ? 'Equal Split' : 'Custom Split'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {splitMode === 'custom' && selectedMembers.map((member) => (
          <View key={member.phone} style={styles.customSplitContainer}>
            <Text style={styles.label}>{member.name}'s Amount</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={customSplits[member.phone] || ''}
              onChangeText={(val) =>
                setCustomSplits((prev) => ({ ...prev, [member.phone]: val }))
              }
              placeholder="$0.00"
            />
          </View>
        ))}

        {/* Amount and Reason Inputs */}
        <Text style={styles.label}>Total Amount</Text>
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
          placeholder="e.g., Boat rental, Dinner..."
        />

        {/* Date Picker */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={18} color="#666" />
          <Text style={styles.dateText}>{date.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Add Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NewExpenseGroup;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF8' },
  scroll: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 10 },
  title: { fontSize: 18, fontWeight: '600', color: '#9EC6F3', marginLeft: 12 },
  label: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 6, marginTop: 18 },
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
  buttonText: { color: '#FAFAFA', fontWeight: 'bold', fontSize: 16 },
  selector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
  },
  selectorText: { fontSize: 16, color: '#333' },
  emptyText: { fontSize: 14, color: '#777', marginTop: 10, textAlign: 'center' },
  toggleContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  toggleActive: {
    backgroundColor: '#9EC6F3',
    borderColor: '#9EC6F3',
  },
  toggleText: { fontSize: 14, color: '#333' },
  toggleTextActive: { fontSize: 14, color: '#fff' },
  customSplitContainer: { marginBottom: 10 },
});