// shared/firebase-config.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your Firebase config (same for both web and mobile)
const firebaseConfig = {
  apiKey: "AIzaSyAQF7cjyi9FK_okdcszyXGYVbxXT3CYCgY",
  authDomain: "mbondspace-9eb0d.firebaseapp.com",
  projectId: "mbondspace-9eb0d",
  storageBucket: "mbondspace-9eb0d.firebasestorage.app",
  messagingSenderId: "415798819059",
  appId: "1:415798819059:web:7f24235a05f28149f89f86",
  measurementId: "G-BWEQQRENRB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export everything needed by both web and mobile
export {
  app,
  auth,
  db,
  storage,
  // Auth
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  // Firestore
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  orderBy,
  // Storage
  ref,
  uploadBytes,
  getDownloadURL,
};