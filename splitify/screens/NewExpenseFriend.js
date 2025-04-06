import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

const friendsList = ['Subodh Kolhe', 'Shobhit Bakliwal', 'Firasat Durrani', 'Sushil Kumar'];
const categories = ['Food', 'Travel', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

const BottomSelect = ({ visible, items, onClose, onSelect }) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <FlatList
          data={items}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable style={styles.modalItem} onPress={() => { onSelect(item); onClose(); }}>
              <Text style={styles.modalItemText}>{item}</Text>
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
  const [selectedFriend, setSelectedFriend] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [friendModalVisible, setFriendModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const handleDateChange = (_, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = () => {
    if (!selectedFriend || !amount || !reason || !selectedCategory) {
      alert('Please fill out all fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    navigation.navigate('ExpenseSuccess');
  };

  return (
    <SafeAreaView style={styles.container}>
      <BottomSelect
        visible={friendModalVisible}
        items={friendsList}
        onClose={() => setFriendModalVisible(false)}
        onSelect={setSelectedFriend}
      />
      <BottomSelect
        visible={categoryModalVisible}
        items={categories}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={setSelectedCategory}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#9EC6F3" />
        </TouchableOpacity>

      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.label}>Select a friend</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setFriendModalVisible(true)}>
          <Text style={styles.selectorText}>
            {selectedFriend || 'Choose a friend...'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Select a category</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setCategoryModalVisible(true)}>
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
        <TouchableOpacity style={styles.datePicker} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar" size={18} color="#666" />
          <Text style={styles.dateText}>{date.toISOString().split('T')[0]}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  scroll: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9EC6F3',
    marginLeft: 12,
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
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
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
  dateText: {
    color: '#333',
    fontSize: 16,
  },
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
