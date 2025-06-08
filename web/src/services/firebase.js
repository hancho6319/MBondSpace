// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
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
  orderBy
} from "firebase/firestore";
import { 
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAQF7cjyi9FK_okdcszyXGYVbxXT3CYCgY",
  authDomain: "mbondspace-9eb0d.firebaseapp.com",
  projectId: "mbondspace-9eb0d",
  storageBucket: "mbondspace-9eb0d.firebasestorage.app",
  messagingSenderId: "415798819059",
  appId: "1:415798819059:web:7f24235a05f28149f89f86",
  measurementId: "G-BWEQQRENRB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export all the Firebase services you'll need
export {
  auth,
  db,
  storage,
  // Auth functions
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  // Firestore functions
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
  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL
};

export default app;