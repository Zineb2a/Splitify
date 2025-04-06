import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const groupMembers = [
  {
    name: 'Subodh Kolhe',
    email: 'subodhkolhe@gmail.com',
    initial: 'S',
    amount: '$500',
    youOwe: true,
  },
  {
    name: 'Sushil Kumar',
    email: 'sushilkumar@gmail.com',
    initial: 'S',
    amount: '$500',
    youOwe: true,
  },
  {
    name: 'Shubham Gupta',
    email: 'shubhamgupta@gmail.com',
    initial: 'S',
    amount: '$500',
    youOwe: false,
  },
];

const SettleUpGroupSelect = () => {
  const navigation = useNavigation();

  const handleSelect = (member) => {
    navigation.navigate('SettleUpSelect', {
      from: 'Z',
      to: member.initial,
      name: member.name,
      amount: member.amount,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settle Up</Text>
        <Ionicons name="ellipsis-vertical" size={20} color="#FAFAFA" />
      </View>

      {/* Content Container */}
      <View style={styles.innerContainer}>
        <Text style={styles.prompt}>Who do you want to settle up with?</Text>

        <FlatList
          data={groupMembers}
          keyExtractor={(item) => item.email}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSelect(item)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.initial}</Text>
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardText}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.oweLabel}>
                    {item.youOwe ? 'You owe' : 'Owes you'}
                  </Text>
                  <Text style={styles.amount}>{item.amount}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default SettleUpGroupSelect;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9EC6F3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#9EC6F3',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  innerContainer: {
    backgroundColor: '#FFFDF8',
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  prompt: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#BDDDE4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardInfo: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  oweLabel: {
    fontSize: 12,
    color: '#9EC6F3',
    fontWeight: '500',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9EC6F3',
  },
});
