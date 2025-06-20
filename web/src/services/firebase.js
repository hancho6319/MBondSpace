import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  limit,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  getDocs
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBrNqmh5XGBO2LX62d-w2ur2LeuQskPxzQ",
  authDomain: "mbondspace-6eeee.firebaseapp.com",
  projectId: "mbondspace-6eeee",
  storageBucket: "mbondspace-6eeee.appspot.com", // Changed from .firebasestorage.app to .appspot.com
  messagingSenderId: "420546664896",
  appId: "1:420546664896:web:1c2888874a7e01729e9025",
  measurementId: "G-KTR43N3D7Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  db,
  limit,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteDoc,
  getDocs
};