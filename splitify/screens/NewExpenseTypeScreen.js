import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NewExpenseType = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#9EC6F3" />
        </TouchableOpacity>
 
      </View>

      {/* Prompt */}
      <Text style={styles.title}>Who is this expense for?</Text>

      {/* Friend Option */}
      <TouchableOpacity
        style={[styles.optionButton, styles.friend]}
        onPress={() => navigation.navigate('NewExpenseFriend')}
      >
        <FontAwesome5 name="user" size={20} color="#FAFAFA" style={styles.icon} />
        <Text style={styles.optionText}>Friend</Text>
      </TouchableOpacity>

      {/* Group Option */}
      <TouchableOpacity
        style={[styles.optionButton, styles.group]}
        onPress={() => navigation.navigate('NewExpenseGroup')}
      >
        <FontAwesome5 name="users" size={20} color="#FAFAFA" style={styles.icon} />
        <Text style={styles.optionText}>Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NewExpenseType;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  header: {
    backgroundColor: '',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9EC6F3',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 1,
    marginBottom: 20,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  friend: {
    backgroundColor: '#9EC6F3',
  },
  group: {
    backgroundColor: '#F7DCA7',
  },
});
