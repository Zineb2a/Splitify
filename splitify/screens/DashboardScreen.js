import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../UserContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("FRIENDS");
  const { user } = useUser();

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const loadFriends = async () => {
    try {
      const friendsRef = collection(db, "users", user.uid, "friends");
      const snapshot = await getDocs(friendsRef);
      const loadedFriends = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFriends(loadedFriends);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const renderContent = () => {
    if (activeTab === "FRIENDS") {
      return (
        <>
          {friends.length === 0 && !loadingFriends ? (
            <Text style={styles.emptyText}>No friends added yet.</Text>
          ) : (
            friends.map((friend, index) => (
              <TouchableOpacity
                key={index}
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
                    {friend.name[0]}
                  </Text>
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.cardTitle}>{friend.name}</Text>
                  <Text style={styles.cardSubtitle}>{friend.phone}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </>
      );
    }

    if (activeTab === "GROUPS") {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("SettleUpGroupSelect")}
        >
          <FontAwesome5 name="mountain" size={24} color="#9FB3DF" />
          <View style={styles.textContent}>
            <Text style={styles.cardTitle}>Sample Group</Text>
            <Text style={styles.cardSubtitle}>You owe John</Text>
          </View>
          <Text style={styles.amount}>$500</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.card}>
        <Feather name="shopping-bag" size={24} color="#9FB3DF" />
        <View style={styles.textContent}>
          <Text style={styles.cardTitle}>Activity feed coming soon</Text>
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
          <Text style={styles.avatarText}>{user.name[0]}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
      </View>

      {/* Balance Summary */}
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

      {/* FAB Add Friend / Add Group */}
      {activeTab === "FRIENDS" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddFriend")}
        >
          <Ionicons name="person-add" size={30} color="#FAFAFA" />
        </TouchableOpacity>
      )}
      {activeTab === "GROUPS" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("CreateGroup")}
        >
          <Ionicons name="people" size={30} color="#FAFAFA" />
        </TouchableOpacity>
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
  amount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
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
  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});