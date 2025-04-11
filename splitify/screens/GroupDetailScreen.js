import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../UserContext';

const tabs = ['Expenses', 'Balances', 'Totals'];

const GroupDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params;
  const { user } = useUser();

  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('Expenses');

  useEffect(() => {
    if (!groupId) {
      console.warn("Invalid groupId:", groupId);
      return;
    }

    const fetchGroup = async () => {
      try {
        console.log("Fetching group with ID:", groupId);
        const ref = doc(db, 'groups', String(groupId));
        const snap = await getDoc(ref);
        console.log("Fetched group snapshot:", snap.exists(), snap.data());
        if (snap.exists()) {
          const data = snap.data();
          const members = data.members || [];

          const alreadyIncluded = members.some((m) => m.phone === user.phone);
          const finalMembers = alreadyIncluded
            ? members
            : [...members, { phone: user.phone, name: user.name }];

          setGroup({
            id: snap.id,
            expenses: data.expenses || [],
            members: finalMembers,
            groupName: data.groupName || data.name || 'Unnamed Group',
          });
        } else {
          console.warn("Group not found for ID:", groupId);
        }
      } catch (err) {
        console.error('Error fetching group:', err);
      }
    };

    fetchGroup();
  }, [groupId]);

  const fetchFriendDebts = async (friendsList) => {
    try {
      const transactionsRef = collection(db, 'transactions');
      const snapshot = await getDocs(transactionsRef);
      const allTransactions = snapshot.docs.map((doc) => doc.data());
      const updated = friendsList.map((friend) => {
        const relevant = allTransactions.filter(
          (t) => t.to === friend.phone || t.from === friend.phone
        );
        let balance = 0;
        relevant.forEach((t) => {
          if (t.to === friend.phone) balance += t.amount;
          if (t.from === friend.phone) balance -= t.amount;
        });
        return {
          ...friend,
          amount: Math.abs(balance).toFixed(2),
          youOwe: balance < 0,
        };
      });
      setFriends(updated);
    } catch (err) {
      console.error('Error calculating balances:', err);
    }
  };

  const handleLeaveGroup = async () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Leave',
        onPress: async () => {
          try {
            const ref = doc(db, 'groups', groupId);
            await updateDoc(ref, {
              members: group.members.filter((m) => m !== '514-123-4567'), // Replace with current user
            });
            navigation.goBack();
          } catch (err) {
            console.error('Failed to leave group:', err);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    if (!group || !group.expenses) {
      return <Text style={styles.emptyText}>No data to display.</Text>;
    }

    if (activeTab === 'Expenses') {
      return group.expenses.length ? (
        group.expenses.map((exp, idx) => (
          <View key={idx} style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
              <MaterialIcons name="receipt" size={20} color="#9FB3DF" />
              <Text style={styles.expenseTitle}>{exp.title}</Text>
            </View>
            <Text style={styles.expenseDetail}>
              Paid by {exp.paidBy} - ${exp.amount}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No expenses yet.</Text>
      );
    }

    if (activeTab === 'Balances') {
      const balances = {};

      // Initialize all balances to 0 for all members
      group.members.forEach((m) => {
        balances[m.name] = 0;
      });

      group.expenses.forEach((e) => {
        const amount = parseFloat(e.amount) || 0;
        const splitAmount = amount / e.participants.length;

        e.participants.forEach((phone) => {
          const member = group.members.find((m) => m.phone === phone);
          if (member) {
            balances[member.name] = (balances[member.name] || 0) - splitAmount;
          }
        });

        const payer = group.members.find((m) => m.phone === e.paidBy);
        if (payer) {
          balances[payer.name] = (balances[payer.name] || 0) + amount;
        }
      });

      const keys = Object.keys(balances);
      if (!keys.length) return <Text style={styles.emptyText}>No balance info.</Text>;

      return keys.map((k, index) => (
        <View key={`${k}-${index}`} style={styles.balanceRow}>
          <Text style={styles.balanceName}>{k}</Text>
          <Text
            style={[
              styles.balanceAmount,
              {
                color: balances[k] < 0 ? '#F44336' : '#4CAF50',
              },
            ]}
          >
            {balances[k] < 0 ? `Owes $${Math.abs(balances[k]).toFixed(2)}` : `Gets $${balances[k].toFixed(2)}`}
          </Text>
        </View>
      ));
    }

    if (activeTab === 'Totals') {
      const total = group.expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      return (
        <View>
          <Text style={styles.totalAmount}>Total Spent: ${total?.toFixed(2) || 0}</Text>
          {/* Placeholder for future graph, e.g. contribution pie chart */}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text style={styles.groupName}>{group.groupName || 'Unnamed Group'}</Text>
        <TouchableOpacity
          style={styles.menuIcon}
          onPress={() =>
            Alert.alert('Options', '', [
              { text: 'Edit Group', onPress: () => {} },
              { text: 'Leave Group', onPress: handleLeaveGroup },
              { text: 'Cancel', style: 'cancel' },
            ])
          }
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#FAFAFA" />
        </TouchableOpacity>
      </View>

      {/* Members */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersBar}>
        {group.members?.length > 0 ? [...group.members.filter((m, i, arr) =>
          arr.findIndex(a => a.phone === m.phone) === i
        )].map((m, idx) => (
          <View key={m.phone?.toString() || `member-${idx}`} style={styles.memberBubble}>
            <Text style={styles.memberText}>{m.name?.[0] || "?"}</Text>
          </View>
        )) : <Text style={styles.emptyText}>No members yet.</Text>}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tab, activeTab === t && styles.tabActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {renderTabContent()}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (group?.id) {
            navigation.navigate("NewGroupExpense", {
              groupId: group.id,
              members: group.members,
            });
          } else {
            Alert.alert("Error", "Group ID is missing.");
          }
        }}
      >
        <Ionicons name="add" size={30} color="#FAFAFA" />
      </TouchableOpacity>
    </View>
  );
};

export default GroupDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF8' },
  header: {
    backgroundColor: '#9EC6F3',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  backIcon: { position: 'absolute', top: 60, left: 20 },
  menuIcon: { position: 'absolute', top: 60, right: 20 },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  membersBar: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  memberBubble: {
    backgroundColor: '#FFF1D5',
    borderRadius: 25,
    padding: 10,
    marginRight: 10,
  },
  memberText: {
    fontWeight: 'bold',
    color: '#9EC6F3',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tab: {
    fontSize: 14,
    color: '#999',
  },
  tabActive: {
    fontWeight: 'bold',
    color: '#9EC6F3',
    borderBottomWidth: 2,
    borderColor: '#9EC6F3',
    paddingBottom: 4,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  expenseTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  expenseDetail: {
    fontSize: 12,
    color: '#777',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  balanceName: { fontSize: 14, color: '#333' },
  balanceAmount: { fontSize: 14, fontWeight: '600' },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
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
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});