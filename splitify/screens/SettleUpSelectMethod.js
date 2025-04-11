import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SettleUpSelectMethod = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { from = 'Z', to = 'S', name = 'Subodh Kolhe' } = route.params || {};

  const [selected, setSelected] = useState('card');
  const [customAmount, setCustomAmount] = useState('');
  const [payFull, setPayFull] = useState(true);
  const [realAmount, setRealAmount] = useState(null);

  useEffect(() => {
    const fetchRealAmount = async () => {
      try {
        const docRef = doc(db, 'debts', `${from}_${to}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRealAmount(docSnap.data().amount);
        } else {
          setRealAmount(0);
        }
      } catch (error) {
        console.error('Failed to fetch real amount:', error);
      }
    };
    fetchRealAmount();
  }, []);

  const handleSettle = async () => {
    const amountToSettle = payFull ? realAmount : parseFloat(customAmount);
    if (!amountToSettle || isNaN(amountToSettle) || amountToSettle <= 0) {
      Alert.alert('Invalid amount');
      return;
    }

    try {
      await addDoc(collection(db, 'settlements'), {
        from,
        to,
        name,
        amount: amountToSettle,
        method: selected,
        settledAt: new Date().toISOString(),
      });

      navigation.navigate('SettleUpSuccess', {
        name,
        method: selected,
        amount: amountToSettle,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to record settlement.');
      console.error('Settlement error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#9EC6F3"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Settle Up</Text>
        </View>

        {/* Info */}
        <Text style={styles.info}>
          You owe{' '}
          <Text style={[styles.highlight, { color: '#4CAF50' }]}>{name}</Text>{' '}
          <Text style={styles.amount}>${realAmount ?? '...'}</Text>.
        </Text>

        {/* Toggle */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity
            style={[styles.toggleButton, payFull && styles.toggleActive]}
            onPress={() => setPayFull(true)}
          >
            <Text style={payFull ? styles.toggleTextActive : styles.toggleText}>Pay Full</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !payFull && styles.toggleActive]}
            onPress={() => setPayFull(false)}
          >
            <Text style={!payFull ? styles.toggleTextActive : styles.toggleText}>Custom Amount</Text>
          </TouchableOpacity>
        </View>
        {!payFull && (
          <TextInput
            placeholder="Enter amount"
            keyboardType="numeric"
            value={customAmount}
            onChangeText={setCustomAmount}
            style={styles.amountInput}
          />
        )}

        {/* Avatars */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.circle}>
              <Text style={styles.initials}>{from[0]}</Text>
            </View>
            <Text style={styles.avatarName}>{from}</Text>
          </View>

          <Ionicons name="arrow-forward" size={28} color="#ccc" />

          <View style={styles.avatarContainer}>
            <View style={styles.circle}>
              <Text style={styles.initials}>{to[0]}</Text>
            </View>
            <Text style={styles.avatarName}>{to}</Text>
          </View>
        </View>

        {/* Method */}
        <Text style={styles.subtext}>Choose a payment method</Text>

        <Pressable
          style={[
            styles.option,
            selected === 'card' && styles.optionSelected,
          ]}
          onPress={() => setSelected('card')}
        >
          <Ionicons
            name="card-outline"
            size={24}
            color={selected === 'card' ? '#4CAF50' : '#333'}
          />
          <Text style={styles.optionText}>Pay via Debit/Credit Card</Text>
        </Pressable>

        <Pressable
          style={[
            styles.option,
            selected === 'other' && styles.optionSelected,
          ]}
          onPress={() => setSelected('other')}
        >
          <Ionicons
            name="wallet-outline"
            size={24}
            color={selected === 'other' ? '#4CAF50' : '#333'}
          />
          <Text style={styles.optionText}>Record Other Payment Method</Text>
        </Pressable>

        {/* Settle Up */}
        <TouchableOpacity
          style={[styles.button, !selected && styles.buttonDisabled]}
          disabled={!selected}
          onPress={handleSettle}
        >
          <Text style={[styles.buttonText, !selected && { color: '#aaa' }]}>
            Settle Up
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettleUpSelectMethod;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  inner: {
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: '#9EC6F3',
    fontWeight: '600',
  },
  info: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
    lineHeight: 24,
  },
  highlight: {
    fontWeight: 'bold',
  },
  amount: {
    fontWeight: '600',
    color: '#9EC6F3',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginVertical: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    backgroundColor: '#E0F2F1',
    borderColor: '#9EC6F3',
    borderWidth: 2,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  avatarName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#9EC6F3',
    backgroundColor: '#F0F6FD',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#9EC6F3',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 40,
  },
  buttonDisabled: {
    backgroundColor: '#DDEAF7',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  toggleActive: {
    backgroundColor: '#9EC6F3',
    borderColor: '#9EC6F3',
  },
  toggleText: {
    fontSize: 14,
    color: '#555',
  },
  toggleTextActive: {
    fontSize: 14,
    color: '#fff',
  },
  amountInput: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
});
