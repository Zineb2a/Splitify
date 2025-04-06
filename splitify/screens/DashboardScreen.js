import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('FRIENDS');

  const friendsData = [
    {
      letter: 'S',
      name: 'Subodh Kolhe',
      subtitle: 'You owe',
      amount: '$500',
      color: '#F44336',
    },
    {
      letter: 'S',
      name: 'Shobhit Bakliwal',
      subtitle: 'owes you',
      amount: '$500',
      color: '#4CAF50',
    },
    {
      letter: 'F',
      name: 'Firasat Durrani',
      subtitle: 'owes you',
      amount: '$500',
      color: '#4CAF50',
    },
    {
      letter: 'S',
      name: 'Sushil Kumar',
      subtitle: 'You owe',
      amount: '$500',
      color: '#F44336',
    },
  ];

  const groupsData = [
    {
      icon: (
        <FontAwesome5 name="mountain" size={24} color="#9FB3DF" />
      ),
      title: 'Trip To Lonavala',
      subtitle: 'You owe Shubham',
      amount: '$500',
    },
    {
      icon: <FontAwesome5 name="film" size={24} color="#4CAF50" />,
      title: 'Movie Night',
      subtitle: 'Shobhit owes you',
      amount: '$500',
    },
    {
      icon: (
        <MaterialIcons name="restaurant" size={24} color="#4CAF50" />
      ),
      title: 'Dinner at Canto',
      subtitle: 'Firasat owes you',
      amount: '$500',
    },
    {
      icon: (
        <FontAwesome5 name="campground" size={24} color="#F44336" />
      ),
      title: 'Trip To Matheran',
      subtitle: 'You owe Sushil Kumar',
      amount: '$500',
    },
  ];

  const activityData = [
    {
      icon: <Feather name="shopping-bag" size={24} color="#9FB3DF" />,
      title: 'You added Fries',
      subtitle: 'Shobhit owes you',
    },
    {
      icon: <FontAwesome5 name="film" size={24} color="#4CAF50" />,
      title: 'Shobhit added to the group "Movie Night"',
    },
    {
      icon: <FontAwesome5 name="mountain" size={24} color="#9FB3DF" />,
      title: 'You added Shubham to the group "Trip To Lonavala"',
    },
    {
      icon: (
        <Ionicons name="checkmark-done" size={24} color="#F44336" />
      ),
      title: 'You settled with Sushil Kumar',
      subtitle: 'You paid $500',
    },
  ];

  const handleMenu = () => {
    Alert.alert('Menu', 'This will open the drawer later');
  };

  const renderContent = () => {
    if (activeTab === 'FRIENDS') {
      return friendsData.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            navigation.navigate('ExpenseDetail', {
              type: 'friend',
              name: item.name,
              amount: item.amount,
              youOwe: item.subtitle.toLowerCase().includes('you owe'),
              entries: [
                {
                  title: 'Car',
                  by: item.name,
                  amount: 500,
                  date: 'Nov 3, 2019',
                  icon: 'car',
                },
                {
                  title: 'Hotel',
                  by: item.name,
                  amount: 500,
                  date: 'Nov 3, 2019',
                  icon: 'hotel',
                },
                {
                  title: 'Food',
                  by: item.name,
                  amount: 500,
                  date: 'Nov 3, 2019',
                  icon: 'food',
                },
              ],
            })
          }
        >
          <View style={[styles.circleAvatar, { borderColor: item.color }]}>
            <Text style={[styles.circleText, { color: item.color }]}>
              {item.letter}
            </Text>
          </View>
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.amount}>{item.amount}</Text>
        </TouchableOpacity>
      ));
    }

    if (activeTab === 'GROUPS') {
      return groupsData.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() =>
            navigation.navigate('SettleUpGroupSelect', {
              groupName: item.title,
            })
          }
        >
          {item.icon}
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.amount}>{item.amount}</Text>
        </TouchableOpacity>
      ));
    }

    return activityData.map((item, index) => (
      <View key={index} style={styles.card}>
        {item.icon}
        <View style={styles.textContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          ) : null}
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="menu"
          size={24}
          color="#FAFAFA"
          style={styles.menuIcon}
          onPress={handleMenu}
        />
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color="#FAFAFA"
          style={styles.menuDots}
        />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>Z</Text>
        </View>
        <Text style={styles.name}>Zineb</Text>
      </View>

      {/* Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You are owed</Text>
          <Text style={styles.balanceAmount}>$1500</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You owe</Text>
          <Text style={styles.balanceAmount}>$750</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>$750</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['FRIENDS', 'GROUPS', 'ACTIVITY'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.activityFeed}>
        {renderContent()}
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewTransaction')}
      >
        <Ionicons name="add" size={30} color="#FAFAFA" />
      </TouchableOpacity>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF8' },
  header: {
    backgroundColor: '#9EC6F3',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  menuIcon: { position: 'absolute', top: 60, left: 20 },
  menuDots: { position: 'absolute', top: 60, right: 20 },
  avatar: {
    backgroundColor: '#FFF1D5',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  avatarText: { fontSize: 32, color: '#9EC6F3', fontWeight: 'bold' },
  name: { fontSize: 16, color: '#FAFAFA', fontWeight: '500' },
  balanceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#ccc',
    padding: 16,
    justifyContent: 'space-between',
  },
  balanceItem: { alignItems: 'center', flex: 1 },
  balanceLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  balanceAmount: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    marginBottom: 8,
  },
  tab: { fontSize: 14, fontWeight: '500', color: '#999' },
  tabActive: {
    color: '#9EC6F3',
    borderBottomWidth: 2,
    borderColor: '#9EC6F3',
    paddingBottom: 4,
  },
  activityFeed: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    gap: 12,
  },
  circleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardSubtitle: { fontSize: 13, color: '#777', marginTop: 2 },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
