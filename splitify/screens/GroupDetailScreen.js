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
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const tabs = ['Expenses', 'Balances', 'Totals'];

const GroupDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params;

  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('Expenses');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const ref = doc(db, 'groups', groupId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setGroup({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error('Error fetching group:', err);
      }
    };
    fetchGroup();
  }, [groupId]);

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
    if (activeTab === 'Expenses') {
      return group.expenses?.length ? (
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
      group.expenses?.forEach((e) => {
        const amount = parseFloat(e.amount) || 0;
        const splitAmount = amount / e.participants.length;

        e.participants.forEach((p) => {
          balances[p] = (balances[p] || 0) - splitAmount;
        });
        balances[e.paidBy] = (balances[e.paidBy] || 0) + amount;
      });

      const keys = Object.keys(balances);
      if (!keys.length) return <Text style={styles.emptyText}>No balance info.</Text>;

      return keys.map((k) => (
        <View key={k} style={styles.balanceRow}>
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
      const total = group.expenses?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
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
        <Text style={styles.groupName}>{group.groupName}</Text>
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
        {group.members.map((m) => (
          <View key={m} style={styles.memberBubble}>
            <Text style={styles.memberText}>{m[0]}</Text>
          </View>
        ))}
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
});