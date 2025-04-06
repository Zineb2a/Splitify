import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();


  return (
    <View style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')} // <- Replace with your logo
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>LOGIN</Text>
      </View>

      {/* Input fields */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Sign In button */}
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Bottom links */}
        <Text style={styles.text}>
  Don’t have an account?{' '}
  <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
    Sign up
  </Text>
</Text>

        <Text style={styles.or}>OR</Text>

        {/* Google Sign In Button (UI only) */}
        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: '#FFF1D5',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  logo: {
    height: 80,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 22,
    color: '#9FB3DF',
    fontWeight: 'bold',
  },
  form: {
    padding: 24,
    gap: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgot: {
    alignItems: 'flex-end',
  },
  forgotText: {
    color: '#9FB3DF',
    fontSize: 13,
  },
  signInButton: {
    backgroundColor: '#9EC6F3',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    textAlign: 'center',
    marginTop: 8,
    color: '#333',
  },
  link: {
    color: '#9FB3DF',
    fontWeight: '600',
  },
  or: {
    textAlign: 'center',
    marginVertical: 12,
    color: '#999',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  googleText: {
    fontWeight: '500',
    color: '#444',
  },
});


