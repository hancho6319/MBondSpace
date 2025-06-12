import { db } from './firebase';
import { doc } from 'firebase/firestore';

import { 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateUserRole = async (userId, role) => {
  await updateDoc(doc(db, 'users', userId), {
    role
  });
};

export const deleteUser = async (userId) => {
  await deleteDoc(doc(db, 'users', userId));
};

export const getGroupAnalytics = async (groupId) => {
  const messagesQuery = query(
    collection(db, 'groups', groupId, 'messages')
  );
  const eventsQuery = query(
    collection(db, 'groups', groupId, 'events')
  );
  
  const [messagesSnapshot, eventsSnapshot] = await Promise.all([
    getDocs(messagesQuery),
    getDocs(eventsQuery)
  ]);
  
  return {
    messageCount: messagesSnapshot.size,
    eventCount: eventsSnapshot.size,
    activeMembers: 0 // Would implement actual logic
  };
};