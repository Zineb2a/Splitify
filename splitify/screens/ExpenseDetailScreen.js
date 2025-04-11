import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
} from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useUser } from '../UserContext';

const ExpenseDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useUser();

  const {
    type = 'friend',
    name = '',
    phone = '',
    youOwe = true,
  } = route.params || {};

  const [entries, setEntries] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const iconMap = {
    car: <FontAwesome5 name="car" size={24} color="#9FB3DF" />,
    hotel: <FontAwesome5 name="hotel" size={24} color="#9FB3DF" />,
    food: <MaterialIcons name="restaurant" size={24} color="#9FB3DF" />,
    default: <Entypo name="dot-single" size={24} color="#9FB3DF" />,
  };

  const fetchExpenses = async () => {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('participants', 'array-contains', user.phone)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const involvesFriend =
            data.participants &&
            data.participants.includes(user.phone) &&
            data.participants.includes(phone);

          if (!involvesFriend) return null;

          return {
            id: doc.id,
            reason: data.reason || 'No description',
            amount: data.amount || 0,
            date: data.date || new Date(),
            icon: data.category?.toLowerCase() || 'default',
          };
        })
        .filter(Boolean);
      setEntries(results);
      const total = results.reduce((sum, item) => sum + (item.amount || 0), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', user.uid, 'expenses', entryId));
            setEntries((prev) => prev.filter((item) => item.id !== entryId));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete expense.');
            console.error(err);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (user?.uid && phone) {
      fetchExpenses();
    }
  }, [user, phone]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid && phone) {
        fetchExpenses();
      }
    }, [user, phone])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#FAFAFA"
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        />
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color="#FAFAFA"
          style={styles.menuDots}
        />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {type === 'friend' ? name[0] : '👥'}
          </Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.amount}>${totalAmount.toFixed(2)}</Text>
        <Text style={styles.subtitle}>
          {youOwe ? 'You owe' : 'You are owed'}
          {type === 'group' && youOwe ? ` ${name}` : ''}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.buttonOutline}
            onPress={() =>
              navigation.navigate('SettleUpSelect', {
                from: user.name,
                to: name,
                name,
              })
            }
          >
            <Text style={styles.buttonOutlineText}>Settle Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonFill}>
            <Text style={styles.buttonFillText}>
              {type === 'friend' ? 'Send Reminder' : 'Balances'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expenses List */}
      <ScrollView contentContainerStyle={styles.entriesContainer}>
        {entries.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onLongPress={() => handleDeleteEntry(item.id)}
          >
            {iconMap[item.icon?.toLowerCase()] || iconMap.default}
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.reason}</Text>
              <Text style={styles.cardSubtitle}>Added by You</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardDate}>
                {item.date?.toDate().toISOString().split('T')[0]}
              </Text>
              <Text style={styles.cardAmount}>${item.amount}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('NewExpenseFriend', {
            selectedFriend: {
              name,
              phone,
            },
          })
        }
      >
        <Ionicons name="add" size={30} color="#FAFAFA" />
      </TouchableOpacity>
    </View>
  );
};

export default ExpenseDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF8' },
  header: {
    backgroundColor: '#9EC6F3',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
  },
  backIcon: { position: 'absolute', top: 60, left: 20 },
  menuDots: { position: 'absolute', top: 60, right: 20 },
  avatar: {
    backgroundColor: '#FFF1D5',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 28,
    color: '#9FB3DF',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  amount: {
    fontSize: 24,
    color: '#FAFAFA',
    fontWeight: 'bold',
    marginTop: 4,
  },
  subtitle: {
    color: '#FAFAFA',
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#FAEFD7',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonOutlineText: {
    color: '#666',
    fontWeight: '500',
  },
  buttonFill: {
    backgroundColor: '#FAEFD7',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonFillText: {
    color: '#333',
    fontWeight: '500',
  },
  entriesContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
    elevation: 1,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  cardAmount: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#9EC6F3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});