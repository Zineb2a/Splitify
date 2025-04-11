import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useUser } from "../UserContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("FRIENDS");
  const { user } = useUser();

  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const loadFriends = async () => {
    try {
      // Make sure we have the auth user ID
      if (!user || !user.uid) {
        console.error("No valid user.uid found:", user);
        setFriends([]);
        setLoadingFriends(false);
        return;
      }

      // Get all friendships
      const friendshipsRef = collection(db, "friendships");
      const snapshot = await getDocs(friendshipsRef);

      //console.log("Found friendships documents:", snapshot.size);

      const friendsList = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        //console.log("Processing friendship document:", doc.id, data);

        if (data) {
          const { user1, user2, metadata } = data;

          // If current user is user1, add user2 as friend
          if (user1 === user.phone && metadata && metadata[user2]) {
            //console.log("Adding user2 as friend:", user2, metadata[user2]);
            friendsList.push({
              phone: user2,
              name: metadata[user2].name || "Unknown",
            });
          }

          // If current user is user2, add user1 as friend
          else if (user2 === user.phone && metadata && metadata[user1]) {
            //console.log("Adding user1 as friend:", user1, metadata[user1]);
            friendsList.push({
              phone: user1,
              name: metadata[user1].name || "Unknown",
            });
          }
        }
      });

      //console.log("Final friends list:", friendsList);
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
      const groupsRef = collection(db, "users", user.uid, "groups");
      const snapshot = await getDocs(groupsRef);
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(loaded);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  // This will refresh data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      //console.log("Dashboard screen is focused, refreshing data");
      if (user?.uid) {
        setLoadingFriends(true);
        setLoadingGroups(true);
        loadFriends();
        loadGroups();
      }
      return () => {
        // Cleanup function if needed
      };
    }, [user])
  );

  // Initial load
  useEffect(() => {
    if (user?.uid) {
      loadFriends();
      loadGroups();
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
            No friends found. Your user phone: {user?.phone}
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
              amount: "$0",
              youOwe: false,
              entries: [],
            })
          }
        >
          <View style={[styles.circleAvatar, { borderColor: "#4CAF50" }]}>
            <Text style={[styles.circleText, { color: "#4CAF50" }]}>
              {friend.name?.[0] || "?"}
            </Text>
          </View>
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>{friend.name}</Text>
            <Text style={styles.cardSubtitle}>{friend.phone}</Text>
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
          key={`group-${group.id}-${index}`}
          style={styles.card}
          onPress={() =>
            navigation.navigate("GroupDetail", {
              groupId: group.id,
              groupName: group.name,
              members: group.members,
            })
          }
        >
          <FontAwesome5 name="users" size={24} color="#9FB3DF" />
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>{group.name}</Text>
            <Text style={styles.cardSubtitle}>
              {group.members?.length || 0} members
            </Text>
          </View>
        </TouchableOpacity>
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
      {/* Header */}
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

      {/* Balances */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You are owed</Text>
          <Text style={styles.balanceAmount}>$0</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You owe</Text>
          <Text style={styles.balanceAmount}>$0</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>$0</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {["FRIENDS", "GROUPS", "ACTIVITY"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tab, activeTab === tab && styles.tabActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.activityFeed}>
        {renderContent()}
      </ScrollView>

      {/* Floating Action Buttons */}
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
