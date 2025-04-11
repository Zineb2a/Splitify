import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../UserContext';

const formatPhoneNumber_1 = (phone) => {
  if (!phone) return "";
  const cleaned = ("" + phone).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("FRIENDS");
  const { user } = useUser();

  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [youOweTotal, setYouOweTotal] = useState(0);
  const [owedToYouTotal, setOwedToYouTotal] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);

  const loadFriends = async () => {
    try {
      if (!user || !user.uid) {
        console.error("No valid user.uid found:", user);
        setFriends([]);
        setLoadingFriends(false);
        return;
      }

      const friendshipsRef = collection(db, "friendships");
      const snapshot = await getDocs(friendshipsRef);

      const friendsList = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();

        if (data) {
          const { user1, user2, metadata } = data;

          if (user1 === user.phone && metadata && metadata[user2]) {
            friendsList.push({
              phone: user2,
              name: metadata[user2].name || "Unknown",
            });
          } else if (user2 === user.phone && metadata && metadata[user1]) {
            friendsList.push({
              phone: user1,
              name: metadata[user1].name || "Unknown",
            });
          }
        }
      });

      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friends:", error);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadGroups = async () => {
    try {
      const userPhone = user.phone;
      const userId = user.uid;

      if (!userId || !userPhone) {
        console.error("User not authenticated or missing phone number");
        return [];
      }

      const groupSnapshot = await getDocs(collection(db, "groups"));
      const groups = [];

      for (const doc of groupSnapshot.docs) {
        const data = doc.data();
        const members = (data.members || []).map(member =>
          typeof member === 'string' ? { phone: member } : member
        );
        const isCreator = data.createdBy === userId;
        const isMember = members.some(
          (member) => member.phone === userPhone
        );

        if (isCreator || isMember) {
          const groupExpensesRef = collection(db, "groups", doc.id, "expenses");
          const expenseSnapshot = await getDocs(groupExpensesRef);
          const expenses = expenseSnapshot.docs.map(d => d.data());

          const userBalance = calculateUserBalance(expenses, userPhone);
          groups.push({ id: doc.id, ...data, members, expenses, userBalance });
        }
      }

      setGroups(groups);
    } catch (error) {
      console.error("Error loading groups:", error);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const calculateUserBalance = (expenses, userPhone) => {
    let userBalance = 0;
    expenses.forEach((expense) => {
      if (expense.splits) {
        expense.splits.forEach((split) => {
          if (split.phone === userPhone) {
            if (expense.paidBy === userPhone) {
              // User paid but owes themselves => ignore
            } else {
              userBalance -= split.amount; // User owes this split
            }
          } else if (expense.paidBy && expense.paidBy === userPhone) {
            userBalance += split.amount; // User paid and others owe
          }
        });
      }
    });
    return userBalance;
  };

  const loadBalances = async () => {
    try {
      const userPhone = user.phone;
      const userId = user.uid;

      let youOwe = 0;
      let owedToYou = 0;

      // Fetch individual expenses (friend-to-friend)
      const expensesRef = collection(db, "expenses");
      const snapshot = await getDocs(expensesRef);

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!data.from || !data.to || typeof data.amount !== "number") return;

        if (data.from === userPhone) {
          youOwe += data.amount;
        } else if (data.to === userPhone) {
          owedToYou += data.amount;
        }
      });

      // Fetch group expenses from each group document using real-time group subcollections
      const groupSnapshot = await getDocs(collection(db, "groups"));
  
      for (const groupDoc of groupSnapshot.docs) {
        const groupId = groupDoc.id;
        const groupExpensesRef = collection(db, "groups", groupId, "expenses");
        const expenseSnapshot = await getDocs(groupExpensesRef);
  
        expenseSnapshot.docs.forEach((doc) => {
          const expense = doc.data();
          const splits = expense.splits || [];
  
          splits.forEach((split) => {
            if (!split || isNaN(split.amount)) return;
  
            if (split.phone === userPhone) {
              if (expense.paidBy !== userPhone) {
                youOwe += split.amount;
              }
            } else if (expense.paidBy === userPhone) {
              owedToYou += split.amount;
            }
          });
        });
      }

      setYouOweTotal(youOwe);
      setOwedToYouTotal(owedToYou);
      setTotalBalance(owedToYou - youOwe);
    } catch (error) {
      console.error("Failed to calculate balances:", error);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const logsRef = collection(db, "activityLogs");
      const snapshot = await getDocs(logsRef);
      const rawLogs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (log) =>
            log.actor === user.phone ||
            log.target === user.phone ||
            log.participants?.includes(user.phone) ||
            (log.groupId && log.participants?.includes(user.phone))
        )
        .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
      console.log("Loaded activity logs:", rawLogs);
      setActivityLogs(rawLogs);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        setLoadingFriends(true);
        setLoadingGroups(true);
        loadFriends();
        loadGroups();
        loadBalances();
        loadActivityLogs();
      }
      return () => {
        // Cleanup function if needed
      };
    }, [user])
  );

  useEffect(() => {
    if (user?.uid) {
      loadFriends();
      loadGroups();
      loadBalances();
      loadActivityLogs();
    }
  }, [user]);

  const renderContent = () => {
    if (activeTab === "FRIENDS") {
      if (loadingFriends) {
        return <Text style={styles.emptyText}>Loading friends...</Text>;
      }

      if (friends.length === 0) {
        return (
          <Text style={styles.emptyText}>
            No friends found. Your user phone:{" "}
            {formatPhoneNumber_1(user?.phone)}
          </Text>
        );
      }

      return friends.map((friend, index) => (
        <TouchableOpacity
          key={`friend-${friend.phone}-${index}`}
          style={styles.card}
          onPress={() =>
            navigation.navigate("ExpenseDetail", {
              type: "friend",
              name: friend.name,
              phone: friend.phone,
              amount: "$0",
              youOwe: false,
              entries: [],
            })
          }
          onLongPress={() => {
            Alert.alert("Remove Friend", `Do you want to remove ${friend.name}?`, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                  try {
                    const snapshot = await getDocs(collection(db, "friendships"));
                    snapshot.forEach(async (doc) => {
                      const data = doc.data();
                      if (
                        (data.user1 === user.phone && data.user2 === friend.phone) ||
                        (data.user2 === user.phone && data.user1 === friend.phone)
                      ) {
                        await deleteDoc(doc.ref);
                      }
                    });
                    loadFriends(); // Refresh the list
                  } catch (error) {
                    console.error("Failed to remove friend:", error);
                  }
                },
              },
            ]);
          }}
        >
          <View style={[styles.circleAvatar, { borderColor: "#4CAF50" }]}>
            <Text style={[styles.circleText, { color: "#4CAF50" }]}>
              {friend.name?.[0] || "?"}
            </Text>
          </View>
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>{friend.name}</Text>
            <Text style={styles.cardSubtitle}>
              {formatPhoneNumber_1(friend.phone)}
            </Text>
          </View>
        </TouchableOpacity>
      ));
    }

    if (activeTab === "GROUPS") {
      if (loadingGroups) {
        return <Text style={styles.emptyText}>Loading groups...</Text>;
      }

      if (groups.length === 0) {
        return <Text style={styles.emptyText}>No groups yet.</Text>;
      }

      return groups.map((group, index) => (
        <TouchableOpacity
          key={`group-${index}`}
          style={styles.card}
          onPress={() =>
            navigation.navigate("GroupDetail", {
              groupId: group.id,
              groupName: group.name,
              members: group.members,
            })
          }
          onLongPress={() => {
            Alert.alert("Leave Group", `Do you want to leave ${group.name}?`, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Leave",
                style: "destructive",
                onPress: async () => {
                  try {
                    const groupRef = doc(db, "groups", group.id);
                    await deleteDoc(groupRef);
                    Alert.alert("Group Deleted", `${group.name} has been deleted.`, [
                      {
                        text: "OK",
                        onPress: () => {
                          loadGroups(); // Refresh group list
                        },
                      },
                    ]);
                  } catch (error) {
                    console.error("Failed to delete group:", error);
                  }
                },
              },
            ]);
          }}
        >
          <FontAwesome5 name="users" size={24} color="#9FB3DF" />
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>{group.name}</Text>
            <Text style={styles.cardSubtitle}>
              {group.members?.length || 0} members
            </Text>
            <Text style={styles.cardSubtitle}>
              Balance: {group.userBalance >= 0 ? '+' : ''}${group.userBalance.toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      ));
    }

    if (activeTab === "ACTIVITY") {
      if (activityLogs.length === 0) {
        return <Text style={styles.emptyText}>No recent activity yet.</Text>;
      }
      console.log("Rendering activity logs:", activityLogs);
      return activityLogs.map((log, index) => (
        <View key={`log-${index}`} style={styles.card}>
          <Feather name="clock" size={24} color="#9FB3DF" />
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>{log.description}</Text>
            {log.groupName && (
              <Text style={styles.cardSubtitle}>Group: {log.groupName}</Text>
            )}
            {log.timestamp && (
              <Text style={styles.cardSubtitle}>
                {new Date(log.timestamp.toDate()).toLocaleString()}
              </Text>
            )}
          </View>
        </View>
      ));
    }

    return (
      <View style={styles.card}>
        <Feather name="clock" size={24} color="#9FB3DF" />
        <View style={styles.textContent}>
          <Text style={styles.cardTitle}>No recent activity yet.</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="menu"
          size={24}
          color="#FAFAFA"
          style={styles.menuIcon}
          onPress={() => Alert.alert("Menu")}
        />
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color="#FAFAFA"
          style={styles.menuDots}
        />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] || "?"}</Text>
        </View>
        <Text style={styles.name}>{user?.name || "User"}</Text>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You are owed</Text>
          <Text style={styles.balanceAmount}>+${owedToYouTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You owe</Text>
          <Text style={styles.balanceAmount}>-${youOweTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={[
            styles.balanceAmount,
            { color: totalBalance >= 0 ? "#4CAF50" : "#F44336" }
          ]}>
            {totalBalance >= 0 ? "+" : "-"}${Math.abs(totalBalance).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {["FRIENDS", "GROUPS", "ACTIVITY"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tab, activeTab === tab && styles.tabActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.activityFeed}>
        {renderContent()}
      </ScrollView>

      {activeTab === "FRIENDS" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddFriend")}
        >
          <Ionicons name="person-add" size={30} color="#FAFAFA" />
        </TouchableOpacity>
      )}

      {activeTab === "GROUPS" && (
        <>
          <TouchableOpacity
            style={[styles.fab]}
            onPress={() => navigation.navigate("CreateGroup")}
          >
            <Ionicons name="people" size={30} color="#FAFAFA" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF8" },
  header: {
    backgroundColor: "#9EC6F3",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    position: "relative",
  },
  menuIcon: { position: "absolute", top: 60, left: 20 },
  menuDots: { position: "absolute", top: 60, right: 20 },
  avatar: {
    backgroundColor: "#FFF1D5",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  avatarText: { fontSize: 32, color: "#9EC6F3", fontWeight: "bold" },
  name: { fontSize: 16, color: "#FAFAFA", fontWeight: "500" },
  balanceCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#ccc",
    padding: 16,
    justifyContent: "space-between",
  },
  balanceItem: { alignItems: "center", flex: 1 },
  balanceLabel: { fontSize: 13, color: "#666", marginBottom: 4 },
  balanceAmount: { fontSize: 18, fontWeight: "bold", color: "#333" },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    marginBottom: 8,
  },
  tab: { fontSize: 14, fontWeight: "500", color: "#999" },
  tabActive: {
    color: "#9EC6F3",
    borderBottomWidth: 2,
    borderColor: "#9EC6F3",
    paddingBottom: 4,
  },
  activityFeed: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    gap: 12,
  },
  circleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#333" },
  cardSubtitle: { fontSize: 13, color: "#777", marginTop: 2 },
  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#9EC6F3",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
