import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Logo & Title */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')} // Make sure your logo is named correctly
          style={styles.logo}
          resizeMode="contain"
        />

      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonTextPrimary}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.buttonTextSecondary}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9FB3DF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  buttonPrimary: {
    backgroundColor: '#9EC6F3',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#9FB3DF',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: '#9FB3DF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
