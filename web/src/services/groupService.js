import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export const getGroups = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to Date if needed
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error getting groups:', error);
    throw error;
  }
};

export const createGroup = async (groupData) => {
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      createdAt: serverTimestamp() // Use server timestamp
    });
    return { id: docRef.id, ...groupData };
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const deleteGroup = async (groupId) => {
  try {
    await deleteDoc(doc(db, 'groups', groupId));
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};