import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ExpenseSuccessScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={72} color="#9EC6F3" />
      <Text style={styles.title}>Expense Added!</Text>
      <Text style={styles.message}>Your expense was successfully recorded.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExpenseSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#9EC6F3',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 40,
  },
  buttonText: {
    color: '#FAFAFA',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
