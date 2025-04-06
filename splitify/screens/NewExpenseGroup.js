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

const groups = ['Trip To Lonavala', 'Movie Night', 'Dinner at Canto'];
const groupMembers = ['Subodh Kolhe', 'Shobhit Bakliwal', 'Firasat Durrani', 'Sushil Kumar'];

const BottomSelect = ({ visible, items, onClose, onSelect, multi = false, selectedItems = [] }) => {
  const handleSelect = (item) => {
    if (multi) {
      if (selectedItems.includes(item)) {
        onSelect(selectedItems.filter((i) => i !== item));
      } else {
        onSelect([...selectedItems, item]);
      }
    } else {
      onSelect(item);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <FlatList
            data={items}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable style={styles.modalItem} onPress={() => handleSelect(item)}>
                <Text style={styles.modalItemText}>
                  {multi ? (selectedItems.includes(item) ? '✓ ' : '') : ''}{item}
                </Text>
              </Pressable>
            )}
          />
          <Pressable style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const NewExpenseGroup = () => {
  const navigation = useNavigation();

  const [selectedGroup, setSelectedGroup] = useState('');
  const [members, setMembers] = useState([]);
  const [splitMethod, setSplitMethod] = useState('equal');
  const [customSplits, setCustomSplits] = useState({});
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = () => {
    if (!selectedGroup || !amount || !reason || members.length === 0) {
      alert('Please fill out all fields.');
      return;
    }

    if (splitMethod === 'custom') {
      const totalCustom = Object.values(customSplits).reduce((sum, v) => sum + parseFloat(v || 0), 0);
      const expectedAmount = parseFloat(amount);
      if (totalCustom !== expectedAmount) {
        alert(`Total custom amounts must equal $${expectedAmount}`);
        return;
      }
    }

    navigation.navigate('ExpenseSuccess');
  };

  return (
    <SafeAreaView style={styles.container}>
      <BottomSelect
        visible={groupModalVisible}
        items={groups}
        onClose={() => setGroupModalVisible(false)}
        onSelect={setSelectedGroup}
      />
      <BottomSelect
        visible={membersModalVisible}
        items={groupMembers}
        multi
        selectedItems={members}
        onClose={() => setMembersModalVisible(false)}
        onSelect={setMembers}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#9EC6F3" />
        </TouchableOpacity>

      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Group Selection */}
        <Text style={styles.label}>Select a group</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setGroupModalVisible(true)}>
          <Text style={styles.selectorText}>
            {selectedGroup || 'Choose a group...'}
          </Text>
        </TouchableOpacity>

        {/* Members */}
        <Text style={styles.label}>Select group members involved</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setMembersModalVisible(true)}>
          <Text style={styles.selectorText}>
            {members.length > 0 ? members.join(', ') : 'Choose members...'}
          </Text>
        </TouchableOpacity>

        {/* Split Method */}
        <Text style={styles.label}>Split method</Text>
        <View style={styles.splitOptions}>
          {['equal', 'custom'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                splitMethod === type && styles.chipSelected,
              ]}
              onPress={() => setSplitMethod(type)}
            >
              <Text
                style={[
                  styles.chipText,
                  splitMethod === type && styles.chipTextSelected,
                ]}
              >
                {type === 'equal' ? 'Split Equally' : 'Custom Amounts'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <Text style={styles.label}>Total Amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="$0.00"
        />

        {/* Custom Split Inputs */}
        {splitMethod === 'custom' && members.map((m) => (
          <View key={m}>
            <Text style={styles.label}>{m}'s Share</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={customSplits[m] || ''}
              onChangeText={(v) =>
                setCustomSplits({ ...customSplits, [m]: v })
              }
              placeholder="$0.00"
            />
          </View>
        ))}

        {/* Reason */}
        <Text style={styles.label}>Reason</Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={setReason}
          placeholder="e.g., Boat rental, Dinner..."
        />

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={18} color="#666" />
          <Text style={styles.dateText}>{date.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
        )}

        {/* Submit */}
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
    color: '#FAFA9EC6F3FA',
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
  buttonText: { color: '#FAFAFA', fontWeight: 'bold', fontSize: 16 },
  splitOptions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  chip: {
    backgroundColor: '#EEE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  chipSelected: { backgroundColor: '#9EC6F3' },
  chipText: { fontSize: 14, color: '#333' },
  chipTextSelected: { color: '#FAFAFA' },
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
