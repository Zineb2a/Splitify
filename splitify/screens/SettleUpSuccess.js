import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const SettleUpSuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name = 'Subodh Kolhe' } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.hurray}>Hurray!!</Text>
        <Text style={styles.message}>
          Your account with{' '}
          <Text style={styles.nameHighlight}>{name}</Text> has been settled up
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettleUpSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    backgroundColor: '#9EC6F3',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
  },
  hurray: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  nameHighlight: {
    color: '#9EC6F3',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#9EC6F3',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 24,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
