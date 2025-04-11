import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../UserContext";
import {
  collection,
  addDoc,
  doc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Ionicons } from "@expo/vector-icons";
import { formatPhoneNumber_2 } from "../utilities";

const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();

  const [friends, setFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [members, setMembers] = useState([]);

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

  // Initial load
  useEffect(() => {
    if (user?.uid) {
      loadFriends();
    }
  }, [user]);

  const handleAddContact = async () => {
    const phone = phoneInput.trim();
    if (!phone.match(/^\d{9,15}$/)) {
      Alert.alert("Invalid number", "Please enter a valid phone number");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      let found = false;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.phone === phone) {
          setMembers((prev) => [...prev, { phone, name: data.name }]);
          found = true;
        }
      });

      if (!found) {
        Alert.alert("User not found", "This phone number is not registered.");
      }
      setPhoneInput("");
    } catch (error) {
      console.error("Error fetching contact:", error);
      Alert.alert("Error", "Something went wrong while validating the number.");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || members.length === 0) {
      Alert.alert(
        "Missing Info",
        "Please add a group name and at least one member."
      );
      return;
    }

    try {
      // Ensure current user is added to the group members
      const updatedMembers = [...members];
      const alreadyIncluded = members.some(m => m.phone === user.phone);
      if (!alreadyIncluded) {
        updatedMembers.push({ phone: user.phone, name: user.name });
      }

      await addDoc(collection(db, "groups"), {
        name: groupName,
        members: updatedMembers,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
      });

      navigation.navigate("Dashboard");
    } catch (error) {
      Alert.alert("Error", "Could not create group.");
      console.error(error);
    }
  };

  const handleAddGroupExpense = async (groupId, payerPhone, splitBetween, amount, category, reason, date = new Date()) => {
    try {
      if (!groupId || !payerPhone || !splitBetween || !amount || !category || !reason) {
        Alert.alert("Missing Fields", "Please fill all required fields for the expense.");
        return;
      }

      const expenseData = {
        groupId,
        payerPhone,
        splitBetween,
        amount,
        category,
        reason,
        date: Timestamp.fromDate(date),
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "group_expenses"), expenseData);
      Alert.alert("Success", "Expense added successfully.");
    } catch (error) {
      console.error("Error adding group expense:", error);
      Alert.alert("Error", "Could not add group expense.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with back arrow */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backArrow}
      >
        <Ionicons name="arrow-back" size={24} color="#9EC6F3" />
      </TouchableOpacity>

      <Text style={styles.title}>Create Group</Text>

      <Text style={styles.label}>Group Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Euro Trip"
        value={groupName}
        onChangeText={setGroupName}
      />

      <Text style={styles.label}>Select Members (Your Friends)</Text>
      {friends.map((friend, idx) => {
        const isSelected = members.some((m) => m.phone === friend.phone);
        const toggleSelection = () => {
          if (isSelected) {
            // Remove from members
            setMembers((prev) => prev.filter((m) => m.phone !== friend.phone));
          } else {
            // Add to members
            setMembers((prev) => [...prev, friend]);
          }
        };

        return (
          <TouchableOpacity
            key={idx}
            onPress={toggleSelection}
            style={[styles.memberChip, isSelected && styles.friendItemSelected]}
          >
            <Text style={styles.memberText}>
              {friend.name} ({formatPhoneNumber_2(friend.phone)})
            </Text>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createText}>Create Group</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFDF8",
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 100,
  },
  backArrow: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#9EC6F3",
    marginBottom: 20,
    alignSelf: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: 16,
  },
  memberChip: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  memberText: {
    fontSize: 14,
    color: "#333",
  },
  createButton: {
    backgroundColor: "#9EC6F3",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 40,
  },
  createText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
