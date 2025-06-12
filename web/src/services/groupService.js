import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  serverTimestamp
} from '../services/firebase';
import { db } from '../services/firebase';

// Get all groups for current user
export const getGroups = async (userId) => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting groups:", error);
    throw error;
  }
};

// Create a new group with server timestamp
export const createGroup = async (groupData) => {
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      createdAt: serverTimestamp() // Use server timestamp
    });
    return { id: docRef.id, ...groupData };
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

// Delete a group with validation
export const deleteGroup = async (groupId, userId) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await deleteDoc(groupRef);
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

// Add member with validation
export const addMember = async (groupId, userId, currentUserId) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding member:", error);
    throw error;
  }
};

// Remove member with validation
export const removeMember = async (groupId, userId, currentUserId) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error removing member:", error);
    throw error;
  }
};

// Search users by name or email
export const searchUsers = async (searchTerm) => {
  if (!searchTerm.trim()) return [];
  
  const q = query(
    collection(db, 'users'),
    where('keywords', 'array-contains', searchTerm.toLowerCase())
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};