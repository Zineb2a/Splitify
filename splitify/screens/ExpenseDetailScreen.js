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
import * as SMS from 'expo-sms';

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
      console.log("Running fetchExpenses for phone:", phone);
      const q = query(
        collection(db, 'expenses'),
        where('participants', 'array-contains', phone)
      );
      const snapshot = await getDocs(q);
      console.log("Fetched documents:", snapshot.size);
      snapshot.docs.forEach(doc => console.log(doc.id, doc.data()));
      const results = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          reason: data.reason || 'No description',
          amount: data.amount || 0,
          date: data.date?.toDate() || new Date(),
          icon: data.category?.toLowerCase() || 'default',
        };
      });
      console.log("Mapped results:", results);
      console.log('Fetched expenses:', results);
      setEntries(results);
      const total = results.reduce((sum, item) => sum + (item.amount || 0), 0);
      setTotalAmount(total);
    } catch (error) {
      console.log('Fetch expenses error:', error);
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
            await deleteDoc(doc(db, 'expenses', entryId));
            setEntries((prev) => prev.filter((item) => item.id !== entryId));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete expense.');
            console.error(err);
          }
        },
      },
    ]);
  };

  const handleSendReminder = async () => {
    if (!phone || !name || totalAmount === 0) {
      Alert.alert('Cannot send reminder', 'Missing information or no amount owed.');
      return;
    }

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('SMS Not Supported', 'This device does not support sending SMS.');
      return;
    }

    const message = `Hi ${name}, just a quick reminder from Splitify 💸\n\nYou currently owe me $${totalAmount.toFixed(2)} for our shared expenses. I'd appreciate it if you could settle up when possible.\n\nThanks!\n- ${user?.name}`;
    const { result } = await SMS.sendSMSAsync([phone], message);
    console.log('SMS send result:', result);
  };

  useEffect(() => {
    if (user?.uid && phone) {
      console.log('Triggering fetchExpenses...');
      fetchExpenses().then(() => {
        console.log('Finished fetching expenses.');
      });
    }
  }, [user, phone]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid && phone) {
        console.log('Triggering fetchExpenses...');
        fetchExpenses().then(() => {
          console.log('Finished fetching expenses.');
        });
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

          <TouchableOpacity
            style={styles.buttonFill}
            onPress={handleSendReminder}
          >
            <Text style={styles.buttonFillText}>
              {type === 'friend' ? 'Send Reminder' : 'Balances'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expenses List */}
      <ScrollView contentContainerStyle={styles.entriesContainer}>
        {entries.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
            No expenses found for this contact.
          </Text>
        )}
        {entries.map((item) => {
          console.log("Rendering entry:", item);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onLongPress={() => handleDeleteEntry(item.id)}
            >
              {(iconMap[item.icon?.toLowerCase()] || iconMap.default)}
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.reason}</Text>
                <Text style={styles.cardSubtitle}>Added by You</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardDate}>
                  {item.date?.toISOString().split('T')[0]}
                </Text>
                <Text style={styles.cardAmount}>${item.amount}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {console.log("Rendering entries:", entries)}
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