// mobile/services/firebase.js
// React Native requires some Firebase packages to be imported differently
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Import shared config but override auth for React Native
import { app, db, storage, ...others } from "../../../shared/firebase-config";

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, auth, db, storage, ...others };