import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper function to generate search keywords
const generateSearchKeywords = (name, bio = '') => {
  const nameParts = name.toLowerCase().split(' ');
  const bioKeywords = bio.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  
  // Include combinations of name parts and full name without spaces
  const nameKeywords = [
    ...nameParts,
    name.toLowerCase().replace(/\s+/g, ''),
    ...nameParts.map(part => part[0]) // Initials
  ];

  return [...new Set([...nameKeywords, ...bioKeywords])]; // Remove duplicates
};

export const getProfile = async (userId) => {
  const docRef = doc(db, 'profiles', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateProfile = async (userId, profileData, photoFile) => {
  const profileRef = doc(db, 'profiles', userId);
  
  // Generate search keywords from name and bio
  const searchKeywords = generateSearchKeywords(profileData.name, profileData.bio);
  
  let updates = { 
    ...profileData, 
    searchKeywords,
    updatedAt: new Date() 
  };

  if (photoFile) {
    const storageRef = ref(storage, `profile-photos/${userId}`);
    await uploadBytes(storageRef, photoFile);
    updates.photoURL = await getDownloadURL(storageRef);
  }

  await setDoc(profileRef, updates, { merge: true });
  return updates;
};