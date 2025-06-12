import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

export const createEvent = async (groupId, eventData) => {
  const eventRef = await addDoc(collection(db, 'groups', groupId, 'events'), {
    ...eventData,
    attendees: [],
    createdAt: new Date()
  });
  return eventRef.id;
};

export const subscribeToGroupEvents = (groupId, callback) => {
  const q = query(
    collection(db, 'groups', groupId, 'events'),
    orderBy('date')
  );
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(events);
  });
};

export const rsvpToEvent = async (groupId, eventId, userId, attending) => {
  const eventRef = doc(db, 'groups', groupId, 'events', eventId);
  
  if (attending) {
    await updateDoc(eventRef, {
      attendees: arrayUnion(userId)
    });
  } else {
    await updateDoc(eventRef, {
      attendees: arrayRemove(userId)
    });
  }
};