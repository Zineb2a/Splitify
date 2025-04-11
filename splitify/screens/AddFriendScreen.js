import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Contacts from "expo-contacts";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { useUser } from "../UserContext";
import { normalizePhone, formatPhoneNumber_1 } from "../utilities";

const AddFriendScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const navigation = useNavigation();
  const { user } = useUser();

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        const rawContacts = data
          .filter((c) => c.phoneNumbers?.length > 0)
          .map((c) => ({
            id: c.id,
            name: c.name,
            number: normalizePhone(c.phoneNumbers[0].number),
          }));

        const usersRef = collection(db, "users");

        const validContacts = [];
        for (const contact of rawContacts) {
          const q = query(usersRef, where("phone", "==", contact.number));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            validContacts.push(contact);
          }
        }

        // Filter out already-friends
        const friendsPhones = await getAlreadyFriendPhones(user.phone);
        const nonFriendContacts = validContacts.filter(
          (contact) => !friendsPhones.includes(contact.number)
        );

        setContacts(nonFriendContacts);
        setFiltered(nonFriendContacts);
      }
    })();
  }, []);

  const getAlreadyFriendPhones = async (userPhone) => {
    const friendshipsRef = collection(db, "friendships");

    const q1 = query(friendshipsRef, where("user1", "==", userPhone));
    const q2 = query(friendshipsRef, where("user2", "==", userPhone));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const friendNumbers = [];

    snap1.forEach((doc) => {
      const data = doc.data();
      friendNumbers.push(data.user2); // user1 is me, user2 is friend
    });

    snap2.forEach((doc) => {
      const data = doc.data();
      friendNumbers.push(data.user1); // user2 is me, user1 is friend
    });

    return friendNumbers;
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filteredList = contacts.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredList);
  };

  const handleAddFriend = async (contact) => {
    try {
      const friendshipsRef = collection(db, "friendships");

      await addDoc(friendshipsRef, {
        user1: user.phone,
        user2: contact.number,
        metadata: {
          [user.phone]: { name: user.name },
          [contact.number]: { name: contact.name },
        },
        createdAt: Timestamp.now(),
      });

      Alert.alert("Success", `${contact.name} added as a friend`);

      const updated = contacts.filter((c) => c.id !== contact.id);
      setContacts(updated);
      setFiltered(
        updated.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to add friend");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#9EC6F3"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Add a Friend</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Search contacts..."
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleAddFriend(item)}
          >
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.number}>
                {formatPhoneNumber_1(item.number)}
              </Text>
            </View>
            <Ionicons name="person-add" size={20} color="#9EC6F3" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default AddFriendScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF8",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9EC6F3",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  name: {
    fontWeight: "500",
    fontSize: 15,
    color: "#333",
  },
  number: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
});
