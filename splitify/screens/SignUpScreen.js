import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')} // Your logo here
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>SIGN UP</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
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

        {/* Custom Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgree(!agree)}
        >
          <View style={[styles.checkboxBox, agree && styles.checkboxBoxChecked]} />
          <Text style={styles.checkboxText}>
            I agree to the Terms of Service and Privacy Policy
          </Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Link to Sign In */}
        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Sign In
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default SignUpScreen;

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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#9FB3DF',
    borderColor: '#9FB3DF',
  },
  checkboxText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  signUpButton: {
    backgroundColor: '#9EC6F3',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 8,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#333',
  },
  link: {
    color: '#9FB3DF',
    fontWeight: '600',
  },
});
