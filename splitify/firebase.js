// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your config object from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCgjE4eUSidFMMyufIo3ufQm75tx5_MwFo",
  authDomain: "splitify-9a9e5.firebaseapp.com",
  projectId: "splitify-9a9e5",
  storageBucket: "splitify-9a9e5.firebasestorage.app",
  messagingSenderId: "866380693887",
  appId: "1:866380693887:web:971f6ec36545e9a5781a4a",
  measurementId: "G-VJTY76T11T",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
