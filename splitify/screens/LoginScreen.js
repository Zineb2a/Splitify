import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase sign-in method
import { auth } from "../firebase"; // Import your Firebase configuration
import { Alert } from "react-native";
import { useUser } from "../UserContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { user, setUser } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Please fill in both fields.");
      return;
    }

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const db = getFirestore();
      const userDocRef = doc(db, "users", user.uid); // Access the user document
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser(userData); // Get the name from the Firestore document
        navigation.navigate("Dashboard");
      } else {
        console.log("Error: User data not found.");
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert(
          "Incorrect email and password combination. Please sign up or try again."
        );
      } else {
        Alert.alert("Login failed", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <Image
          source={require("../assets/logo.png")} // <- Replace with your logo
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>LOGIN</Text>
      </View>

      {/* Input fields */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Sign In button */}
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Bottom links */}
        <Text style={styles.text}>
          Don’t have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("SignUp")}
          >
            Sign up
          </Text>
        </Text>




      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF8",
  },
  header: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: "#FFF1D5",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  logo: {
    height: 80,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 22,
    color: "#9FB3DF",
    fontWeight: "bold",
  },
  form: {
    padding: 24,
    gap: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgot: {
    alignItems: "flex-end",
  },
  forgotText: {
    color: "#9FB3DF",
    fontSize: 13,
  },
  signInButton: {
    backgroundColor: "#9EC6F3",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    textAlign: "center",
    marginTop: 8,
    color: "#333",
  },
  link: {
    color: "#9FB3DF",
    fontWeight: "600",
  },
  or: {
    textAlign: "center",
    marginVertical: 12,
    color: "#999",
  },
  googleButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  googleText: {
    fontWeight: "500",
    color: "#444",
  },
});
