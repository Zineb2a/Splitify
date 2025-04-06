import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const SettleUpSelectMethod = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { from = 'Z', to = 'S', name = 'Subodh Kolhe', amount = '$500' } =
    route.params || {};

  const [selected, setSelected] = useState(null);

  const handleSettle = () => {
    if (!selected) return;
    navigation.navigate('SettleUpSuccess', { name });
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
          <Text style={styles.amount}>{amount}</Text>.
        </Text>

        {/* Avatars */}
        <View style={styles.avatarRow}>
          <View style={styles.circle}>
            <Text style={styles.circleText}>{from}</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#ccc" />
          <View style={styles.circle}>
            <Text style={styles.circleText}>{to}</Text>
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
    marginBottom: 24,
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
    marginBottom: 24,
  },
  circle: {
    backgroundColor: '#BDDDE4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    padding: 16,
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
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 24,
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: '#DDEAF7',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
});
