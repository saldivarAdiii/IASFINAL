// src/firebase.tsx
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDz2JRlrlsr-AqcKVfCoLgNFmKXtIv_M3I",
  authDomain: "ias-finals-78563.firebaseapp.com",
  projectId: "ias-finals-78563",
  storageBucket: "ias-finals-78563.appspot.com",
  messagingSenderId: "86743610967",
  appId: "1:86743610967:web:2253252df9433b07cc9512",
  measurementId: "G-EKFR7CX9NX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Authentication
const db = getFirestore(app); // Initialize Firestore

export { auth, db }; // Export Auth and Firestore instances
